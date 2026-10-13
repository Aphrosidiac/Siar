import { randomUUID } from 'node:crypto';
import { isNetworkError, NetworkError, type CommentAction, type NetworkType } from '@siar/networks';
import { Prisma } from '../generated/prisma/client.js';
import type { PostStatus } from '../generated/prisma/enums.js';
import { prisma, type Db } from '../platform/db.js';
import { audit } from '../platform/audit.js';
import { emit, flushDeliveries, notify } from '../platform/events.js';
import { badRequest, notFound, validation, type Issue } from '../platform/errors.js';
import { listOf, pageOf } from '../platform/http.js';
import { logger } from '../platform/logger.js';
import { adapter, isConfigured, loadAccount, markNeedsReconnect, networkContext } from '../platform/networks.js';
import { enqueue, JOBS } from '../platform/queue.js';
import { define } from '../platform/routes.js';
import type { Actor } from '../platform/auth.js';
import * as credits from '../domain/credits.js';
import * as S from '../domain/serialize.js';
import { COMMENT_LENGTH, limitsFor, RESOURCE_LIMITS, utcDay, type XAction } from '../domain/plans.js';
import { accountKey, consumeDaily, consumeOrg, releaseDaily } from '../domain/quota.js';
import { registerJob } from '../engine/jobs.js';
import { teamOf } from './teams.js';
import { accountOf, networkFailure } from './accounts.js';
import { commentImport, fetchedComment, listParam, metered } from './content-shared.js';

/**
 * Comments: replies we publish (to our posts, imported posts, our comments or fetched comments) and
 * comments we import from the networks.
 *
 * A comment fans out per network like a post; each network is a target kept in Comment.targets:
 *   { MASTODON: { socialAccountId, externalPostId, parentExternalId, status, attemptId, externalId, … } }
 * Publishing follows engine/publisher.ts: a target is claimed with one conditional UPDATE (the
 * jsonb status must still be PENDING) carrying a fresh attemptId, and only the claimant calls the
 * network. Never twice: an interrupted claim is surfaced as an error, not re-sent.
 */

type TargetStatus = 'PENDING' | 'PROCESSING' | 'POSTED' | 'ERROR' | 'DELETED';
interface Target {
  socialAccountId: string;
  externalPostId: string | null;
  parentExternalId: string | null;
  status: TargetStatus;
  attemptId?: string | null;
  attempts?: number;
  /** Times the target waited for its post to finish publishing. */
  waits?: number;
  claimedAt?: string | null;
  externalId?: string | null;
  permalink?: string | null;
  publishedAt?: string | null;
  error?: Record<string, unknown> | null;
  /** The comment counted against the monthly quota (once, ever). */
  counted?: boolean;
  /** UTC day the per-account daily cap was consumed for (null = not consumed). */
  dailyDay?: string | null;
}
type Targets = Partial<Record<NetworkType, Target>>;

const AUTO_ATTEMPTS = 3;
const STALE_CLAIM_MS = 20 * 60_000;
const WAIT_FOR_POST_MS = 60_000;
const COMMENTABLE: NetworkType[] = ['TIKTOK', 'YOUTUBE', 'INSTAGRAM', 'FACEBOOK', 'TWITTER', 'THREADS', 'LINKEDIN', 'REDDIT', 'MASTODON', 'DISCORD', 'SLACK', 'BLUESKY'];

const verboseOf = async (orgId: string) => (await prisma.organization.findUnique({ where: { id: orgId }, select: { showVerboseErrors: true } }))?.showVerboseErrors ?? false;
const targetsOf = (c: { targets: unknown }) => ((c.targets ?? {}) as Targets);
const hasUrl = (s: unknown) => typeof s === 'string' && /https?:\/\/\S+/i.test(s);

export async function commentOf(actor: Actor, id: string) {
  const c = await prisma.comment.findFirst({ where: { id, organizationId: actor.organizationId } });
  if (!c) throw notFound('Comment');
  return c;
}

const parseDate = (v: unknown, path = 'postDate') => {
  const d = new Date(String(v));
  if (Number.isNaN(d.getTime())) throw badRequest(`${path} must be an ISO 8601 date-time.`, [{ code: 'invalid_date', message: 'Invalid date', path: [path] }]);
  return d;
};

interface Refs { internalPostId?: string | null; importedPostId?: string | null; internalParentCommentId?: string | null; fetchedParentCommentId?: string | null }
type Candidate = { socialAccountId: string; externalPostId: string | null; parentExternalId: string | null };

