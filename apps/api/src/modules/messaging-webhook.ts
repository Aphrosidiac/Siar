import { createHmac, timingSafeEqual } from 'node:crypto';
import type { FastifyInstance } from 'fastify';
import type { FetchedCommentInput, InboundMessage, NetworkType } from '@siar/networks';
import type { SocialAccount } from '../generated/prisma/client.js';
import { config } from '../platform/config.js';
import { prisma } from '../platform/db.js';
import type { WebhookEvent } from '../platform/events.js';
import { logger } from '../platform/logger.js';
import { adapter } from '../platform/networks.js';
import { enqueue, JOBS } from '../platform/queue.js';
import { fillParticipant, upsertConversation } from './messaging-conversations.js';
import { dispatchTriggers, kickStaleExecutions, type TriggerEvent } from './messaging-automations.js';
import { conversation, fetchedComment, message, publish } from './messaging-shared.js';

/**
 * Meta webhooks (Instagram + Facebook Page): one endpoint for messages, echoes, postbacks and
 * comments. The request is verified (X-Hub-Signature-256) and answered 200 at once; the work runs
 * in a job: parse with the adapter, upsert conversations/messages (deduped on externalMessageId),
 * store new comments (comment.received), and fire automations.
 */

const PATH = '/api/v1/webhooks/meta';
const log = logger.child({ module: 'meta-webhook' });

/** Which adapter parses a delivery: `object` is "instagram" or "page". */
export const platformOfObject = (o: unknown): 'INSTAGRAM' | 'FACEBOOK' | null => (o === 'instagram' ? 'INSTAGRAM' : o === 'page' ? 'FACEBOOK' : null);

const mock = () => config.NETWORK_MODE === 'mock';

export function verifyToken(token: unknown) {
  const want = process.env.NETWORK_META_WEBHOOK_VERIFY_TOKEN;
  if (typeof token !== 'string' || !token) return false;
  if (mock() && token === 'mock') return true;
  return !!want && token.length === want.length && timingSafeEqual(Buffer.from(token), Buffer.from(want));
}

/** HMAC-SHA256 of the raw body with the app secret (Facebook app, or the separate Instagram Login app). */
export function verifySignature(raw: Buffer, header: unknown) {
  if (typeof header !== 'string' || !header.startsWith('sha256=')) return false;
  if (mock() && header === 'sha256=mock') return true;
  const got = Buffer.from(header.slice(7), 'hex');
  for (const secret of [process.env.NETWORK_FACEBOOK_CLIENT_SECRET, process.env.NETWORK_INSTAGRAM_CLIENT_SECRET, process.env.NETWORK_INSTAGRAM_INSTAGRAM_CLIENT_SECRET]) {
    if (!secret) continue;
    const want = createHmac('sha256', secret).update(raw).digest();
    if (got.length === want.length && timingSafeEqual(got, want)) return true;
  }
  return false;
}

export async function metaWebhookRoutes(app: FastifyInstance) {
  await app.register(async sub => {
    // The signature covers the exact bytes Meta sent, so this route keeps the raw body.
    sub.removeContentTypeParser('application/json');
    sub.addContentTypeParser('application/json', { parseAs: 'buffer' }, (_req, body, done) => done(null, body));

    sub.get(PATH, async (req, reply) => {
      const q = req.query as Record<string, string>;
      if (q['hub.mode'] === 'subscribe' && verifyToken(q['hub.verify_token'])) return reply.type('text/plain').send(q['hub.challenge'] ?? '');
      return reply.status(403).send({ statusCode: 403, message: 'Webhook verification failed: hub.verify_token does not match.' });
    });

    sub.post(PATH, async (req, reply) => {
      const raw = Buffer.isBuffer(req.body) ? req.body : Buffer.from(typeof req.body === 'string' ? req.body : JSON.stringify(req.body ?? {}));
      if (!verifySignature(raw, req.headers['x-hub-signature-256'])) return reply.status(401).send({ statusCode: 401, message: 'Invalid X-Hub-Signature-256.' });
      let body: any;
      try { body = JSON.parse(raw.toString('utf8')); } catch { return reply.status(400).send({ statusCode: 400, message: 'Body is not JSON.' }); }
      const platform = platformOfObject(body?.object);
      if (!platform) return reply.send('EVENT_RECEIVED'); // other subscriptions: acknowledge, ignore
      const queued = await enqueue(JOBS.runAutomation, { kind: 'meta-webhook', platform, body }, { retryLimit: 3 });
      if (!queued) setImmediate(() => void ingestMetaWebhook(platform, body).catch(err => log.error({ err }, 'ingest failed')));
      return reply.send('EVENT_RECEIVED');
    });
  });
}

// ───────────────────────────── ingestion ─────────────────────────────

export interface IngestResult { accounts: number; messages: number; duplicates: number; comments: number; executions: string[] }

