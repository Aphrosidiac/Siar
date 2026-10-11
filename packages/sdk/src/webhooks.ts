import { createHmac, timingSafeEqual } from 'node:crypto';
import { SiarWebhookError } from './errors.js';

/** Header names Siar sends with every webhook delivery. */
export const WEBHOOK_HEADERS = {
  signature: 'x-siar-signature',
  timestamp: 'x-siar-timestamp',
  event: 'x-siar-event',
  delivery: 'x-siar-delivery',
} as const;

export type WebhookEventType =
  | 'post.published' | 'comment.published' | 'team.created' | 'team.updated' | 'team.deleted'
  | 'social-account.created' | 'social-account.updated' | 'social-account.deleted'
  | 'credit.low-balance' | 'credit.exhausted' | 'comment.received'
  | 'conversation.created' | 'conversation.updated' | 'conversation.message.created'
  | 'conversation.message.updated' | 'conversation.read.updated';

/** The JSON body of a webhook delivery. */
export interface SiarWebhookEvent<T = unknown> {
  /** Event id (stable across redeliveries of the same event). */
  id: string;
  type: WebhookEventType | (string & {});
  createdAt: string;
  organizationId: string;
  data: T;
  /** From x-siar-delivery: unique per delivery attempt chain — use it for idempotency. */
  deliveryId?: string;
}

/** Headers as a Fetch `Headers`, a Node `IncomingHttpHeaders`, or a plain object. */
export type HeaderBag = Headers | Record<string, string | string[] | undefined>;

function header(h: HeaderBag, name: string): string | undefined {
  if (typeof (h as Headers).get === 'function') return (h as Headers).get(name) ?? undefined;
  const rec = h as Record<string, string | string[] | undefined>;
  const key = Object.keys(rec).find(k => k.toLowerCase() === name);
  const v = key === undefined ? undefined : rec[key];
  return Array.isArray(v) ? v[0] : v;
}

const toText = (raw: string | Uint8Array) => (typeof raw === 'string' ? raw : new TextDecoder().decode(raw));

/** Hex HMAC-SHA256(secret, `${timestamp}.${rawBody}`) — the value of x-siar-signature. */
export function computeSignature(secret: string, timestamp: number | string, rawBody: string | Uint8Array): string {
  return createHmac('sha256', secret).update(`${timestamp}.`).update(typeof rawBody === 'string' ? rawBody : Buffer.from(rawBody)).digest('hex');
}

function safeEqualHex(a: string, b: string): boolean {
  const x = Buffer.from(a, 'utf8');
  const y = Buffer.from(b, 'utf8');
  if (x.length !== y.length) {
    timingSafeEqual(x, x); // keep the timing shape similar
    return false;
  }
  return timingSafeEqual(x, y);
}

/**
 * Webhook signature helpers. Always verify against the RAW request body (the exact bytes received),
 * not a re-serialised JSON object.
 */
export class Webhooks {
  /**
   * Checks the signature and timestamp. Throws SiarWebhookError (with a `reason`) when the delivery
   * cannot be trusted; returns nothing when it can.
   */
  assertValid(rawBody: string | Uint8Array, headers: HeaderBag, secret: string, toleranceSeconds = 300): void {
    if (!secret) throw new SiarWebhookError('No webhook secret given.', 'missing_header');
    const sig = header(headers, WEBHOOK_HEADERS.signature)?.trim();
    const tsRaw = header(headers, WEBHOOK_HEADERS.timestamp)?.trim();
    if (!sig) throw new SiarWebhookError('Missing x-siar-signature header.', 'missing_header');
    if (!tsRaw) throw new SiarWebhookError('Missing x-siar-timestamp header.', 'missing_header');
    if (!/^\d+$/.test(tsRaw)) throw new SiarWebhookError('x-siar-timestamp is not a unix timestamp.', 'bad_timestamp');
    const ts = Number(tsRaw);
    if (toleranceSeconds > 0 && Math.abs(Date.now() / 1000 - ts) > toleranceSeconds) {
      throw new SiarWebhookError(`Timestamp is outside the ${toleranceSeconds}s tolerance (possible replay).`, 'expired');
    }
    const expected = computeSignature(secret, tsRaw, rawBody);
    if (!safeEqualHex(expected, sig.toLowerCase())) throw new SiarWebhookError('Webhook signature does not match.', 'bad_signature');
  }

  /** True when the signature is valid and the timestamp is within tolerance. Never throws. */
  verify(rawBody: string | Uint8Array, headers: HeaderBag, secret: string, toleranceSeconds = 300): boolean {
    try {
      this.assertValid(rawBody, headers, secret, toleranceSeconds);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Verifies the delivery and returns the parsed event. Throws SiarWebhookError on a missing or bad
   * signature, an expired timestamp, or a body that is not JSON.
   *
   * ```ts
   * app.post('/webhooks/siar', express.raw({ type: 'application/json' }), (req, res) => {
   *   const event = siar.webhooks.constructEvent(req.body, req.headers, process.env.SIAR_WEBHOOK_SECRET!);
   *   if (event.type === 'post.published') …
   *   res.sendStatus(200);
   * });
   * ```
   */
  constructEvent<T = unknown>(rawBody: string | Uint8Array, headers: HeaderBag, secret: string, toleranceSeconds = 300): SiarWebhookEvent<T> {
    this.assertValid(rawBody, headers, secret, toleranceSeconds);
    let parsed: unknown;
    try {
      parsed = JSON.parse(toText(rawBody));
    } catch {
      throw new SiarWebhookError('Webhook body is not valid JSON.', 'bad_payload');
    }
    if (!parsed || typeof parsed !== 'object') throw new SiarWebhookError('Webhook body is not an object.', 'bad_payload');
    const event = parsed as SiarWebhookEvent<T>;
    const deliveryId = header(headers, WEBHOOK_HEADERS.delivery);
    if (!event.type) {
      const t = header(headers, WEBHOOK_HEADERS.event);
      if (t) event.type = t;
    }
    return deliveryId ? { ...event, deliveryId } : event;
  }

  /** Builds the headers Siar would send — for testing your own webhook endpoint. */
  sign(rawBody: string, secret: string, opts: { timestamp?: number; event?: string; deliveryId?: string } = {}): Record<string, string> {
    const ts = opts.timestamp ?? Math.floor(Date.now() / 1000);
    return {
      [WEBHOOK_HEADERS.timestamp]: String(ts),
      [WEBHOOK_HEADERS.signature]: computeSignature(secret, ts, rawBody),
      ...(opts.event ? { [WEBHOOK_HEADERS.event]: opts.event } : {}),
      ...(opts.deliveryId ? { [WEBHOOK_HEADERS.delivery]: opts.deliveryId } : {}),
    };
  }
}

/** Standalone helpers (no client needed). */
export const webhooks = new Webhooks();