/** What the comment replies to, per network: the account that will reply and the network ids. */
async function resolveRefs(actor: Actor, teamId: string, r: Refs): Promise<Partial<Record<NetworkType, Candidate>>> {
  const out: Partial<Record<NetworkType, Candidate>> = {};
  if (!r.internalPostId && !r.importedPostId && !r.internalParentCommentId && !r.fetchedParentCommentId)
    throw badRequest('Say what the comment replies to: set internalPostId, importedPostId, internalParentCommentId or fetchedParentCommentId.', [{ code: 'required', message: 'A post or parent comment is required', path: ['internalPostId'] }]);
  if (r.internalPostId) {
    const p = await prisma.post.findFirst({ where: { id: r.internalPostId, organizationId: actor.organizationId }, include: { socialAccounts: true } });
    if (!p || p.status === 'DELETED') throw notFound('Post');
    if (p.teamId !== teamId) throw badRequest('The post belongs to another team. Use that post\'s teamId.', [{ code: 'team_mismatch', message: 'Post is in another team', path: ['internalPostId'] }]);
    for (const t of p.socialAccounts) if (!['DELETED', 'ERROR'].includes(t.targetStatus)) out[t.type as NetworkType] = { socialAccountId: t.socialAccountId, externalPostId: t.externalPostId, parentExternalId: null };
  }
  if (r.importedPostId) {
    const pp = await prisma.profilePost.findFirst({ where: { id: r.importedPostId, deletedAt: null, socialAccount: { teamId, team: { organizationId: actor.organizationId } } }, include: { socialAccount: true } });
    if (!pp || !pp.externalId) throw notFound('Imported post');
    out[pp.socialAccount.type as NetworkType] = { socialAccountId: pp.socialAccountId, externalPostId: pp.externalId, parentExternalId: null };
  }
  if (r.internalParentCommentId) {
    const parent = await prisma.comment.findFirst({ where: { id: r.internalParentCommentId, organizationId: actor.organizationId, deletedAt: null } });
    if (!parent) throw notFound('Parent comment');
    const posted = Object.entries(targetsOf(parent)).filter(([, t]) => t?.status === 'POSTED' && t.externalId);
    if (!posted.length) throw badRequest('The parent comment is not published yet. Reply once it is POSTED.', [{ code: 'not_published', message: 'Parent not published', path: ['internalParentCommentId'] }]);
    for (const k of Object.keys(out)) delete out[k as NetworkType];
    for (const [type, t] of posted) out[type as NetworkType] = { socialAccountId: t!.socialAccountId, externalPostId: t!.externalPostId, parentExternalId: t!.externalId! };
  }
  if (r.fetchedParentCommentId) {
    const fc = await prisma.fetchedComment.findFirst({ where: { id: r.fetchedParentCommentId, organizationId: actor.organizationId, deletedAt: null } });
    if (!fc) throw notFound('Fetched parent comment');
    for (const k of Object.keys(out)) delete out[k as NetworkType];
    out[fc.platform as NetworkType] = { socialAccountId: fc.socialAccountId, externalPostId: fc.externalPostId, parentExternalId: fc.externalId };
  }
  return out;
}

interface Body extends Refs { teamId: string; title?: string | null; postDate?: string; status?: 'DRAFT' | 'SCHEDULED'; socialAccountTypes?: NetworkType[]; data?: Record<string, { text?: string | null } | null>; text?: string }

/** Validate and resolve a comment body → per-network targets and the normalized data. */
async function plan(actor: Actor, b: Body) {
  const cands = await resolveRefs(actor, b.teamId, b);
  const dataKeys = Object.entries(b.data ?? {}).filter(([, v]) => v).map(([k]) => k as NetworkType);
  const types = b.socialAccountTypes?.length ? b.socialAccountTypes : dataKeys.length ? dataKeys : (Object.keys(cands) as NetworkType[]);
  const issues: Issue[] = [];
  if (new Set(types).size !== types.length) issues.push({ code: 'duplicate', message: 'socialAccountTypes has duplicates.', path: ['socialAccountTypes'] });
  if (!types.length) issues.push({ code: 'required', message: 'Nothing to reply on: the post has no live network targets.', path: ['socialAccountTypes'] });
  const data: Record<string, { text: string }> = {};
  const accounts = types.length ? await prisma.socialAccount.findMany({ where: { id: { in: types.map(t => cands[t]?.socialAccountId).filter(Boolean) as string[] } } }) : [];
  for (const t of types) {
    const ad = adapter(t);
    const c = cands[t];
    if (!c) { issues.push({ code: 'no_target', message: `What you are replying to has no ${ad.displayName} target.`, path: ['socialAccountTypes'] }); continue; }
    if (!COMMENTABLE.includes(t) || !ad.capabilities.comments || !ad.comment || !COMMENT_LENGTH[t]) { issues.push({ code: 'unsupported', message: `${ad.displayName} comments are not available${isConfigured(t) ? '' : ' on this server yet'}.`, path: ['socialAccountTypes'] }); continue; }
    const a = accounts.find(x => x.id === c.socialAccountId);
    if (!a || a.deletedAt) { issues.push({ code: 'not_connected', message: `The ${ad.displayName} account that published this was disconnected. Reconnect it first.`, path: ['socialAccountTypes'] }); continue; }
    const text = (b.data?.[t]?.text ?? b.text ?? '').trim();
    if (!text) { issues.push({ code: 'required', message: `Comment text is required for ${ad.displayName} (text or data.${t}.text).`, path: b.data?.[t] ? ['data', t, 'text'] : ['text'] }); continue; }
    const max = COMMENT_LENGTH[t]!;
    if ([...text].length > max) issues.push({ code: 'too_long', message: `Comments are limited to ${max} characters on ${ad.displayName}.`, path: b.data?.[t]?.text ? ['data', t, 'text'] : ['text'] });
    data[t] = { text };
  }
  for (const k of dataKeys) if (!types.includes(k)) issues.push({ code: 'mismatch', message: `data.${k} is set but ${k} is not in socialAccountTypes.`, path: ['data', k] });
  if (issues.length) throw validation(issues, `Validation failed: ${issues[0].message}`);
  return { types, cands, data, accounts };
}

/** Consume the comment's quotas when it leaves DRAFT: 1 monthly comment, 1 daily comment per account on postDate. */
async function consumeFor(tx: Db, organizationId: string, targets: Targets, accounts: { id: string; type: string; providerPageId: string | null }[], postDate: Date, monthAlready: boolean) {
  const org = await tx.organization.findUniqueOrThrow({ where: { id: organizationId } });
  const l = limitsFor(org);
  if (!monthAlready) await consumeOrg(tx, org, 'comments', 1, l.comments);
  for (const [type, t] of Object.entries(targets)) {
    const a = accounts.find(x => x.id === t!.socialAccountId)!;
    await consumeDaily(tx, accountKey(a.type, a.providerPageId, a.id), 'comments', 1, l.dailyComments[type as NetworkType], postDate, adapter(type as NetworkType).displayName + ' comment');
    t!.counted = true;
    t!.dailyDay = utcDay(postDate);
  }
}

