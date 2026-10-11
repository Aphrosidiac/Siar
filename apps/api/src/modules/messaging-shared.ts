import { NetworkError, type MediaRef, type MessagingAdapter, type NetworkType } from '@siar/networks';
import type { SocialAccount } from '../generated/prisma/client.js';
import type { Actor } from '../platform/auth.js';
import { prisma, type Db } from '../platform/db.js';
import { AppError, badRequest, forbidden, notFound, type Issue } from '../platform/errors.js';
import { emit, flushDeliveries, type WebhookEvent } from '../platform/events.js';
import { adapter } from '../platform/networks.js';
import { limitsFor, period } from '../domain/plans.js';
import * as S from '../domain/serialize.js';

/**
 * Shared pieces of the DM inbox and automations (Meta messaging): gating, tenancy lookups, the
 * 24-hour messaging window, cursor pagination and the wire shapes of conversations, messages,
 * flows, executions and provider settings (field names from packages/contract/openapi.json).
 */

export const MESSAGING_TYPES = ['INSTAGRAM', 'FACEBOOK'] as const;
export const isMessagingType = (t: string) => (MESSAGING_TYPES as readonly string[]).includes(t);

const iso = (d: Date | string | null | undefined) => (d ? new Date(d).toISOString() : null);
const obj = (v: unknown): Record<string, any> => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, any>) : {});

// ───────────────────────────── gating ─────────────────────────────

export const BETA_MESSAGE = 'Direct messages and automations are in beta and are enabled per organization. Contact support to turn them on for your organization.';

/**
 * DMs are a beta switch per organization (organization.messagingEnabled) and are not on the Free
 * plan. `plan: 'dms'|'automationRuns'` also requires the plan to include that allowance.
 */
export async function gate(actor: Actor, plan?: 'dms' | 'automationRuns') {
  const org = await prisma.organization.findUniqueOrThrow({ where: { id: actor.organizationId } });
  if (!org.messagingEnabled) throw forbidden(BETA_MESSAGE);
  const l = limitsFor(org);
  if (plan === 'dms' && l.dmsPerAccount <= 0) throw forbidden(`Direct messages are not included in the ${l.plan.name} plan. Upgrade to Pro or higher to send DMs.`);
  if (plan === 'automationRuns' && l.automationRunsPerAccount <= 0) throw forbidden(`Automations are not included in the ${l.plan.name} plan. Upgrade to Pro or higher to run automations.`);
  return { org, limits: l };
}

export function messagingOf(type: string): MessagingAdapter {
  const m = isMessagingType(type) ? adapter(type as NetworkType).messaging : undefined;
  if (!m) throw badRequest(`Direct messages are not available for ${type} on this server yet.`);
  return m;
}

/** Give back one unit of a monthly per-account counter (quota.ts has no exported release for these). */
export async function releaseAccountMonth(db: Db, key: string, metric: 'dms' | 'automationRuns', at = new Date()) {
  await db.accountMonthCounter.updateMany({ where: { accountKey: key, period: period(at), metric, used: { gt: 0 } }, data: { used: { decrement: 1 } } });
}

// ───────────────────────────── tenancy ─────────────────────────────

export async function teamIn(actor: Actor, teamId: string) {
  const t = await prisma.team.findFirst({ where: { id: teamId, organizationId: actor.organizationId, deletedAt: null } });
  if (!t) throw notFound('Team');
  return t;
}

export async function conversationOf(actor: Actor, id: string) {
  const c = await prisma.conversation.findUnique({ where: { id }, include: { socialAccount: true } });
  if (!c) throw notFound('Conversation');
  const t = await prisma.team.findFirst({ where: { id: c.teamId, organizationId: actor.organizationId }, select: { id: true } });
  if (!t) throw notFound('Conversation');
  return c;
}

export async function socialAccountIn(actor: Actor, id: string, teamId?: string) {
  const a = await prisma.socialAccount.findFirst({ where: { id, deletedAt: null, ...(teamId ? { teamId } : {}), team: { organizationId: actor.organizationId } } });
  if (!a) throw notFound('Social account');
  return a;
}

export async function orgIdOfTeam(teamId: string) {
  return (await prisma.team.findUniqueOrThrow({ where: { id: teamId }, select: { organizationId: true } })).organizationId;
}