/** Process one delivery. Idempotent: redelivered messages/comments are recognised by their external ids. */
export async function ingestMetaWebhook(platform: 'INSTAGRAM' | 'FACEBOOK', body: unknown): Promise<IngestResult> {
  const r: IngestResult = { accounts: 0, messages: 0, duplicates: 0, comments: 0, executions: [] };
  const m = adapter(platform as NetworkType).messaging;
  if (!m) { log.warn({ platform }, 'no messaging adapter; webhook ignored'); return r; }
  const entries = m.parseWebhook(body);
  for (const e of entries) {
    // The same page/IG account can be connected in several teams (or organizations): each gets its copy.
    const accounts = await prisma.socialAccount.findMany({ where: { type: platform, deletedAt: null, OR: [{ externalId: e.accountExternalId }, { channelId: e.accountExternalId }] }, include: { team: { include: { organization: true } } } });
    for (const a of accounts) {
      if (a.team.deletedAt || a.team.organization.deletedAt) continue;
      r.accounts++;
      const orgId = a.team.organizationId;
      const dmOn = a.team.organization.messagingEnabled && a.messagingStatus === 'ENABLED';
      if (dmOn) for (const msg of e.messages) {
        const out = await ingestMessage(a, orgId, msg);
        if (out === 'duplicate') r.duplicates++; else { r.messages++; r.executions.push(...out); }
      }
      for (const c of e.comments) {
        const out = await ingestComment(a, orgId, c, a.team.organization.messagingEnabled);
        if (out) { r.comments++; r.executions.push(...out); }
      }
    }
  }
  await kickStaleExecutions().catch(err => log.warn({ err }, 'stale execution sweep failed'));
  return r;
}

const preview = (msg: InboundMessage) => (msg.text ? msg.text.slice(0, 200) : msg.attachments?.length ? '[attachment]' : null);

/**
 * Adapter conventions read from InboundMessage.platformData:
 *   quickReplyPayload | quickReply.payload     → QUICK_REPLY_CLICKED
 *   isPostback + postbackPayload               → BUTTON_CLICKED
 *   isEdited / isUnsent (+ editedAt/unsentAt)  → update of an already stored message
 */
function clickOf(pd: Record<string, any>): { type: 'QUICK_REPLY_CLICKED' | 'BUTTON_CLICKED'; payload: string } | null {
  const qr = pd.quickReplyPayload ?? pd.quickReply?.payload ?? pd.quick_reply?.payload;
  if (qr) return { type: 'QUICK_REPLY_CLICKED', payload: String(qr) };
  if (pd.isPostback || pd.postbackPayload) return { type: 'BUTTON_CLICKED', payload: String(pd.postbackPayload ?? pd.postback?.payload ?? '') };
  return null;
}

async function ingestMessage(a: SocialAccount, orgId: string, m0: InboundMessage): Promise<string[] | 'duplicate'> {
  const msg = { ...m0, sentAt: m0.sentAt ? new Date(m0.sentAt) : new Date() };
  const pd = (msg.platformData ?? {}) as Record<string, any>;
  const echo = !!msg.isEcho || msg.direction === 'OUTBOUND';
  const existing = await prisma.conversationMessage.findUnique({ where: { socialAccountId_externalMessageId: { socialAccountId: a.id, externalMessageId: msg.externalMessageId } } });
  if (existing) {
    // Edits and unsends arrive with the original message id.
    if (pd.isEdited || pd.isUnsent) {
      const u = await prisma.conversationMessage.update({ where: { id: existing.id }, data: { text: pd.isUnsent ? null : msg.text ?? existing.text, platformData: { ...((existing.platformData as object) ?? {}), ...pd } } });
      if (pd.isUnsent && existing.sentAt) {
        // The list preview shows the latest message's text; don't keep showing one that was unsent.
        await prisma.conversation.updateMany({ where: { id: existing.conversationId, lastMessageAt: existing.sentAt }, data: { lastMessagePreview: 'Message unsent' } });
      }
      await publish(orgId, [['conversation.message.updated', message(u)]]);
    }
    return 'duplicate';
  }
  if (pd.isUnsent) return 'duplicate'; // an unsend for a message Siar never stored

  const { row: conv0, created } = await upsertConversation(a, { id: msg.externalParticipantId, username: msg.participantUsername, displayName: msg.participantDisplayName, avatarUrl: msg.participantAvatarUrl, externalConversationId: (pd.conversationId as string) ?? null }, msg.sentAt);
  let replyTo: object | undefined;
  if (msg.replyToExternalId) {
    const target = await prisma.conversationMessage.findUnique({ where: { socialAccountId_externalMessageId: { socialAccountId: a.id, externalMessageId: msg.replyToExternalId } } });
    replyTo = { externalMessageId: msg.replyToExternalId, messageId: target?.id ?? null, isSelfReply: target ? target.direction === (echo ? 'OUTBOUND' : 'INBOUND') : null };
  }
  let row;
  try {
    row = await prisma.conversationMessage.create({
      data: {
        conversationId: conv0.id, teamId: a.teamId, socialAccountId: a.id, platform: a.type, direction: echo ? 'OUTBOUND' : 'INBOUND', status: echo ? 'SENT' : 'DELIVERED',
        source: echo ? 'ECHO' : 'WEBHOOK', externalMessageId: msg.externalMessageId, text: msg.text ?? null, attachments: (msg.attachments ?? []) as object[],
        sentAt: msg.sentAt, replyTo, platformData: { ...pd, ...(echo ? { isEcho: true } : {}) } as object,
      },
    });
  } catch (err) {
    if ((err as any)?.code === 'P2002') return 'duplicate'; // the same delivery raced in, or our API send stored it first
    throw err;
  }

  // Webhooks carry only the sender's id: look up their name and picture (once).
  await fillParticipant(conv0);

  // Conversation bookkeeping: only move timestamps forward (deliveries can arrive out of order).
  const cur = await prisma.conversation.findUniqueOrThrow({ where: { id: conv0.id } });
  const newer = !cur.lastMessageAt || msg.sentAt >= cur.lastMessageAt;
  const pdc = (cur.platformData ?? {}) as Record<string, any>;
  const lastIn = pdc.lastInboundAt ? new Date(pdc.lastInboundAt) : null;
  const conv = await prisma.conversation.update({
    where: { id: conv0.id },
    data: {
      ...(newer ? { lastMessageAt: msg.sentAt, lastActivityAt: msg.sentAt, lastMessagePreview: preview(msg) } : {}),
      ...(echo ? {} : {
        unreadCount: { increment: 1 }, status: 'OPEN',
        platformData: { ...pdc, ...(!lastIn || msg.sentAt > lastIn ? { lastInboundAt: msg.sentAt.toISOString() } : {}) },
      }),
    },
    include: { socialAccount: true },
  });
  const events: [WebhookEvent, unknown][] = [];
  if (created) events.push(['conversation.created', conversation(conv)]);
  events.push(['conversation.message.created', message(row)]);
  if (!created) events.push(['conversation.updated', conversation(conv)]);
  await publish(orgId, events);
  if (echo) return [];

  const click = clickOf(pd);
  const event: TriggerEvent = {
    type: click?.type ?? 'DM_RECEIVED', teamId: a.teamId, organizationId: orgId, platform: a.type, socialAccountId: a.id, eventKey: `msg:${row.id}`,
    conversationId: conv.id, conversationMessageId: row.id, senderExternalId: msg.externalParticipantId, externalMessageId: msg.externalMessageId,
    text: msg.text ?? null, payload: click?.payload ?? null,
  };
  return dispatchTriggers(event).catch(err => { log.error({ err, messageId: row.id }, 'automation dispatch failed'); return []; });
}