async function releaseDailyFor(tx: Db, targets: Targets) {
  const ids = Object.values(targets).filter(t => t?.dailyDay).map(t => t!.socialAccountId);
  if (!ids.length) return;
  const accounts = await tx.socialAccount.findMany({ where: { id: { in: ids } } });
  for (const t of Object.values(targets)) {
    if (!t?.dailyDay) continue;
    const a = accounts.find(x => x.id === t.socialAccountId);
    if (a) await releaseDaily(tx, accountKey(a.type, a.providerPageId, a.id), 'comments', 1, new Date(`${t.dailyDay}T12:00:00Z`));
    t.dailyDay = null;
  }
}

/** Enqueue publishing for every pending target (now, or at postDate). */
export async function kickComment(commentId: string, at: Date) {
  const c = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!c) return;
  const startAfter = at.getTime() > Date.now() + 1000 ? at : undefined;
  for (const [type, t] of Object.entries(targetsOf(c))) if (t?.status === 'PENDING') await enqueue(JOBS.publishComment, { commentId, type }, { singletonKey: `cmt:${commentId}:${type}:${at.getTime()}`, startAfter, retryLimit: 0 });
}

async function patchTarget(id: string, type: string, attemptId: string | null, patch: Record<string, unknown>) {
  return prisma.$executeRaw`UPDATE "Comment" SET "targets" = jsonb_set("targets", ARRAY[${type}]::text[], ("targets"->(${type}::text)) || ${JSON.stringify(patch)}::jsonb), "updatedAt" = now()
    WHERE id = ${id} AND "targets" ? ${type}::text ${attemptId ? Prisma.sql`AND "targets"->(${type}::text)->>'attemptId' = ${attemptId}` : Prisma.empty}`;
}

/** Run one target. Safe to call twice: the second call finds nothing to claim. */
export async function publishCommentTarget(commentId: string, type: NetworkType) {
  const attemptId = randomUUID();
  const claimed = await prisma.$executeRaw`
    UPDATE "Comment" SET "targets" = jsonb_set("targets", ARRAY[${type}]::text[], ("targets"->(${type}::text)) || jsonb_build_object('status', 'PROCESSING', 'attemptId', ${attemptId}::text, 'claimedAt', to_jsonb(now()), 'attempts', COALESCE(("targets"->(${type}::text)->>'attempts')::int, 0) + 1)),
      "status" = CASE WHEN "status" IN ('SCHEDULED', 'RETRYING') THEN 'PROCESSING'::"PostStatus" ELSE "status" END, "updatedAt" = now()
    WHERE id = ${commentId} AND "deletedAt" IS NULL AND "status" IN ('SCHEDULED', 'RETRYING', 'PROCESSING') AND "postDate" <= now() + interval '5 seconds'
      AND "targets"->(${type}::text)->>'status' = 'PENDING'`;
  if (!claimed) return 'skipped';
  const c = await prisma.comment.findUniqueOrThrow({ where: { id: commentId } });
  const t = targetsOf(c)[type]!;
  const ad = adapter(type);
  let holdId: string | null = null;
  try {
    let externalPostId = t.externalPostId;
    if (!externalPostId && c.internalPostId) {
      // Replying to a post that may still be publishing: wait for its external id.
      const pt = await prisma.postSocialAccount.findUnique({ where: { postId_socialAccountId: { postId: c.internalPostId, socialAccountId: t.socialAccountId } } });
      if (pt?.targetStatus === 'POSTED' && pt.externalPostId) externalPostId = pt.externalPostId;
      else if (pt && ['PENDING', 'PROCESSING', 'REVIEW'].includes(pt.targetStatus) && (t.waits ?? 0) < 60) {
        await patchTarget(commentId, type, attemptId, { status: 'PENDING', attemptId: null, attempts: Math.max(0, (t.attempts ?? 1) - 1), waits: (t.waits ?? 0) + 1 });
        await enqueue(JOBS.publishComment, { commentId, type }, { singletonKey: `cmt:${commentId}:${type}:wait:${Date.now()}`, startAfter: WAIT_FOR_POST_MS, retryLimit: 0 });
        return 'waiting-post';
      } else throw new NetworkError('NOT_FOUND', `The post was not published on ${ad.displayName}, so there is nothing to reply to.`, { retryability: 'non_retryable' });
      await patchTarget(commentId, type, attemptId, { externalPostId });
    }
    if (!externalPostId) throw new NetworkError('NOT_FOUND', 'The post this comment replies to has no network id.', { retryability: 'non_retryable' });
    const acc = await prisma.socialAccount.findUnique({ where: { id: t.socialAccountId } });
    if (!acc || acc.deletedAt) throw new NetworkError('NOT_FOUND', 'The social account was disconnected before the comment was published.', { userFacingMessage: 'The social account was disconnected. Reconnect it and retry.' });
    if (acc.state === 'NEEDS_RECONNECT') throw new NetworkError('TOKEN_INVALID', acc.stateReason ?? 'The account needs to be reconnected.', { userFacingMessage: 'Reconnect this account, then retry the comment.' });
    const text = ((c.data as Record<string, any>)?.[type]?.text ?? '') as string;
    if (ad.capabilities.metered) {
      const action: XAction = hasUrl(text) ? 'TWITTER_CONTENT_CREATE_WITH_URL' : 'TWITTER_CONTENT_CREATE';
      const h = await credits.hold(c.organizationId!, action, 1, { type: 'Comment', id: `${commentId}:${type}` }).catch(err => {
        throw new NetworkError('PERMISSION', (err as Error).message, { userFacingMessage: 'Not enough X credit. Top up in Billing → Credits, then retry.', retryability: 'non_retryable' });
      });
      holdId = h.id;
    }
    const account = await loadAccount(t.socialAccountId);
    const r = await ad.comment!(networkContext(type), { account, externalPostId, parentExternalId: t.parentExternalId, text, media: [], data: (c.data as any)?.[type] ?? { text } });
    await patchTarget(commentId, type, attemptId, { status: 'POSTED', externalId: r.externalId, permalink: r.permalink ?? null, publishedAt: new Date().toISOString(), error: null, externalData: r.externalData ?? null });
    if (holdId) await credits.capture(holdId, `X comment ${commentId}`);
    await recomputeComment(commentId);
    return 'POSTED';
  } catch (err) {
    if (holdId) await credits.release(holdId);
    await failTarget(commentId, type, attemptId, err, t.attempts ?? 1);
    return 'error';
  }
}

