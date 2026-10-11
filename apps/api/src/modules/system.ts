import { randomBytes } from 'node:crypto';
import { ADAPTERS, type NetworkType } from '@siar/networks';
import { config } from '../platform/config.js';
import { encrypt, decrypt } from '../platform/crypto.js';
import { prisma } from '../platform/db.js';
import { audit } from '../platform/audit.js';
import { WEBHOOK_EVENTS } from '../platform/events.js';
import { badRequest, forbidden, notFound } from '../platform/errors.js';
import { listOf, pageOf } from '../platform/http.js';
import { isConfigured } from '../platform/networks.js';
import { redis } from '../platform/redis.js';
import { requirePermission, type Actor } from '../platform/auth.js';
import { define } from '../platform/routes.js';
import { RESOURCE_LIMITS } from '../domain/plans.js';
import { deliver } from '../engine/webhooks.js';

define({
  /** Health: database, redis, and which networks this server can use. */
  'app.getHealth': async () => {
    const db = await prisma.$queryRaw`SELECT 1`.then(() => true).catch(() => false);
    const r = await redis.ping().then(x => x === 'PONG').catch(() => false);
    const platforms = Object.fromEntries((Object.keys(ADAPTERS) as NetworkType[]).map(t => [t, { available: isConfigured(t), mode: config.NETWORK_MODE }]));
    return { status: db && r ? 'ok' : 'degraded', createdAt: new Date().toISOString(), note: db && r ? 'All systems operational.' : `Degraded: ${!db ? 'database ' : ''}${!r ? 'redis' : ''}`.trim(), platforms };
  },
});

// ───────────────────────── webhooks ─────────────────────────

const newSecret = () => `whsec_${randomBytes(24).toString('base64url')}`;
const wh = (w: any, reveal = false) => ({ id: w.id, url: w.url, events: w.events, active: w.active, secret: reveal ? decrypt(w.secretEnc) : `whsec_…${decrypt(w.secretEnc).slice(-4)}`, createdAt: w.createdAt.toISOString(), updatedAt: w.updatedAt.toISOString() });
const delivery = (d: any) => ({ id: d.id, event: d.event, eventId: d.eventId, attempt: d.attempt, status: d.status, responseCode: d.responseCode, responseBody: d.responseBody, durationMs: d.durationMs, nextAttemptAt: d.nextAttemptAt?.toISOString() ?? null, createdAt: d.createdAt.toISOString(), payload: d.payload });

function checkUrl(url: string) {
  let u: URL;
  try { u = new URL(url); } catch { throw badRequest('url must be a valid URL.', [{ code: 'invalid', message: 'Invalid URL', path: ['url'] }]); }
  if (config.NODE_ENV === 'production' && u.protocol !== 'https:') throw badRequest('Webhook URLs must use https.', [{ code: 'invalid', message: 'Use https', path: ['url'] }]);
  if (config.NODE_ENV === 'production' && /^(localhost|127\.|10\.|192\.168\.|169\.254\.)/.test(u.hostname)) throw badRequest('Webhook URLs must be publicly reachable.', [{ code: 'invalid', message: 'Private address', path: ['url'] }]);
}
const checkEvents = (events: string[]) => {
  const bad = events.filter(e => !(WEBHOOK_EVENTS as readonly string[]).includes(e));
  if (bad.length || !events.length) throw badRequest(bad.length ? `Unknown event: ${bad[0]}` : 'Pick at least one event.', [{ code: 'invalid', message: 'Invalid events', path: ['events'] }]);
};
async function webhookOf(actor: Actor, id: string) {
  requirePermission(actor, 'webhooks');
  const w = await prisma.webhook.findFirst({ where: { id, organizationId: actor.organizationId, deletedAt: null } });
  if (!w) throw notFound('Webhook');
  return w;
}

