import { randomUUID } from 'node:crypto';
import { isNetworkError, NetworkError, type NetworkType, type PublishInput, type PublishResult } from '@siar/networks';
import { sha256 } from '../platform/crypto.js';
import { prisma } from '../platform/db.js';
import { emit, flushDeliveries, notify } from '../platform/events.js';
import { logger } from '../platform/logger.js';
import { adapter, loadAccount, markNeedsReconnect, mediaRef, networkContext } from '../platform/networks.js';
import { enqueue, JOBS } from '../platform/queue.js';
import * as credits from '../domain/credits.js';
import * as S from '../domain/serialize.js';
import type { XAction } from '../domain/plans.js';

/**
 * Publishing, one network target (PostSocialAccount) at a time.
 *
 *   PENDING ──claim──▶ PROCESSING ──network says done──▶ POSTED
 *                          │   └──network accepted, finishing async──▶ (poll) ──▶ POSTED | REVIEW | ERROR
 *                          └──failure──▶ ERROR   (transient failures go back to PENDING up to 3 attempts)
 *
 * Never post twice (docs/PLAN.md §3 rule 3): a target is claimed with a conditional UPDATE carrying a
 * fresh attemptId; only the claimant publishes. The external id is saved the moment the network
 * returns it. A claim that dies mid-flight (crash) is reconciled by reading the account's recent posts
 * before anything is re-sent (staleClaims).
 */

const AUTO_ATTEMPTS = 3;
const MAX_POLLS = 180;
const STALE_CLAIM_MS = 20 * 60_000;

/** Enqueue publishing for every pending target of a post (now, or at postDate). */
export async function kickTargets(postId: string, at: Date) {
  const targets = await prisma.postSocialAccount.findMany({ where: { postId, targetStatus: 'PENDING' }, select: { socialAccountId: true } });
  const startAfter = at.getTime() > Date.now() + 1000 ? at : undefined;
  for (const t of targets) await enqueue(JOBS.publishTarget, { postId, socialAccountId: t.socialAccountId }, { singletonKey: `pub:${postId}:${t.socialAccountId}:${at.getTime()}`, startAfter, retryLimit: 0 });
}

/** Minute sweep: anything due that no job picked up (restarts, edits that moved the date). */
export async function dispatchDue() {
  const due = await prisma.postSocialAccount.findMany({
    // nextPollAt on a PENDING target is a "not before" (transient-failure backoff, media still converting).
    where: { targetStatus: 'PENDING', OR: [{ nextPollAt: null }, { nextPollAt: { lte: new Date() } }], post: { status: { in: ['SCHEDULED', 'RETRYING', 'PROCESSING'] }, postDate: { lte: new Date() }, deletedAt: null } },
    select: { postId: true, socialAccountId: true }, take: 500,
  });
  for (const t of due) await enqueue(JOBS.publishTarget, { postId: t.postId, socialAccountId: t.socialAccountId }, { singletonKey: `pub:${t.postId}:${t.socialAccountId}:sweep`, retryLimit: 0 });
  const polls = await prisma.postSocialAccount.findMany({ where: { targetStatus: { in: ['PROCESSING', 'REVIEW'] }, pendingRef: { not: null }, nextPollAt: { lte: new Date() } }, select: { postId: true, socialAccountId: true }, take: 500 });
  for (const t of polls) await enqueue(JOBS.pollTarget, { postId: t.postId, socialAccountId: t.socialAccountId }, { singletonKey: `poll:${t.postId}:${t.socialAccountId}`, retryLimit: 0 });
  return due.length + polls.length;
}

const hasUrl = (s: unknown) => typeof s === 'string' && /https?:\/\/\S+/i.test(s);

/** X: which metered action, and how many (one per tweet in a thread). */
function meteredAction(data: Record<string, any>): { action: XAction; count: number } {
  const texts = [data.text, ...(data.thread ?? []).map((t: any) => t?.text)];
  return { action: texts.some(hasUrl) ? 'TWITTER_CONTENT_CREATE_WITH_URL' : 'TWITTER_CONTENT_CREATE', count: 1 + (data.thread?.length ?? 0) };
}