async function failTarget(commentId: string, type: NetworkType, attemptId: string, err: unknown, attempts: number) {
  const ne = isNetworkError(err) ? err : new NetworkError('UNKNOWN', (err as Error)?.message ?? String(err));
  if (!isNetworkError(err)) logger.error({ err, commentId, type }, 'comment publish crashed');
  const c = await prisma.comment.findUnique({ where: { id: commentId } });
  const accountId = c ? targetsOf(c)[type]?.socialAccountId : null;
  if (ne.code === 'TOKEN_INVALID' && accountId) await markNeedsReconnect(prisma, accountId, ne.message);
  if (ne.isTransient && attempts < AUTO_ATTEMPTS) {
    const delay = ne.rateLimitResetAt ? Math.max(5_000, ne.rateLimitResetAt.getTime() - Date.now()) : 30_000 * 2 ** (attempts - 1);
    await patchTarget(commentId, type, attemptId, { status: 'PENDING', attemptId: null, error: ne.toVerbose() });
    await enqueue(JOBS.publishComment, { commentId, type }, { singletonKey: `cmt:${commentId}:${type}:auto:${attempts}`, startAfter: delay, retryLimit: 0 });
    return;
  }
  await patchTarget(commentId, type, attemptId, { status: 'ERROR', error: ne.toVerbose() });
  await recomputeComment(commentId);
}

/**
 * Derive Comment.status (+ the per-network errors/externalData maps) from its targets and fire
 * comment.published once it reaches a final state (all POSTED, or none in flight with an ERROR).
 */
export async function recomputeComment(commentId: string) {
  const c = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!c || c.status === 'DELETED' || c.status === 'DRAFT') return;
  const ts = Object.entries(targetsOf(c)).filter(([, t]) => t && t.status !== 'DELETED') as [NetworkType, Target][];
  if (!ts.length) return;
  const due = !c.postDate || c.postDate <= new Date();
  const inFlight = ts.some(([, t]) => t.status === 'PROCESSING' || (t.status === 'PENDING' && due));
  const pendingFuture = ts.some(([, t]) => t.status === 'PENDING') && !inFlight;
  let status: PostStatus = c.status;
  if (inFlight) status = 'PROCESSING';
  else if (pendingFuture) status = c.status === 'RETRYING' ? 'RETRYING' : 'SCHEDULED';
  else if (ts.some(([, t]) => t.status === 'ERROR')) status = 'ERROR';
  else if (ts.every(([, t]) => t.status === 'POSTED')) status = 'POSTED';
  const errors: Record<string, string> = {}; const errorsVerbose: Record<string, unknown> = {}; const externalData: Record<string, unknown> = {};
  for (const [type, t] of ts) {
    if (t.status === 'ERROR' && t.error) { errors[type] = String((t.error as any).userFacingMessage ?? (t.error as any).errorMessage ?? 'Publishing failed.'); errorsVerbose[type] = t.error; }
    if (t.externalId) externalData[type] = { id: t.externalId, permalink: t.permalink ?? null };
  }
  const final = status === 'POSTED' || status === 'ERROR';
  const postedDate = status === 'POSTED' ? ts.reduce<Date | null>((m, [, t]) => (t.publishedAt && (!m || new Date(t.publishedAt) > m) ? new Date(t.publishedAt) : m), null) : c.postedDate;
  const errText = Object.entries(errors).map(([k, v]) => `${k}: ${v}`).join(' · ');
  const changed = await prisma.comment.updateMany({
    where: { id: commentId, status: c.status },
    data: {
      status, postedDate, error: errText ? errText.slice(0, 2000) : null,
      errors: Object.keys(errors).length ? errors : Prisma.DbNull, errorsVerbose: Object.keys(errorsVerbose).length ? (errorsVerbose as object) : Prisma.DbNull,
      externalData: Object.keys(externalData).length ? (externalData as object) : Prisma.DbNull,
    },
  });
  if (changed.count && final && c.status !== status) {
    const full = await prisma.comment.findUniqueOrThrow({ where: { id: commentId } });
    const ids = await emit(prisma, full.organizationId!, 'comment.published', S.comment(full, { verbose: true }));
    void flushDeliveries(ids);
    if (status === 'ERROR') await notify(prisma, full.organizationId!, { kind: 'comment.error', title: `A comment failed to publish`, body: errText.slice(0, 500), link: `/comments/${commentId}` });
  }
}

/** Safety net for the queue: comments that are due but were not picked up (call from the minute sweep). */
export async function dispatchDueComments() {
  const due = await prisma.comment.findMany({ where: { status: { in: ['SCHEDULED', 'RETRYING', 'PROCESSING'] }, postDate: { lte: new Date() }, deletedAt: null }, select: { id: true, targets: true }, take: 500 });
  let n = 0;
  for (const c of due) for (const [type, t] of Object.entries(targetsOf(c))) if (t?.status === 'PENDING') { n++; await enqueue(JOBS.publishComment, { commentId: c.id, type }, { singletonKey: `cmt:${c.id}:${type}:sweep`, retryLimit: 0 }); }
  return n;
}