async function ingestComment(a: SocialAccount, orgId: string, c: FetchedCommentInput & { externalPostId: string }, automations: boolean): Promise<string[] | null> {
  const exists = await prisma.fetchedComment.findUnique({ where: { socialAccountId_externalId: { socialAccountId: a.id, externalId: c.externalId } }, select: { id: true } });
  if (exists) return null;
  const [target, profilePost] = await Promise.all([
    prisma.postSocialAccount.findFirst({ where: { socialAccountId: a.id, externalPostId: c.externalPostId }, select: { postId: true } }),
    prisma.profilePost.findUnique({ where: { socialAccountId_externalId: { socialAccountId: a.id, externalId: c.externalPostId } }, select: { id: true, postId: true } }),
  ]);
  let row;
  try {
    row = await prisma.fetchedComment.create({
      data: {
        teamId: a.teamId, organizationId: orgId, postId: target?.postId ?? profilePost?.postId ?? null, importedPostId: profilePost?.id ?? null, socialAccountId: a.id,
        // Comments that arrive by webhook belong to no CommentImport; the id names their source.
        importId: `webhook:${a.id}`, platform: a.type, externalId: c.externalId, externalParentId: c.externalParentId ?? null, externalPostId: c.externalPostId,
        authorName: c.authorName ?? null, authorExternalId: c.authorExternalId ?? null, authorProfileUrl: c.authorProfileUrl ?? null, authorAvatarUrl: c.authorAvatarUrl ?? null,
        text: c.text ?? null, likesCount: c.likesCount ?? 0, repliesCount: c.repliesCount ?? 0, publishedAt: c.publishedAt ?? new Date(),
        platformData: { ...(c.platformData ?? {}), origin: 'platform', source: 'webhook', owner: !!c.authorExternalId && c.authorExternalId === a.externalId } as object,
      },
    });
  } catch (err) {
    if ((err as any)?.code === 'P2002') return null;
    throw err;
  }
  await publish(orgId, [['comment.received', fetchedComment(row)]]);
  // Our own replies (the account commenting) never trigger automations.
  if (!automations || (c.authorExternalId && c.authorExternalId === a.externalId)) return [];
  const event: TriggerEvent = {
    type: 'COMMENT_CREATED', teamId: a.teamId, organizationId: orgId, platform: a.type, socialAccountId: a.id, eventKey: `comment:${row.id}`,
    fetchedCommentId: row.id, senderExternalId: c.authorExternalId ?? null, text: c.text ?? null, postId: row.postId, importedPostId: row.importedPostId, externalPostId: c.externalPostId,
  };
  return dispatchTriggers(event).catch(err => { log.error({ err, commentId: row.id }, 'automation dispatch failed'); return []; });
}
