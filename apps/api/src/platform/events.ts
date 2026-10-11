import { randomUUID } from 'node:crypto';
import type { Db } from './db.js';
import { enqueue, JOBS } from './queue.js';

export const WEBHOOK_EVENTS = [
  'post.published', 'comment.published', 'team.created', 'team.updated', 'team.deleted',
  'social-account.created', 'social-account.updated', 'social-account.deleted',
  'credit.low-balance', 'credit.exhausted', 'comment.received',
  'conversation.created', 'conversation.updated', 'conversation.message.created', 'conversation.message.updated', 'conversation.read.updated',
] as const;
export type WebhookEvent = (typeof WEBHOOK_EVENTS)[number];

/**
 * Record an event for every subscribed webhook of the organization, inside the caller's
 * transaction. Delivery happens in the worker (engine/webhooks.ts): signed POST, retries with
 * backoff, every attempt logged. Returns the delivery ids so the caller can nudge the queue.
 */
export async function emit(db: Db, organizationId: string, event: WebhookEvent, data: unknown) {
  const hooks = await db.webhook.findMany({ where: { organizationId, active: true, deletedAt: null, events: { has: event } }, select: { id: true } });
  if (!hooks.length) return [];
  const eventId = `evt_${randomUUID().replace(/-/g, '')}`;
  const payload = JSON.parse(JSON.stringify({ id: eventId, type: event, createdAt: new Date().toISOString(), organizationId, data }));
  const ids: string[] = [];
  for (const h of hooks) {
    const d = await db.webhookDelivery.create({ data: { webhookId: h.id, eventId, event, payload, nextAttemptAt: new Date() } });
    ids.push(d.id);
  }
  return ids;
}

/** After commit: hand the deliveries to the worker right away (the minute sweep is the safety net). */
export async function flushDeliveries(ids: string[]) {
  for (const id of ids) await enqueue(JOBS.deliverWebhook, { deliveryId: id }, { singletonKey: `wh:${id}`, startAfter: 500 });
}

/** In-app notification for the organization's members (optionally only some roles). */
export async function notify(db: Db, organizationId: string, n: { kind: string; title: string; body?: string; link?: string }, roles?: ('OWNER' | 'ADMIN' | 'MEMBER')[]) {
  const members = await db.organizationMember.findMany({ where: { organizationId, ...(roles ? { role: { in: roles } } : {}) }, select: { userId: true } });
  if (!members.length) return;
  await db.notification.createMany({ data: members.map(m => ({ userId: m.userId, organizationId, kind: n.kind, title: n.title, body: n.body, link: n.link })) });
}