/** Claims older than 20 minutes: the worker died mid-call. We cannot tell whether it went out, so never re-send. */
export async function staleCommentClaims() {
  const rows = await prisma.comment.findMany({ where: { status: 'PROCESSING', updatedAt: { lt: new Date(Date.now() - STALE_CLAIM_MS) } }, take: 100 });
  for (const c of rows) {
    for (const [type, t] of Object.entries(targetsOf(c))) {
      if (t?.status !== 'PROCESSING' || !t.attemptId || !t.claimedAt || Date.now() - new Date(t.claimedAt).getTime() < STALE_CLAIM_MS) continue;
      await patchTarget(c.id, type, t.attemptId, { status: 'ERROR', error: new NetworkError('UNKNOWN', 'Publishing was interrupted and the result could not be confirmed. Check the post before retrying.', { retryability: 'unknown' }).toVerbose() });
    }
    await recomputeComment(c.id);
  }
  return rows.length;
}

registerJob(JOBS.publishComment, d => publishCommentTarget(d.commentId, d.type));

async function createComment(actor: Actor, b: Body) {
  await teamOf(actor, b.teamId);
  const status = b.status ?? 'SCHEDULED';
  const postDate = b.postDate ? parseDate(b.postDate) : new Date();
  const p = await plan(actor, b);
  const targets: Targets = {};
  for (const t of p.types) targets[t] = { socialAccountId: p.cands[t]!.socialAccountId, externalPostId: p.cands[t]!.externalPostId, parentExternalId: p.cands[t]!.parentExternalId, status: 'PENDING', attempts: 0, counted: false, dailyDay: null };
  const c = await prisma.$transaction(async tx => {
    if (status === 'SCHEDULED') await consumeFor(tx, actor.organizationId, targets, p.accounts, postDate, false);
    const row = await tx.comment.create({
      data: {
        teamId: b.teamId, organizationId: actor.organizationId, internalPostId: b.internalPostId ?? null, importedPostId: b.importedPostId ?? null,
        internalParentCommentId: b.internalParentCommentId ?? null, fetchedParentCommentId: b.fetchedParentCommentId ?? null,
        title: b.title ?? null, postDate, status, data: p.data, targets: targets as object,
      },
    });
    await audit(tx, actor, 'comment.create', 'Comment', row.id, `${status === 'DRAFT' ? 'Drafted' : 'Scheduled'} a comment on ${p.types.join(', ')}`);
    return row;
  });
  if (status === 'SCHEDULED') await kickComment(c.id, postDate);
  return c;
}

/** The wire comment (re-read so the response reflects anything already published). */
const out = async (actor: Actor, id: string) => S.comment(await prisma.comment.findUniqueOrThrow({ where: { id } }), { verbose: await verboseOf(actor.organizationId) });