async function buildInput(postId: string, socialAccountId: string): Promise<PublishInput & { orgId: string; teamId: string }> {
  const post = await prisma.post.findUniqueOrThrow({ where: { id: postId } });
  const t = await prisma.postSocialAccount.findUniqueOrThrow({ where: { postId_socialAccountId: { postId, socialAccountId } } });
  const type = t.type as NetworkType;
  const entry = ((post.data as Record<string, any>)[type] ?? {}) as Record<string, any>;
  const account = await loadAccount(socialAccountId);
  const ids: string[] = entry.mediaItems?.length ? entry.mediaItems.map((m: any) => m.uploadId) : entry.carouselItems?.length ? entry.carouselItems.map((c: any) => c.uploadId ?? c.uploadIds?.[0]).filter(Boolean) : entry.uploadIds ?? [];
  const alt = new Map<string, string>((entry.mediaItems ?? []).filter((m: any) => m.altText).map((m: any) => [m.uploadId, m.altText]));
  const rows = ids.length ? await prisma.upload.findMany({ where: { id: { in: ids } } }) : [];
  const failed = rows.find(u => u.status === 'FAILED');
  if (failed) throw new NetworkError('MEDIA_INVALID', `The video ${failed.originalName ?? failed.id} could not be converted to a format the networks accept. Upload it again as MP4 (H.264/AAC).`);
  const notReady = rows.find(u => u.status !== 'READY');
  if (notReady) throw Object.assign(new NetworkError('NETWORK_UNAVAILABLE', 'Media is still being processed.'), { notReady: true });
  const media = ids.map(id => rows.find(r => r.id === id)).filter(Boolean).map(u => mediaRef(u!, alt.get(u!.id) ?? (entry.altText && ids.length === 1 ? entry.altText : null)));
  if (media.length !== ids.length) throw new NetworkError('MEDIA_INVALID', 'One of the uploads was deleted before publishing.');
  const team = await prisma.team.findUniqueOrThrow({ where: { id: post.teamId }, include: { bots: true } });
  const bot = (type === 'DISCORD' || type === 'SLACK') && (entry.username || entry.avatarUrl) ? { name: entry.username ?? team.bots[0]?.name ?? 'Siar', avatarUrl: entry.avatarUrl ?? null } : null;
  return {
    orgId: post.organizationId!, teamId: post.teamId, account, postId, title: post.title, data: entry, media, bot,
    resolveUpload: async id => {
      const u = await prisma.upload.findFirst({ where: { id, organizationId: post.organizationId } });
      if (!u) throw new NetworkError('MEDIA_INVALID', `Upload ${id} was not found.`);
      if (u.status === 'FAILED') throw new NetworkError('MEDIA_INVALID', `Upload ${id} could not be converted.`);
      if (u.status !== 'READY') throw Object.assign(new NetworkError('NETWORK_UNAVAILABLE', 'Media is still being processed.'), { notReady: true });
      return mediaRef(u);
    },
  };
}

/** Run one target. Safe to call twice — the second call finds nothing to claim. */
export async function publishTarget(postId: string, socialAccountId: string) {
  const attemptId = randomUUID();
  const claimed = await prisma.$executeRaw`
    UPDATE "PostSocialAccount" t SET "targetStatus" = 'PROCESSING', "attemptId" = ${attemptId}, "claimedAt" = now(), "attempts" = t."attempts" + 1, "nextPollAt" = NULL, "updatedAt" = now()
    FROM "Post" p
    WHERE t."postId" = ${postId} AND t."socialAccountId" = ${socialAccountId} AND t."targetStatus" = 'PENDING'
      AND (t."nextPollAt" IS NULL OR t."nextPollAt" <= now() + interval '2 seconds')
      AND p.id = t."postId" AND p."deletedAt" IS NULL AND p.status IN ('SCHEDULED', 'RETRYING', 'PROCESSING') AND p."postDate" <= now() + interval '5 seconds'`;
  if (!claimed) return 'skipped';
  await prisma.post.updateMany({ where: { id: postId, status: { in: ['SCHEDULED', 'RETRYING'] } }, data: { status: 'PROCESSING' } });

  const target = await prisma.postSocialAccount.findUniqueOrThrow({ where: { postId_socialAccountId: { postId, socialAccountId } }, include: { socialAccount: true } });
  const type = target.type as NetworkType;
  const ad = adapter(type);
  let holdId: string | null = null;
  let input: Awaited<ReturnType<typeof buildInput>> | null = null;
  try {
    if (target.socialAccount.deletedAt) throw new NetworkError('NOT_FOUND', 'The social account was disconnected before publishing.', { userFacingMessage: 'The social account was disconnected. Reconnect it and retry.' });
    if (target.socialAccount.state === 'NEEDS_RECONNECT') throw new NetworkError('TOKEN_INVALID', target.socialAccount.stateReason ?? 'The account needs to be reconnected.', { userFacingMessage: 'Reconnect this account, then retry the post.' });
    input = await buildInput(postId, socialAccountId);
    const contentHash = sha256(JSON.stringify({ type, data: input.data }));
    await prisma.postSocialAccount.update({ where: { postId_socialAccountId: { postId, socialAccountId } }, data: { contentHash } });

    if (ad.capabilities.metered) {
      const m = meteredAction(input.data);
      const h = await credits.hold(input.orgId, m.action, m.count, { type: 'PostSocialAccount', id: `${postId}:${socialAccountId}` }).catch(err => {
        throw new NetworkError('PERMISSION', (err as Error).message, { userFacingMessage: 'Not enough X credit. Top up in Billing → Credits, then retry.', retryability: 'non_retryable' });
      });
      holdId = h.id;
      await prisma.postSocialAccount.update({ where: { postId_socialAccountId: { postId, socialAccountId } }, data: { creditHoldId: holdId } });
    }

    const result = await ad.publish(networkContext(type), input);
    await settle(postId, socialAccountId, attemptId, result, input.orgId);
    if (holdId) await credits.capture(holdId, `X post ${postId}`);
    return result.status;
  } catch (err) {
    if (holdId) await credits.release(holdId);
    if ((err as any)?.notReady) {
      // Media still converting: hand the target back and try again shortly (not an attempt).
      await prisma.postSocialAccount.updateMany({ where: { postId, socialAccountId, attemptId }, data: { targetStatus: 'PENDING', attemptId: null, attempts: { decrement: 1 }, nextPollAt: new Date(Date.now() + 30_000) } });
      await enqueue(JOBS.publishTarget, { postId, socialAccountId }, { singletonKey: `pub:${postId}:${socialAccountId}:media:${Date.now()}`, startAfter: 30_000, retryLimit: 0 });
      return 'waiting-media';
    }
    await fail(postId, socialAccountId, attemptId, err, target.attempts + 1);
    return 'error';
  }
}