/** The account must be connected and have messaging switched on before anything is sent. */
export function assertCanMessage(a: SocialAccount) {
  if (a.deletedAt) throw notFound('Social account');
  if (a.state !== 'CONNECTED') throw new AppError(409, `This ${a.type} account needs to be reconnected before it can send messages.`);
  if (a.messagingStatus !== 'ENABLED') throw new AppError(409, `Messaging is not enabled for this ${a.type} account. Call POST /api/v1/social-account/messaging/enable first.`);
}

// ───────────────────────────── 24-hour window ─────────────────────────────

export const WINDOW_MS = 24 * 3600_000;
export const HUMAN_AGENT_WINDOW_MS = 7 * 24 * 3600_000;
/** Message tags Meta accepts outside the 24-hour window, per network. */
export const MESSAGE_TAGS: Record<'INSTAGRAM' | 'FACEBOOK', string[]> = {
  INSTAGRAM: ['HUMAN_AGENT'],
  FACEBOOK: ['HUMAN_AGENT', 'CONFIRMED_EVENT_UPDATE', 'POST_PURCHASE_UPDATE', 'ACCOUNT_UPDATE'],
};

export function lastInboundAt(conv: { platformData: unknown }): Date | null {
  const v = obj(conv.platformData).lastInboundAt;
  return v ? new Date(v) : null;
}

export const canReply = (conv: { platformData: unknown }, now = Date.now()) => {
  const at = lastInboundAt(conv);
  return !!at && now - at.getTime() < WINDOW_MS;
};

/**
 * Meta only lets a business message someone within 24 hours of that person's last message. Outside
 * it, a supported message tag is required (HUMAN_AGENT extends it to 7 days). Throws a clear 403.
 */
export function assertWindow(conv: { platform: string; platformData: unknown }, tag?: string | null) {
  const at = lastInboundAt(conv);
  const now = Date.now();
  if (at && now - at.getTime() < WINDOW_MS) return;
  const platform = conv.platform as 'INSTAGRAM' | 'FACEBOOK';
  const since = at ? `Their last message was at ${at.toISOString()}.` : 'They have not messaged this account yet.';
  if (tag) {
    const allowed = MESSAGE_TAGS[platform] ?? [];
    if (!allowed.includes(tag)) throw badRequest(`Message tag ${tag} is not supported for ${platform}. Supported tags: ${allowed.join(', ')}.`, [{ code: 'invalid', message: 'Unsupported tag', path: ['tag'] }]);
    if (tag === 'HUMAN_AGENT' && (!at || now - at.getTime() >= HUMAN_AGENT_WINDOW_MS)) throw forbidden(`The HUMAN_AGENT tag only extends the reply window to 7 days after the person's last message. ${since}`);
    return;
  }
  throw forbidden(`Meta only allows replies within 24 hours of the person's last message. ${since} Wait for them to message again, or send with a supported message tag (${(MESSAGE_TAGS[platform] ?? []).join(', ')}).`);
}

// ───────────────────────────── pagination ─────────────────────────────

const clean = (q: Record<string, any>) => Object.fromEntries(Object.entries(q ?? {}).filter(([, v]) => v !== null && v !== undefined && v !== ''));

/** offset/limit with an optional opaque keyset cursor (cursor wins over offset). */
export function pageArgs(q: Record<string, any>, max = 100) {
  const c = clean(q);
  const offset = c.offset === undefined ? 0 : Number(c.offset);
  const limit = c.limit === undefined ? 20 : Number(c.limit);
  const bad = (field: string, message: string): never => { throw badRequest(message, [{ code: 'invalid', message, path: [field] }]); };
  if (!Number.isInteger(offset) || offset < 0) bad('offset', 'offset must be a non-negative integer');
  if (!Number.isInteger(limit) || limit < 1 || limit > max) bad('limit', `limit must be between 1 and ${max}`);
  let cursor: { t: string; id: string } | null = null;
  if (c.cursor) {
    try { cursor = JSON.parse(Buffer.from(String(c.cursor), 'base64url').toString('utf8')); if (!cursor?.t || !cursor?.id) throw 0; }
    catch { bad('cursor', 'cursor is not valid; pass the nextCursor of the previous page.'); }
  }
  return { skip: cursor ? 0 : offset, take: limit, cursor };
}
export const encodeCursor = (t: Date | null, id: string) => Buffer.from(JSON.stringify({ t: (t ?? new Date(0)).toISOString(), id })).toString('base64url');