define({
  'comment.create': async ({ actor, body }) => out(actor, (await createComment(actor, body)).id),

  'comment.get': async ({ actor, params }) => S.comment(await commentOf(actor, params.id), { verbose: await verboseOf(actor.organizationId) }),

  'comment.getList': async ({ actor, query }) => {
    await teamOf(actor, query.teamId);
    const pg = pageOf(query);
    const platforms = listParam(query.platforms);
    let ids: string[] | null = null;
    if (platforms?.length) ids = (await prisma.$queryRaw<{ id: string }[]>`SELECT id FROM "Comment" WHERE "teamId" = ${query.teamId} AND "targets" ?| ${platforms}::text[]`).map(r => r.id);
    const where: Prisma.CommentWhereInput = {
      teamId: query.teamId, organizationId: actor.organizationId,
      ...(query.status ? { status: query.status } : { status: { not: 'DELETED' } }),
      ...(query.postId ? { internalPostId: query.postId } : {}),
      ...(query.importedPostId ? { importedPostId: query.importedPostId } : {}),
      ...(query.q ? { title: { contains: String(query.q), mode: 'insensitive' } } : {}),
      ...(ids ? { id: { in: ids } } : {}),
    };
    const orderField = ['createdAt', 'updatedAt', 'deletedAt'].includes(String(query.orderBy)) ? String(query.orderBy) : 'createdAt';
    const [rows, total] = await Promise.all([
      prisma.comment.findMany({ where, orderBy: [{ [orderField]: query.order === 'ASC' ? 'asc' : 'desc' }, { id: 'desc' }], ...pg }),
      prisma.comment.count({ where }),
    ]);
    const verbose = await verboseOf(actor.organizationId);
    return listOf(rows.map(r => S.comment(r, { verbose })), total);
  },

  'comment.update': async ({ actor, params, body }) => {
    const c = await commentOf(actor, params.id);
    if (!['DRAFT', 'SCHEDULED', 'ERROR'].includes(c.status)) throw badRequest(`A ${c.status.toLowerCase()} comment cannot be edited here. Use the network's edit endpoint under /misc for published comments.`);
    const old = targetsOf(c);
    if (Object.values(old).some(t => t?.status === 'POSTED' || t?.status === 'PROCESSING')) throw badRequest('Part of this comment is already published. Retry it instead of editing.');
    const refsChanged = ['internalPostId', 'importedPostId', 'internalParentCommentId', 'fetchedParentCommentId'].some(k => k in body);
    const merged: Body = {
      teamId: c.teamId,
      title: 'title' in body ? body.title : c.title,
      internalPostId: refsChanged ? body.internalPostId ?? null : c.internalPostId,
      importedPostId: refsChanged ? body.importedPostId ?? null : c.importedPostId,
      internalParentCommentId: refsChanged ? body.internalParentCommentId ?? null : c.internalParentCommentId,
      fetchedParentCommentId: refsChanged ? body.fetchedParentCommentId ?? null : c.fetchedParentCommentId,
      postDate: body.postDate ?? c.postDate?.toISOString(),
      status: body.status ?? (c.status === 'ERROR' ? 'SCHEDULED' : (c.status as 'DRAFT' | 'SCHEDULED')),
      socialAccountTypes: body.socialAccountTypes ?? (Object.keys(old) as NetworkType[]),
      data: body.data ?? (body.text !== undefined ? undefined : (c.data as Body['data'])),
      text: body.text,
    };
    const postDate = merged.postDate ? parseDate(merged.postDate) : new Date();
    const p = await plan(actor, merged);
    const monthCounted = Object.values(old).some(t => t?.counted);
    const targets: Targets = {};
    for (const t of p.types) targets[t] = { socialAccountId: p.cands[t]!.socialAccountId, externalPostId: p.cands[t]!.externalPostId, parentExternalId: p.cands[t]!.parentExternalId, status: 'PENDING', attempts: 0, counted: monthCounted, dailyDay: null };
    await prisma.$transaction(async tx => {
      const locked = await tx.$queryRaw<{ status: PostStatus }[]>`SELECT status FROM "Comment" WHERE id = ${c.id} FOR UPDATE`;
      if (!locked.length || !['DRAFT', 'SCHEDULED', 'ERROR'].includes(locked[0].status)) throw badRequest('The comment started publishing and can no longer be edited.');
      // Daily caps move with the day and the accounts; the monthly count stays once.
      await releaseDailyFor(tx, old);
      if (merged.status === 'SCHEDULED') await consumeFor(tx, actor.organizationId, targets, p.accounts, postDate, monthCounted);
      await tx.comment.update({
        where: { id: c.id },
        data: {
          title: merged.title ?? null, internalPostId: merged.internalPostId ?? null, importedPostId: merged.importedPostId ?? null,
          internalParentCommentId: merged.internalParentCommentId ?? null, fetchedParentCommentId: merged.fetchedParentCommentId ?? null,
          postDate, status: merged.status, data: p.data, targets: targets as object, error: null, errors: Prisma.DbNull, errorsVerbose: Prisma.DbNull,
        },
      });
      await audit(tx, actor, 'comment.update', 'Comment', c.id, 'Updated a comment');
    });
    if (merged.status === 'SCHEDULED') await kickComment(c.id, postDate);
    return out(actor, c.id);
  },

  'comment.delete': async ({ actor, params }) => {
    const c = await commentOf(actor, params.id);
    if (c.status === 'DELETED') return S.comment(c);
    if (c.status === 'PROCESSING') throw badRequest('This comment is publishing right now. Wait for it to finish, then delete it.');
    const failures: string[] = [];
    for (const [type, t] of Object.entries(targetsOf(c)) as [NetworkType, Target][]) {
      if (t.status !== 'POSTED' || !t.externalId) { if (t.status !== 'DELETED') await patchTarget(c.id, type, null, { status: 'DELETED' }); continue; }
      const ad = adapter(type);
      if (!ad.deleteComment) { failures.push(`${ad.displayName}: deleting comments is not supported`); continue; }
      try {
        await ad.deleteComment(networkContext(type), await loadAccount(t.socialAccountId), t.externalId);
        await patchTarget(c.id, type, null, { status: 'DELETED' });
      } catch (err) { failures.push(`${ad.displayName}: ${(err as Error).message}`); }
    }
    await prisma.$transaction(async tx => {
      await tx.comment.update({ where: { id: c.id }, data: { status: 'DELETED', deletedAt: new Date(), error: failures.length ? `Could not delete on: ${failures.join('; ')}` : null } });
      await audit(tx, actor, 'comment.delete', 'Comment', c.id, 'Deleted a comment');
    });
    return out(actor, c.id);
  },

  'comment.retry': async ({ actor, params }) => {
    const c = await commentOf(actor, params.id);
    if (c.status !== 'ERROR') throw badRequest(`Only comments in ERROR can be retried (this one is ${c.status}).`);
    if (c.retryCount >= RESOURCE_LIMITS.maxRetries) throw badRequest(`This comment was already retried ${RESOURCE_LIMITS.maxRetries} times. Create a new comment.`);
    const failed = Object.entries(targetsOf(c)).filter(([, t]) => t?.status === 'ERROR');
    if (!failed.length) throw badRequest('Nothing to retry.');
    for (const [type] of failed) await patchTarget(c.id, type, null, { status: 'PENDING', attemptId: null, attempts: 0 });
    await prisma.$transaction(async tx => {
      await tx.comment.update({ where: { id: c.id }, data: { status: 'RETRYING', retryCount: { increment: 1 }, error: null } });
      await audit(tx, actor, 'comment.retry', 'Comment', c.id, `Retried a comment on ${failed.map(([k]) => k).join(', ')}`);
    });
    await kickComment(c.id, new Date());
    return out(actor, c.id);
  },
});

// ───────────────────────────── comment import ─────────────────────────────