/** Record a network result for a claimed target. */
async function settle(postId: string, socialAccountId: string, attemptId: string, r: PublishResult, orgId: string) {
  const where = { postId, socialAccountId, attemptId };
  if (r.status === 'POSTED') {
    const now = new Date();
    await prisma.postSocialAccount.updateMany({ where, data: { targetStatus: 'POSTED', externalPostId: r.externalPostId, externalAlternatePostId: r.externalAlternatePostId ?? null, externalVideoId: r.externalVideoId ?? null, permalink: r.permalink ?? null, publishedAt: now, pendingRef: null, nextPollAt: null, error: undefined, externalData: (r.externalData ?? undefined) as object | undefined } });
    await prisma.profilePost.upsert({
      where: { socialAccountId_externalId: { socialAccountId, externalId: r.externalPostId } },
      update: { postId, internal: true, permalink: r.permalink ?? null },
      create: { socialAccountId, externalId: r.externalPostId, postId, internal: true, permalink: r.permalink ?? null, publishedAt: now, title: (await prisma.post.findUnique({ where: { id: postId }, select: { title: true } }))?.title ?? null },
    }).catch(err => logger.warn({ err }, 'profile post upsert failed'));
    await firstComment(postId, socialAccountId).catch(err => logger.warn({ err, postId }, 'first comment failed'));
  } else {
    const ref = r.pendingRef ?? null;
    await prisma.postSocialAccount.updateMany({
      where, data: {
        targetStatus: r.status === 'REVIEW' ? 'REVIEW' : 'PROCESSING', pendingRef: ref,
        externalPostId: r.status === 'REVIEW' ? r.externalPostId ?? null : undefined, permalink: r.status === 'REVIEW' ? r.permalink ?? null : undefined,
        nextPollAt: ref ? new Date(Date.now() + (r.pollAfterMs ?? 15_000)) : null, externalData: (r.externalData ?? undefined) as object | undefined,
      },
    });
    if (ref) await enqueue(JOBS.pollTarget, { postId, socialAccountId }, { singletonKey: `poll:${postId}:${socialAccountId}`, startAfter: r.pollAfterMs ?? 15_000, retryLimit: 0 });
  }
  await recomputePost(postId);
}