/** Keyset condition for `ORDER BY <field> DESC, id DESC`. */
export const before = (field: string, cursor: { t: string; id: string } | null) =>
  cursor ? { OR: [{ [field]: { lt: new Date(cursor.t) } }, { [field]: new Date(cursor.t), id: { lt: cursor.id } }] } : {};

// ───────────────────────────── wire shapes ─────────────────────────────

export function conversation(c: any) {
  const pd = obj(c.platformData);
  return {
    id: c.id, teamId: c.teamId, socialAccountId: c.socialAccountId, platform: c.platform,
    externalConversationId: c.externalConversationId ?? null, externalParticipantId: c.externalParticipantId,
    participantUsername: c.participantUsername ?? null, participantDisplayName: c.participantDisplayName ?? null, participantAvatarUrl: c.participantAvatarUrl ?? null,
    status: c.status, lastMessageAt: iso(c.lastMessageAt), lastActivityAt: iso(c.lastActivityAt ?? c.createdAt), lastMessagePreview: c.lastMessagePreview ?? null,
    lastReadAt: iso(c.lastReadAt), unreadCount: c.unreadCount ?? 0, platformSeenAt: iso(c.platformSeenAt),
    createdAt: iso(c.createdAt), updatedAt: iso(c.updatedAt),
    platformData: { canReply: canReply(c), lastInboundAt: pd.lastInboundAt ?? null, providerStateSync: pd.providerStateSync ?? null },
    ...(c.socialAccount ? { socialAccount: S.socialAccount(c.socialAccount) } : {}),
  };
}

export function message(m: any) {
  const pd = obj(m.platformData);
  return {
    id: m.id, conversationId: m.conversationId, teamId: m.teamId, socialAccountId: m.socialAccountId, platform: m.platform,
    direction: m.direction, status: m.status, source: m.source, externalMessageId: m.externalMessageId ?? null, text: m.text ?? null,
    attachments: Array.isArray(m.attachments) ? m.attachments : [],
    sentAt: iso(m.sentAt), failedAt: iso(m.failedAt), error: m.error ?? null, seenAt: iso(m.seenAt),
    replyTo: m.replyTo ?? null, privateReplyContext: m.privateReplyContext ?? null,
    createdAt: iso(m.createdAt), updatedAt: iso(m.updatedAt),
    platformData: { ...pd, reactions: Array.isArray(m.reactions) ? m.reactions : [] },
  };
}

export function fetchedComment(c: any) {
  if (!c) return null;
  return {
    id: c.id, teamId: c.teamId, organizationId: c.organizationId ?? null, postId: c.postId ?? null, importedPostId: c.importedPostId ?? null,
    socialAccountId: c.socialAccountId, importId: c.importId, platform: c.platform, externalId: c.externalId, externalParentId: c.externalParentId ?? null,
    externalPostId: c.externalPostId ?? null, authorName: c.authorName ?? null, authorExternalId: c.authorExternalId ?? null, authorProfileUrl: c.authorProfileUrl ?? null,
    authorAvatarUrl: c.authorAvatarUrl ?? null, text: c.text ?? null, likesCount: c.likesCount ?? 0, repliesCount: c.repliesCount ?? 0,
    platformData: { ...obj(c.platformData), hidden: c.hidden ?? false, likedByMe: c.liked ?? false },
    publishedAt: iso(c.publishedAt), createdAt: iso(c.createdAt), updatedAt: iso(c.updatedAt), deletedAt: iso(c.deletedAt),
  };
}

/** Internal bookkeeping kept inside AutomationFlowVersion.definition (stripped on the wire). */
export const META_KEY = '$siar';

export function flowVersion(v: any, flow: { draftVersionId: string | null; publishedVersionId: string | null }) {
  if (!v) return null;
  const d = obj(v.definition);
  const meta = obj(d[META_KEY]);
  const status = v.id === flow.publishedVersionId ? 'PUBLISHED' : v.publishedAt ? 'RETIRED' : 'DRAFT';
  return {
    id: v.id, flowId: v.flowId, version: v.version, status,
    definition: { trigger: d.trigger ?? null, steps: Array.isArray(d.steps) ? d.steps : [] },
    publishedAt: iso(v.publishedAt), publishedByUserId: meta.publishedByUserId ?? null, createdAt: iso(v.createdAt),
  };
}