/** Fetch a post's comments from the network into FetchedComment (paged, capped per post by plan). */
export async function runCommentImport(importId: string) {
  const claimed = await prisma.commentImport.updateMany({ where: { id: importId, status: { in: ['PENDING', 'RETRYING', 'RATE_LIMITED'] } }, data: { status: 'FETCHING', startedAt: new Date(), error: null, rateLimitResetAt: null } });
  if (!claimed.count) return 'skipped';
  const imp = await prisma.commentImport.findUniqueOrThrow({ where: { id: importId } });
  const type = imp.type as NetworkType;
  const ad = adapter(type);
  let fetched = 0; let cursor: string | null = null;
  const events: string[] = [];
  try {
    const account = await loadAccount(imp.socialAccountId);
    for (let page = 0; page < 100 && fetched < imp.limit; page++) {
      const want = Math.min(100, imp.limit - fetched);
      const r = await metered(imp.organizationId!, type, 'TWITTER_POST_READ', want, { type: 'CommentImport', id: importId },
        () => ad.importComments!(networkContext(type), account, { externalPostId: imp.externalPostId!, cursor, limit: want }), x => x.items.length);
      for (const it of r.items.slice(0, want)) {
        const existing = await prisma.fetchedComment.findUnique({ where: { socialAccountId_externalId: { socialAccountId: imp.socialAccountId, externalId: it.externalId } } });
        const fields = {
          externalParentId: it.externalParentId ?? null, externalPostId: it.externalPostId ?? imp.externalPostId, authorName: it.authorName ?? null, authorExternalId: it.authorExternalId ?? null,
          authorProfileUrl: it.authorProfileUrl ?? null, authorAvatarUrl: it.authorAvatarUrl ?? null, text: it.text ?? null, likesCount: it.likesCount ?? 0, repliesCount: it.repliesCount ?? 0,
          publishedAt: it.publishedAt ?? null, platformData: { origin: 'platform', ...(it.platformData ?? {}) } as object,
        };
        // Facebook leaves out `from` for people without a role on the app until the app has Advanced Access: keep
        // the author a webhook already gave us instead of blanking it, and keep what the webhook noted.
        if (existing) await prisma.fetchedComment.update({ where: { id: existing.id }, data: {
          ...fields, importId,
          authorName: fields.authorName ?? existing.authorName, authorExternalId: fields.authorExternalId ?? existing.authorExternalId,
          authorProfileUrl: fields.authorProfileUrl ?? existing.authorProfileUrl, authorAvatarUrl: fields.authorAvatarUrl ?? existing.authorAvatarUrl,
          platformData: { ...((existing.platformData as object) ?? {}), ...(fields.platformData as object) } as object,
        } });
        else {
          const row = await prisma.fetchedComment.create({ data: { ...fields, teamId: imp.teamId, organizationId: imp.organizationId, postId: imp.postId, importedPostId: imp.importedPostId, socialAccountId: imp.socialAccountId, importId, platform: type, externalId: it.externalId } });
          events.push(...(await emit(prisma, imp.organizationId!, 'comment.received', fetchedComment(row))));
        }
        fetched++;
      }
      await prisma.commentImport.update({ where: { id: importId }, data: { commentsCount: fetched } });
      cursor = r.nextCursor ?? null;
      if (!cursor || !r.items.length) break;
    }
    await prisma.commentImport.update({ where: { id: importId }, data: { status: 'COMPLETED', commentsCount: fetched, completedAt: new Date() } });
    return 'COMPLETED';
  } catch (err) {
    if (isNetworkError(err) && err.code === 'RATE_LIMITED') {
      const at = err.rateLimitResetAt ?? new Date(Date.now() + 15 * 60_000);
      await prisma.commentImport.update({ where: { id: importId }, data: { status: 'RATE_LIMITED', rateLimitResetAt: at, commentsCount: fetched, error: err.message } });
      await enqueue(JOBS.importComments, { importId }, { singletonKey: `cimp:${importId}:${at.getTime()}`, startAfter: at, retryLimit: 0 });
      return 'RATE_LIMITED';
    }
    if (isNetworkError(err) && err.code === 'TOKEN_INVALID') await markNeedsReconnect(prisma, imp.socialAccountId, err.message);
    if (!isNetworkError(err)) logger.error({ err, importId }, 'comment import crashed');
    await prisma.commentImport.update({ where: { id: importId }, data: { status: 'FAILED', commentsCount: fetched, error: (err as Error).message?.slice(0, 1000) ?? 'Import failed.', completedAt: new Date() } });
    return 'FAILED';
  } finally {
    void flushDeliveries(events);
  }
}
registerJob(JOBS.importComments, d => runCommentImport(d.importId));

async function fetchedOf(actor: Actor, id: string, teamId?: string) {
  const fc = await prisma.fetchedComment.findFirst({ where: { id, organizationId: actor.organizationId, ...(teamId ? { teamId } : {}) } });
  if (!fc) throw notFound('Comment');
  return fc;
}