async function fail(postId: string, socialAccountId: string, attemptId: string, err: unknown, attempts: number) {
  const ne = isNetworkError(err) ? err : new NetworkError('UNKNOWN', (err as Error)?.message ?? String(err));
  if (!isNetworkError(err)) logger.error({ err, postId, socialAccountId }, 'publish crashed');
  if (ne.code === 'TOKEN_INVALID') await markNeedsReconnect(prisma, socialAccountId, ne.message);
  // Transient failures retry on their own (they do not use up the 6 manual retries).
  if (ne.isTransient && attempts < AUTO_ATTEMPTS) {
    const delay = ne.rateLimitResetAt ? Math.max(5_000, ne.rateLimitResetAt.getTime() - Date.now()) : 30_000 * 2 ** (attempts - 1);
    await prisma.postSocialAccount.updateMany({ where: { postId, socialAccountId, attemptId }, data: { targetStatus: 'PENDING', attemptId: null, error: ne.toVerbose() as object, nextPollAt: new Date(Date.now() + delay) } });
    await enqueue(JOBS.publishTarget, { postId, socialAccountId }, { singletonKey: `pub:${postId}:${socialAccountId}:auto:${attempts}`, startAfter: delay, retryLimit: 0 });
    return;
  }
  await prisma.postSocialAccount.updateMany({ where: { postId, socialAccountId, attemptId }, data: { targetStatus: 'ERROR', error: ne.toVerbose() as object, pendingRef: null, nextPollAt: null } });
  await recomputePost(postId);
}

/** Ask the network how an async publish is going (IG containers, TikTok, YouTube processing…). */
export async function pollTarget(postId: string, socialAccountId: string) {
  const t = await prisma.postSocialAccount.findUnique({ where: { postId_socialAccountId: { postId, socialAccountId } } });
  if (!t || !t.pendingRef || !['PROCESSING', 'REVIEW'].includes(t.targetStatus) || !t.attemptId) return 'skipped';
  const ad = adapter(t.type as NetworkType);
  if (!ad.poll) return 'skipped';
  const bumped = await prisma.postSocialAccount.updateMany({ where: { postId, socialAccountId, attemptId: t.attemptId, pollCount: t.pollCount }, data: { pollCount: { increment: 1 }, nextPollAt: null } });
  if (!bumped.count) return 'skipped';
  try {
    const input = await buildInput(postId, socialAccountId);
    const r = await ad.poll(networkContext(t.type as NetworkType), input, t.pendingRef);
    if ((r.status === 'PROCESSING' || (r.status === 'REVIEW' && r.pendingRef)) && t.pollCount + 1 >= MAX_POLLS) throw new NetworkError('NETWORK_UNAVAILABLE', 'The network did not finish processing the post in time.', { retryability: 'retryable' });
    await settle(postId, socialAccountId, t.attemptId, r, input.orgId);
    return r.status;
  } catch (err) {
    await fail(postId, socialAccountId, t.attemptId, err, AUTO_ATTEMPTS);
    return 'error';
  }
}

/** Publish the post's first comment for this network, right after the post went live. */
async function firstComment(postId: string, socialAccountId: string) {
  const post = await prisma.post.findUniqueOrThrow({ where: { id: postId } });
  const t = await prisma.postSocialAccount.findUniqueOrThrow({ where: { postId_socialAccountId: { postId, socialAccountId } } });
  const raw = (post.firstComment as Record<string, any> | null)?.[t.type];
  const text = typeof raw === 'string' ? raw : raw?.text;
  if (!text || t.firstCommentStatus === 'POSTED' || !t.externalPostId) return;
  const fc = typeof raw === 'object' && raw ? raw : { text };
  const ad = adapter(t.type as NetworkType);
  if (!ad.comment) return;
  try {
    const account = await loadAccount(socialAccountId);
    const media = fc.uploadIds?.length ? (await prisma.upload.findMany({ where: { id: { in: fc.uploadIds } } })).map(u => mediaRef(u)) : [];
    const r = await ad.comment(networkContext(t.type as NetworkType), { account, externalPostId: t.externalPostId, text, media, data: fc });
    await prisma.postSocialAccount.update({ where: { postId_socialAccountId: { postId, socialAccountId } }, data: { firstCommentStatus: 'POSTED', firstCommentExternalId: r.externalId } });
  } catch (err) {
    await prisma.postSocialAccount.update({ where: { postId_socialAccountId: { postId, socialAccountId } }, data: { firstCommentStatus: 'ERROR', externalData: { ...((t.externalData as object) ?? {}), firstCommentError: (err as Error).message } } });
  }
}

/**
 * Derive Post.status from its targets and fire post.published once the post reaches a final state.
 *   any target still PENDING (due) / PROCESSING → PROCESSING
 *   none in flight, any REVIEW                  → REVIEW
 *   all POSTED                                  → POSTED
 *   none in flight, any ERROR                   → ERROR
 */