export function flow(f: any) {
  const versions: any[] = f.versions ?? [];
  const draft = versions.find(v => v.id === f.draftVersionId);
  const published = versions.find(v => v.id === f.publishedVersionId);
  return {
    id: f.id, teamId: f.teamId, organizationId: f.organizationId ?? null, name: f.name, status: f.status, platformScope: f.platformScope,
    createdByUserId: f.createdByUserId ?? null, createdAt: iso(f.createdAt), updatedAt: iso(f.updatedAt), deletedAt: iso(f.deletedAt),
    draftVersion: draft ? flowVersion(draft, f) : null,
    publishedVersion: published ? flowVersion(published, f) : null,
  };
}

export function execution(e: any, rel: { flow?: any; version?: any; conversation?: any; message?: any; comment?: any; account?: any } = {}) {
  return {
    id: e.id, teamId: e.teamId, organizationId: e.organizationId ?? null, flowId: e.flowId, flowVersionId: e.flowVersionId, triggerId: e.triggerId ?? null,
    platform: e.platform, socialAccountId: e.socialAccountId, conversationId: e.conversationId ?? null, conversationMessageId: e.conversationMessageId ?? null,
    fetchedCommentId: e.fetchedCommentId ?? null, senderExternalId: e.senderExternalId ?? null, currentStepId: e.currentStepId ?? null,
    status: e.status, idempotencyKey: e.idempotencyKey, input: obj(e.input), output: obj(e.output), error: e.error ?? null,
    startedAt: iso(e.startedAt), completedAt: iso(e.completedAt), createdAt: iso(e.createdAt), updatedAt: iso(e.updatedAt),
    steps: Array.isArray(e.steps) ? e.steps : [],
    ...(rel.flow ? { flow: flow(rel.flow) } : {}),
    ...(rel.version && rel.flow ? { flowVersion: flowVersion(rel.version, rel.flow) } : {}),
    conversation: rel.conversation ? conversation(rel.conversation) : null,
    conversationMessage: rel.message ? message(rel.message) : null,
    fetchedComment: rel.comment ? fetchedComment(rel.comment) : null,
    ...(rel.account ? { socialAccount: S.socialAccount(rel.account) } : {}),
  };
}

export function providerSetting(p: any) {
  return {
    id: p.id, teamId: p.teamId, organizationId: p.organizationId ?? null, platform: p.platform, socialAccountId: p.socialAccountId, type: p.type,
    status: p.status, config: p.config ?? {}, providerResponse: p.providerResponse ?? null, lastSyncedAt: iso(p.lastSyncedAt), lastSyncError: p.lastSyncError ?? null,
    createdAt: iso(p.createdAt), updatedAt: iso(p.updatedAt),
    ...(p.socialAccount ? { socialAccount: S.socialAccount(p.socialAccount) } : {}),
  };
}

// ───────────────────────────── events ─────────────────────────────

/** Emit after the write (outside a transaction) and hand the deliveries to the worker. */
export async function publish(organizationId: string, events: [WebhookEvent, unknown][]) {
  const ids: string[] = [];
  for (const [e, data] of events) ids.push(...(await emit(prisma, organizationId, e, data)));
  if (ids.length) await flushDeliveries(ids);
}

// ───────────────────────────── media ─────────────────────────────

const ATTACH_TYPE: Record<string, MediaRef['type']> = { IMAGE: 'image', VIDEO: 'video', AUDIO: 'document', FILE: 'document' };

/** A by-URL attachment as a MediaRef: Meta pulls it from the URL; we never fetch it ourselves. */
export function urlMedia(a: { type: string; url?: string | null; mimeType?: string | null; name?: string | null }, i: number): MediaRef {
  const no = async (): Promise<never> => { throw new NetworkError('MEDIA_INVALID', 'This attachment is sent by URL only.'); };
  const ext = (a.name ?? a.url ?? '').split('?')[0].split('.').pop()?.toLowerCase() || 'bin';
  return { id: `url-${i}`, type: ATTACH_TYPE[a.type] ?? 'document', mime: a.mimeType ?? 'application/octet-stream', ext, url: a.url!, fileSize: 0, read: no, stream: no, readRange: no };
}

export const issue = (path: (string | number)[], message: string, code = 'invalid'): Issue => ({ code, message, path });