define({
  'comment.importCreate': async ({ actor, body }) => {
    const account = await accountOf(actor, body.teamId, body.socialAccountType);
    const type = account.type as NetworkType;
    const ad = adapter(type);
    if (!ad.capabilities.commentImport || !ad.importComments) throw badRequest(`${ad.displayName} comment import is not available${isConfigured(type) ? '' : ' on this server yet'}.`);
    if (!body.postId && !body.importedPostId) throw badRequest('Set postId (a post published through Siar) or importedPostId (an imported post).', [{ code: 'required', message: 'postId or importedPostId is required', path: ['postId'] }]);
    let externalPostId: string | null = null;
    if (body.postId) {
      const t = await prisma.postSocialAccount.findFirst({ where: { postId: body.postId, socialAccountId: account.id, post: { organizationId: actor.organizationId } } });
      if (!t) throw notFound(`Post on ${ad.displayName}`);
      if (!t.externalPostId) throw badRequest(`The post is not published on ${ad.displayName} yet.`);
      externalPostId = t.externalPostId;
    } else {
      const pp = await prisma.profilePost.findFirst({ where: { id: body.importedPostId, socialAccountId: account.id, deletedAt: null } });
      if (!pp?.externalId) throw notFound(`Imported post on ${ad.displayName}`);
      externalPostId = pp.externalId;
    }
    const org = await prisma.organization.findUniqueOrThrow({ where: { id: actor.organizationId } });
    const limit = limitsFor(org).commentImportPerPost;
    const imp = await prisma.$transaction(async tx => {
      const running = await tx.commentImport.findFirst({ where: { socialAccountId: account.id, externalPostId, status: { in: ['PENDING', 'FETCHING', 'RETRYING'] } } });
      if (running) return running;
      const row = await tx.commentImport.create({ data: { teamId: body.teamId, organizationId: actor.organizationId, socialAccountId: account.id, type, postId: body.postId ?? null, importedPostId: body.importedPostId ?? null, externalPostId, limit } });
      await audit(tx, actor, 'comment.import', 'CommentImport', row.id, `Started importing ${ad.displayName} comments (up to ${limit})`);
      return row;
    });
    await enqueue(JOBS.importComments, { importId: imp.id }, { singletonKey: `cimp:${imp.id}`, retryLimit: 0 });
    return commentImport(imp);
  },

  'comment.importGetList': async ({ actor, query }) => {
    await teamOf(actor, query.teamId);
    const pg = pageOf(query);
    const statusIn = query.status === 'FETCHING' ? ['FETCHING', 'FETCHING_POSTS', 'FETCHING_ANALYTICS'] : query.status ? [query.status] : null;
    const rows = await prisma.commentImport.findMany({
      where: { teamId: query.teamId, organizationId: actor.organizationId, deletedAt: null, ...(query.postId ? { postId: query.postId } : {}), ...(query.importedPostId ? { importedPostId: query.importedPostId } : {}), ...(statusIn ? { status: { in: statusIn as any } } : {}) },
      orderBy: { createdAt: 'desc' }, ...pg,
    });
    return { imports: rows.map(commentImport) };
  },

  'comment.importGetById': async ({ actor, params }) => {
    const i = await prisma.commentImport.findFirst({ where: { id: params.importId, organizationId: actor.organizationId, deletedAt: null } });
    if (!i) throw notFound('Comment import');
    return commentImport(i);
  },

  'comment.importGetFetchedComments': async ({ actor, query }) => {
    await teamOf(actor, query.teamId);
    const pg = pageOf(query);
    const where: Prisma.FetchedCommentWhereInput = {
      teamId: query.teamId, organizationId: actor.organizationId, deletedAt: null,
      ...(query.postId ? { postId: query.postId } : {}), ...(query.importedPostId ? { importedPostId: query.importedPostId } : {}),
      ...(query.platform ? { platform: query.platform } : {}), ...(query.socialAccountId ? { socialAccountId: query.socialAccountId } : {}),
    };
    const [rows, total] = await Promise.all([prisma.fetchedComment.findMany({ where, orderBy: [{ publishedAt: { sort: 'desc', nulls: 'last' } }, { id: 'desc' }], ...pg }), prisma.fetchedComment.count({ where })]);
    return { items: rows.map(fetchedComment), total };
  },

  'comment.importActionFetchedComment': async ({ actor, params, body }) => {
    await teamOf(actor, body.teamId);
    const fc = await fetchedOf(actor, params.commentId, body.teamId);
    if (fc.deletedAt) throw notFound('Comment');
    const type = fc.platform as NetworkType;
    const ad = adapter(type);
    const action = body.action as CommentAction;
    if (!ad.commentAction || !ad.capabilities.commentActions.includes(action)) throw badRequest(`${ad.displayName} does not support ${action} on comments.${ad.capabilities.commentActions.length ? ` Supported: ${ad.capabilities.commentActions.join(', ')}.` : ''}`);
    const account = await loadAccount(fc.socialAccountId).catch(networkFailure);
    await ad.commentAction(networkContext(type), account, { externalId: fc.externalId, externalPostId: fc.externalPostId }, action).catch(networkFailure);
    const pd = { ...((fc.platformData as object) ?? {}) } as Record<string, unknown>;
    const data: Prisma.FetchedCommentUpdateInput = {};
    if (action === 'DELETE') data.deletedAt = new Date();
    if (action === 'HIDE' || action === 'UNHIDE') { data.hidden = action === 'HIDE'; pd.hideStatus = action === 'HIDE' ? 'HIDDEN' : 'VISIBLE'; }
    if (action === 'LIKE' || action === 'UNLIKE') { data.liked = action === 'LIKE'; data.likesCount = Math.max(0, fc.likesCount + (action === 'LIKE' ? (fc.liked ? 0 : 1) : (fc.liked ? -1 : 0))); }
    if (action === 'APPROVE' || action === 'REJECT') pd.approvalStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
    if (body.reason) pd.actionReason = body.reason;
    if (body.banAuthor) pd.authorBanRequested = true;
    data.platformData = pd as object;
    const updated = await prisma.$transaction(async tx => {
      const u = await tx.fetchedComment.update({ where: { id: fc.id }, data });
      await audit(tx, actor, 'comment.action', 'FetchedComment', fc.id, `${action} on a ${ad.displayName} comment`);
      return u;
    });
    return { success: true, item: fetchedComment(updated) };
  },
});

/** misc lookup: one of our comments or a fetched comment → the network ids. */
export async function lookupComment(organizationId: string, type: NetworkType, id: string) {
  const c = await prisma.comment.findFirst({ where: { id, organizationId } });
  if (c) {
    const t = targetsOf(c)[type];
    if (!t?.externalId) throw notFound(`Comment on ${adapter(type).displayName}`);
    return { externalId: t.externalId, externalPostId: t.externalPostId };
  }
  const fc = await prisma.fetchedComment.findFirst({ where: { id, organizationId, platform: type } });
  if (!fc) throw notFound('Comment');
  return { externalId: fc.externalId, externalPostId: fc.externalPostId };
}