define({
  'webhook.list': async ({ actor, query }) => {
    requirePermission(actor, 'webhooks');
    const p = pageOf(query);
    const where = { organizationId: actor.organizationId, deletedAt: null };
    const [rows, total] = await Promise.all([prisma.webhook.findMany({ where, orderBy: { createdAt: 'asc' }, ...p }), prisma.webhook.count({ where })]);
    return listOf(rows.map(w => wh(w)), total);
  },
  'webhook.create': async ({ actor, body }) => {
    requirePermission(actor, 'webhooks');
    checkUrl(body.url); checkEvents(body.events);
    const n = await prisma.webhook.count({ where: { organizationId: actor.organizationId, deletedAt: null } });
    if (n >= RESOURCE_LIMITS.webhooks) throw forbidden(`Webhooks limit reached. Limit is ${RESOURCE_LIMITS.webhooks} webhooks.`);
    const w = await prisma.$transaction(async tx => {
      const w = await tx.webhook.create({ data: { organizationId: actor.organizationId, url: body.url, events: [...new Set<string>(body.events)], active: body.active ?? true, secretEnc: encrypt(newSecret()) } });
      await audit(tx, actor, 'webhook.create', 'Webhook', w.id, `Added webhook ${w.url}`);
      return w;
    });
    return wh(w, true);
  },
  'webhook.get': async ({ actor, params }) => wh(await webhookOf(actor, params.id), true),
  'webhook.update': async ({ actor, params, body }) => {
    await webhookOf(actor, params.id);
    if (body.url) checkUrl(body.url);
    if (body.events) checkEvents(body.events);
    const data: Record<string, unknown> = {};
    for (const k of ['url', 'events', 'active']) if (k in body) data[k] = body[k];
    return wh(await prisma.webhook.update({ where: { id: params.id }, data }), true);
  },
  'webhook.delete': async ({ actor, params }) => {
    const w = await webhookOf(actor, params.id);
    await prisma.$transaction(async tx => {
      await tx.webhook.update({ where: { id: w.id }, data: { deletedAt: new Date(), active: false } });
      await audit(tx, actor, 'webhook.delete', 'Webhook', w.id, `Removed webhook ${w.url}`);
    });
    return { success: true };
  },
  'webhook.rotateSecret': async ({ actor, params }) => {
    await webhookOf(actor, params.id);
    return wh(await prisma.webhook.update({ where: { id: params.id }, data: { secretEnc: encrypt(newSecret()) } }), true);
  },
  'webhook.test': async ({ actor, params }) => {
    const w = await webhookOf(actor, params.id);
    const d = await prisma.webhookDelivery.create({ data: { webhookId: w.id, eventId: `evt_test_${Date.now()}`, event: 'test', payload: { id: `evt_test_${Date.now()}`, type: 'test', createdAt: new Date().toISOString(), organizationId: actor.organizationId, data: { message: 'This is a test event from Siar.' } }, nextAttemptAt: new Date() } });
    await deliver(d.id);
    return delivery(await prisma.webhookDelivery.findUniqueOrThrow({ where: { id: d.id } }));
  },
  'webhook.deliveries': async ({ actor, params, query }) => {
    await webhookOf(actor, params.id);
    const p = pageOf(query);
    const where = { webhookId: params.id, ...(query.status ? { status: String(query.status) } : {}) };
    const [rows, total] = await Promise.all([prisma.webhookDelivery.findMany({ where, orderBy: { createdAt: 'desc' }, ...p }), prisma.webhookDelivery.count({ where })]);
    return listOf(rows.map(delivery), total);
  },
  'webhook.resend': async ({ actor, params }) => {
    await webhookOf(actor, params.id);
    const d = await prisma.webhookDelivery.findFirst({ where: { id: params.deliveryId, webhookId: params.id } });
    if (!d) throw notFound('Delivery');
    const copy = await prisma.webhookDelivery.create({ data: { webhookId: d.webhookId, eventId: d.eventId, event: d.event, payload: d.payload as object, nextAttemptAt: new Date() } });
    await deliver(copy.id);
    return delivery(await prisma.webhookDelivery.findUniqueOrThrow({ where: { id: copy.id } }));
  },
});

// ───────────────────────── notifications (per user) ─────────────────────────

define({
  'notification.list': async ({ actor, query }) => {
    if (actor.kind !== 'USER') return { items: [], total: 0, unread: 0 };
    const p = pageOf(query);
    const base = { userId: actor.userId, OR: [{ organizationId: actor.organizationId }, { organizationId: null }] };
    const where = { ...base, ...(query.unread === true || query.unread === 'true' ? { readAt: null } : {}), ...(query.q ? { title: { contains: String(query.q), mode: 'insensitive' as const } } : {}) };
    const [rows, total, unread] = await Promise.all([prisma.notification.findMany({ where, orderBy: { createdAt: 'desc' }, ...p }), prisma.notification.count({ where }), prisma.notification.count({ where: { ...base, readAt: null } })]);
    return { items: rows.map(n => ({ id: n.id, title: n.title, body: n.body, link: n.link, kind: n.kind, readAt: n.readAt?.toISOString() ?? null, createdAt: n.createdAt.toISOString() })), total, unread };
  },
  'notification.read': async ({ actor, params }) => {
    if (actor.kind !== 'USER') return { success: true };
    await prisma.notification.updateMany({ where: { id: params.id, userId: actor.userId }, data: { readAt: new Date() } });
    return { success: true };
  },
  'notification.readAll': async ({ actor }) => {
    if (actor.kind !== 'USER') return { success: true };
    await prisma.notification.updateMany({ where: { userId: actor.userId, readAt: null }, data: { readAt: new Date() } });
    return { success: true };
  },
});