export async function recomputePost(postId: string) {
  const post = await prisma.post.findUnique({ where: { id: postId }, include: { socialAccounts: true } });
  if (!post || post.status === 'DELETED' || post.status === 'DRAFT') return;
  const ts = post.socialAccounts.filter(t => t.targetStatus !== 'DELETED');
  if (!ts.length) return;
  const inFlight = ts.some(t => t.targetStatus === 'PROCESSING' || (t.targetStatus === 'PENDING' && post.postDate && post.postDate <= new Date()));
  const pendingFuture = ts.some(t => t.targetStatus === 'PENDING') && !inFlight;
  let status = post.status;
  if (inFlight) status = 'PROCESSING';
  else if (pendingFuture) status = post.status === 'RETRYING' ? 'RETRYING' : 'SCHEDULED';
  else if (ts.some(t => t.targetStatus === 'ERROR')) status = 'ERROR';
  else if (ts.some(t => t.targetStatus === 'REVIEW')) status = 'REVIEW';
  else if (ts.every(t => t.targetStatus === 'POSTED')) status = 'POSTED';
  const final = status === 'POSTED' || status === 'ERROR';
  const errs = ts.filter(t => t.targetStatus === 'ERROR').map(t => `${t.type}: ${(t.error as any)?.userFacingMessage ?? (t.error as any)?.errorMessage ?? 'failed'}`);
  const postedDate = status === 'POSTED' ? ts.reduce<Date | null>((m, t) => (t.publishedAt && (!m || t.publishedAt > m) ? t.publishedAt : m), null) : post.postedDate;
  const changed = await prisma.post.updateMany({
    where: { id: postId, status: post.status },
    data: { status, postedDate, error: errs.length ? errs.join(' · ').slice(0, 2000) : null, ...S.targetMaps(post.socialAccounts, true) as any },
  });
  if (changed.count && final && post.status !== status) {
    const full = await prisma.post.findUniqueOrThrow({ where: { id: postId }, include: { uploads: { include: { upload: true } }, socialAccounts: { include: { socialAccount: true } } } });
    const ids = await emit(prisma, full.organizationId!, 'post.published', S.post(full, { verbose: true }));
    void flushDeliveries(ids);
    await prisma.upload.updateMany({ where: { posts: { some: { postId } } }, data: { pinned: false, lastUsedAt: new Date() } });
    if (status === 'ERROR') await notify(prisma, full.organizationId!, { kind: 'post.error', title: `"${full.title}" failed to publish`, body: errs.join('\n').slice(0, 500), link: `/posts/${postId}` });
  }
}

/**
 * Claims older than 20 minutes with nothing to poll: the worker died between the network call and
 * the save. Ask the network whether the post exists before re-sending anything.
 */
export async function staleClaims() {
  const stale = await prisma.postSocialAccount.findMany({ where: { targetStatus: 'PROCESSING', pendingRef: null, claimedAt: { lt: new Date(Date.now() - STALE_CLAIM_MS) } }, include: { post: true }, take: 100 });
  for (const t of stale) {
    const ad = adapter(t.type as NetworkType);
    let found: { externalId: string; permalink?: string | null } | undefined;
    if (ad.recentPosts) {
      try {
        const account = await loadAccount(t.socialAccountId);
        const text = String(((t.post.data as any)?.[t.type]?.text ?? '')).trim().slice(0, 60);
        const recent = await ad.recentPosts(networkContext(t.type as NetworkType), account, new Date(t.claimedAt!.getTime() - 60_000));
        found = recent.find(r => text && (r.text ?? '').trim().startsWith(text));
      } catch (err) { logger.warn({ err, postId: t.postId }, 'reconcile lookup failed'); }
    }
    if (found) await settle(t.postId, t.socialAccountId, t.attemptId!, { status: 'POSTED', externalPostId: found.externalId, permalink: found.permalink ?? null, externalData: { reconciled: true } }, t.post.organizationId!);
    else if (t.attempts < AUTO_ATTEMPTS && ad.recentPosts) {
      await prisma.postSocialAccount.updateMany({ where: { postId: t.postId, socialAccountId: t.socialAccountId, attemptId: t.attemptId }, data: { targetStatus: 'PENDING', attemptId: null } });
      await enqueue(JOBS.publishTarget, { postId: t.postId, socialAccountId: t.socialAccountId }, { singletonKey: `pub:${t.postId}:${t.socialAccountId}:stale:${t.attempts}`, retryLimit: 0 });
    } else {
      // Cannot tell whether it went out: never risk a double post. Surface it instead.
      await fail(t.postId, t.socialAccountId, t.attemptId!, new NetworkError('UNKNOWN', 'Publishing was interrupted and the result could not be confirmed. Check the account before retrying.', { retryability: 'unknown' }), AUTO_ATTEMPTS);
    }
  }
  return stale.length;
}
