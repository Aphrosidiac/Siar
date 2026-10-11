import { decrypt, hmac } from '../platform/crypto.js';
import { prisma } from '../platform/db.js';
import { logger } from '../platform/logger.js';
import { enqueue, JOBS } from '../platform/queue.js';

/**
 * Webhook delivery. POST the event JSON with:
 *   x-siar-event        event type
 *   x-siar-delivery     delivery id (idempotency on the receiver side)
 *   x-siar-timestamp    unix seconds
 *   x-siar-signature    hex HMAC-SHA256(secret, `${timestamp}.${rawBody}`)
 * 2xx = delivered. Otherwise retried with backoff — 1m, 5m, 30m, 2h, 6h, 12h, 24h — then FAILED.
 */
const BACKOFF_MIN = [1, 5, 30, 120, 360, 720, 1440];

export function signature(secret: string, timestamp: number, body: string) {
  return hmac(secret, `${timestamp}.${body}`);
}

export async function deliver(deliveryId: string) {
  const d = await prisma.webhookDelivery.findUnique({ where: { id: deliveryId }, include: { webhook: true } });
  if (!d || d.status !== 'PENDING' || d.webhook.deletedAt) return 'skipped';
  // Claim this attempt so a sweep and a direct job cannot both send it.
  const claimed = await prisma.webhookDelivery.updateMany({ where: { id: d.id, status: 'PENDING', attempt: d.attempt }, data: { attempt: { increment: 1 }, nextAttemptAt: null } });
  if (!claimed.count) return 'skipped';
  const body = JSON.stringify(d.payload);
  const ts = Math.floor(Date.now() / 1000);
  const started = Date.now();
  let code: number | null = null; let text = '';
  try {
    const res = await fetch(d.webhook.url, {
      method: 'POST', redirect: 'manual', signal: AbortSignal.timeout(15_000),
      headers: { 'content-type': 'application/json', 'user-agent': 'Siar-Webhooks/1.0', 'x-siar-event': d.event, 'x-siar-delivery': d.id, 'x-siar-timestamp': String(ts), 'x-siar-signature': signature(decrypt(d.webhook.secretEnc), ts, body) },
      body,
    });
    code = res.status; text = (await res.text().catch(() => '')).slice(0, 2000);
  } catch (err) { const c = (err as any)?.cause; text = `Request failed: ${(err as Error).message}${c ? ` (${c.code ?? c.message})` : ''}`; }
  const ok = code !== null && code >= 200 && code < 300;
  const attempt = d.attempt + 1;
  const next = !ok && attempt <= BACKOFF_MIN.length ? new Date(Date.now() + BACKOFF_MIN[attempt - 1] * 60_000) : null;
  await prisma.webhookDelivery.update({ where: { id: d.id }, data: { status: ok ? 'SUCCESS' : next ? 'PENDING' : 'FAILED', responseCode: code, responseBody: text, durationMs: Date.now() - started, nextAttemptAt: next } });
  if (!ok) logger.info({ deliveryId: d.id, code, attempt }, 'webhook delivery failed');
  return ok ? 'delivered' : 'failed';
}

export async function retryDue() {
  const due = await prisma.webhookDelivery.findMany({ where: { status: 'PENDING', nextAttemptAt: { lte: new Date() } }, select: { id: true }, take: 500 });
  for (const d of due) await enqueue(JOBS.deliverWebhook, { deliveryId: d.id }, { singletonKey: `wh:${d.id}:${Date.now() >> 16}`, retryLimit: 0 });
  return due.length;
}
