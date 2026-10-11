import { isNetworkError, type AccountMetrics, type NetworkType, type PostMetrics } from '@siar/networks';
import { prisma } from '../platform/db.js';
import { badRequest, forbidden, notFound, quotaExceeded } from '../platform/errors.js';
import { logger } from '../platform/logger.js';
import { adapter, loadAccount, markNeedsReconnect, networkContext } from '../platform/networks.js';
import { enqueue, JOBS } from '../platform/queue.js';
import { define } from '../platform/routes.js';
import type { Actor } from '../platform/auth.js';
import * as S from '../domain/serialize.js';
import { accountKey, consumeDaily, releaseDaily } from '../domain/quota.js';
import { registerJob } from '../engine/jobs.js';
import { accountOf, networkFailure } from './accounts.js';
import { accountAnalytics, analyticsPost, listParam, metered, postAnalytics, profilePost, requireAnalytics } from './content-shared.js';
import { dispatchDueComments, staleCommentClaims } from './content-comments.js';

/**
 * Analytics. Snapshots are append-only rows (SocialAccountAnalytics, PostAnalytics per ProfilePost),
 * written by the 3-hourly sweep (accounts daily; posts hourly-ish for 24 h, then daily for 30 days)
 * and by forced refreshes (capped per day). X is never swept: its reads are billed per resource,
 * so X analytics only refresh when asked, metered, at most 5 times per post/account per 24 h.
 */

const X_ROLLING_CAP = 5;
const DAY = 86_400_000;
const n = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? Math.round(v) : 0);
const postInclude = { uploads: { include: { upload: true } }, socialAccounts: { include: { socialAccount: true } } } as const;

const postRow = (m: PostMetrics) => ({ impressions: n(m.impressions), impressionsUnique: n(m.impressionsUnique), views: n(m.views), viewsUnique: n(m.viewsUnique), likes: n(m.likes), dislikes: n(m.dislikes), comments: n(m.comments), shares: n(m.shares), saves: n(m.saves), raw: (m.raw ?? undefined) as object | undefined });
const accountRow = (m: AccountMetrics) => ({ impressions: n(m.impressions), impressionsUnique: n(m.impressionsUnique), views: n(m.views), viewsUnique: n(m.viewsUnique), likes: n(m.likes), comments: n(m.comments), postCount: n(m.postCount), followers: n(m.followers), following: n(m.following), raw: (m.raw ?? undefined) as object | undefined, audience: (m.audience ?? undefined) as object | undefined });

/** Save a PostAnalytics snapshot from metrics the network already returned (history import). */
export async function savePostMetrics(profilePostId: string, m: PostMetrics, forced = false) {
  const row = await prisma.postAnalytics.create({ data: { profilePostId, ...postRow(m), forced } });
  await prisma.profilePost.update({ where: { id: profilePostId }, data: { analyticsRefreshedAt: new Date() } });
  return row;
}

/** Read the account's metrics from the network and store a snapshot. */
export async function refreshAccountAnalytics(socialAccountId: string, forced = false) {
  const a = await prisma.socialAccount.findUniqueOrThrow({ where: { id: socialAccountId } });
  const type = a.type as NetworkType;
  const ad = adapter(type);
  if (!ad.accountAnalytics) throw badRequest(`${ad.displayName} does not provide account analytics.`);
  const m = await ad.accountAnalytics(networkContext(type), await loadAccount(a.id));
  const row = await prisma.socialAccountAnalytics.create({ data: { socialAccountId, ...accountRow(m), forced } });
  await prisma.socialAccount.update({ where: { id: socialAccountId }, data: { analyticsRefreshedAt: new Date() } });
  return row;
}

/** Read one post's metrics from the network and store a snapshot (X: metered by the caller). */
export async function refreshPostAnalytics(profilePostId: string, forced = false) {
  const pp = await prisma.profilePost.findUniqueOrThrow({ where: { id: profilePostId }, include: { socialAccount: true } });
  const type = pp.socialAccount.type as NetworkType;
  const ad = adapter(type);
  if (!ad.postAnalytics) throw badRequest(`${ad.displayName} does not provide post analytics.`);
  if (!pp.externalId) throw badRequest('This post has no network id yet.');
  try {
    const m = await ad.postAnalytics(networkContext(type), await loadAccount(pp.socialAccountId), pp.externalId, (pp.extraData as Record<string, unknown>) ?? undefined);
    return await savePostMetrics(pp.id, m, forced);
  } catch (err) {
    if (isNetworkError(err) && err.code === 'NOT_FOUND') await prisma.profilePost.update({ where: { id: pp.id }, data: { externallyDeletedAt: new Date() } });
    throw err;
  }
}

/** The ProfilePost a post-analytics request is about (postId + platformType, or importedPostId). */
async function resolvePostTarget(actor: Actor, q: { postId?: string | null; importedPostId?: string | null; platformType?: string | null }) {
  if (q.importedPostId) {
    const pp = await prisma.profilePost.findFirst({ where: { id: q.importedPostId, deletedAt: null, socialAccount: { team: { organizationId: actor.organizationId } } }, include: { socialAccount: true } });
    if (!pp) throw notFound('Imported post');
    const post = pp.postId ? await prisma.post.findFirst({ where: { id: pp.postId, organizationId: actor.organizationId }, include: postInclude }) : null;
    return { post, pp, type: pp.socialAccount.type as NetworkType, account: pp.socialAccount };
  }
  if (!q.postId) throw badRequest('Set postId (with platformType) or importedPostId.', [{ code: 'required', message: 'postId or importedPostId is required', path: ['postId'] }]);
  const post = await prisma.post.findFirst({ where: { id: q.postId, organizationId: actor.organizationId }, include: postInclude });
  if (!post) throw notFound('Post');
  const targets = post.socialAccounts.filter(t => !q.platformType || t.type === q.platformType);
  if (!targets.length) throw notFound(`${q.platformType} target of this post`);
  if (targets.length > 1) throw badRequest('This post went to several networks: set platformType.', [{ code: 'required', message: 'platformType is required', path: ['platformType'] }]);
  const t = targets[0];
  const pp = await prisma.profilePost.findFirst({ where: { socialAccountId: t.socialAccountId, deletedAt: null, OR: [{ postId: post.id }, ...(t.externalPostId ? [{ externalId: t.externalPostId }] : [])] } });
  return { post, pp, type: t.type as NetworkType, account: t.socialAccount };
}

const itemsOf = (profilePostId: string) => prisma.postAnalytics.findMany({ where: { profilePostId, deletedAt: null }, orderBy: { createdAt: 'asc' }, take: 1000 });
const accountItems = async (socialAccountId: string) => (await prisma.socialAccountAnalytics.findMany({ where: { socialAccountId, deletedAt: null }, orderBy: { createdAt: 'desc' }, take: 400 })).reverse();

async function postAnalyticsResponse(actor: Actor, query: any, raw: boolean) {
  await requireAnalytics(actor.organizationId);
  const r = await resolvePostTarget(actor, query);
  const rows = r.pp ? await itemsOf(r.pp.id) : [];
  return {
    post: r.post ? analyticsPost(r.post, S.post(r.post)) : null,
    ...(r.pp ? { profilePost: profilePost(r.pp) } : {}),
    items: raw ? rows.map(x => ({ id: x.id, profilePostId: x.profilePostId, analyticsId: x.id, raw: x.raw ?? null, forced: x.forced, createdAt: x.createdAt.toISOString(), updatedAt: x.updatedAt.toISOString(), deletedAt: x.deletedAt?.toISOString() ?? null })) : rows.map(postAnalytics),
  };
}

async function forcedGate(actor: Actor) {
  const { org } = await requireAnalytics(actor.organizationId);
  if (org.analyticsDisabled) throw forbidden('Analytics are turned off for this organization. Turn them on in organization settings first.');
  return org;
}

async function xRollingCap(count: number, what: string) {
  if (count >= X_ROLLING_CAP) throw quotaExceeded(`X analytics for this ${what} were refreshed ${X_ROLLING_CAP} times in the last 24 hours (each refresh is billed). Try again later.`);
}

define({
  'analytics.getSocialAccountAnalytics': async ({ actor, query }) => {
    await requireAnalytics(actor.organizationId);
    const a = await accountOf(actor, query.teamId, query.platformType);
    return { socialAccount: S.socialAccount(a), items: (await accountItems(a.id)).map(accountAnalytics) };
  },

  'analytics.getSocialAccountAnalyticsRaw': async ({ actor, query }) => {
    await requireAnalytics(actor.organizationId);
    const a = await accountOf(actor, query.teamId, query.platformType);
    const rows = await accountItems(a.id);
    return { socialAccount: S.socialAccount(a), items: rows.map(x => ({ id: x.id, socialAccountId: x.socialAccountId, analyticsId: x.id, raw: x.raw ?? null, forced: x.forced, createdAt: x.createdAt.toISOString(), updatedAt: x.updatedAt.toISOString(), deletedAt: x.deletedAt?.toISOString() ?? null })) };
  },

  'analytics.getPostAnalytics': ({ actor, query }) => postAnalyticsResponse(actor, query, false),
  'analytics.getPostAnalyticsRaw': ({ actor, query }) => postAnalyticsResponse(actor, query, true),

  'analytics.getBulkPostAnalytics': async ({ actor, query }) => {
    await requireAnalytics(actor.organizationId);
    const ids = [...new Set(listParam(query.postIds) ?? [])];
    const page = Math.max(1, Number(query.page ?? 1)); const limit = Math.min(20, Math.max(1, Number(query.limit ?? 20)));
    const slice = ids.slice((page - 1) * limit, page * limit);
    const results = [];
    for (const postId of slice) {
      try {
        const r = await resolvePostTarget(actor, { postId, platformType: query.platformType });
        results.push({ postId, items: r.pp ? (await itemsOf(r.pp.id)).map(postAnalytics) : [], error: r.pp ? null : 'No analytics yet: the post is not published on this network.' });
      } catch (err) { results.push({ postId, items: [], error: (err as Error).message }); }
    }
    return { results, pagination: { page, limit, total: ids.length, totalPages: Math.ceil(ids.length / limit) } };
  },

  'analytics.forceSocialAccountAnalytics': async ({ actor, body }) => {
    const org = await forcedGate(actor);
    const a = await accountOf(actor, body.teamId, body.platformType);
    const type = a.type as NetworkType;
    const ad = adapter(type);
    if (!ad.accountAnalytics || !ad.capabilities.accountAnalytics) throw badRequest(`${ad.displayName} does not provide account analytics.`);
    if (type === 'TWITTER') await xRollingCap(await prisma.socialAccountAnalytics.count({ where: { socialAccountId: a.id, forced: true, createdAt: { gt: new Date(Date.now() - DAY) } } }), 'account');
    const key = accountKey(a.type, a.providerPageId, a.id);
    const now = new Date();
    await consumeDaily(prisma, key, 'forcedAccount', 1, org.forcedAccountAnalyticsDailyLimit ?? 5, now, `${ad.displayName} forced account analytics`);
    try {
      // X account self-metrics (the connected user's own counts) are not billed.
      return accountAnalytics(await refreshAccountAnalytics(a.id, true));
    } catch (err) {
      await releaseDaily(prisma, key, 'forcedAccount', 1, now);
      return networkFailure(err);
    }
  },

  'analytics.forcePostAnalytics': async ({ actor, body }) => {
    const org = await forcedGate(actor);
    const r = await resolvePostTarget(actor, body);
    const ad = adapter(r.type);
    if (!ad.postAnalytics || !ad.capabilities.postAnalytics) throw badRequest(`${ad.displayName} does not provide post analytics.`);
    let pp = r.pp;
    if (!pp) {
      // Published before ProfilePost rows existed (or the upsert failed): create it from the target.
      const t = r.post?.socialAccounts.find(x => x.type === r.type);
      if (!t?.externalPostId) throw badRequest(`The post is not published on ${ad.displayName} yet.`);
      pp = await prisma.profilePost.upsert({ where: { socialAccountId_externalId: { socialAccountId: t.socialAccountId, externalId: t.externalPostId } }, update: { postId: r.post!.id }, create: { socialAccountId: t.socialAccountId, externalId: t.externalPostId, postId: r.post!.id, internal: true, permalink: t.permalink, publishedAt: t.publishedAt, title: r.post!.title } });
    }
    if (r.type === 'TWITTER') await xRollingCap(await prisma.postAnalytics.count({ where: { profilePostId: pp.id, forced: true, createdAt: { gt: new Date(Date.now() - DAY) } } }), 'post');
    const key = `${accountKey(r.account.type, r.account.providerPageId, r.account.id)}:post:${pp.id}`;
    const now = new Date();
    await consumeDaily(prisma, key, 'forcedPost', 1, org.forcedPostAnalyticsDailyLimit ?? 5, now, `${ad.displayName} forced post analytics`);
    try {
      const row = await metered(actor.organizationId, r.type, 'TWITTER_POST_READ', 1, { type: 'ProfilePost', id: pp.id }, () => refreshPostAnalytics(pp!.id, true));
      return postAnalytics(row);
    } catch (err) {
      await releaseDaily(prisma, key, 'forcedPost', 1, now);
      return networkFailure(err);
    }
  },
});

// ───────────────────────────── jobs ─────────────────────────────

/** Background refreshes skip X (manual and metered only), free plans and orgs that turned analytics off. */
async function sweepable(socialAccountId: string, posts: boolean) {
  const a = await prisma.socialAccount.findUnique({ where: { id: socialAccountId }, include: { team: { include: { organization: true } } } });
  if (!a || a.deletedAt || a.state !== 'CONNECTED' || a.type === 'TWITTER') return false;
  const o = a.team.organization;
  if (o.deletedAt || o.suspended || o.tier === 'FREE' || o.analyticsDisabled || (posts && o.analyticsPostsDisabled)) return false;
  return true;
}

async function jobFailure(err: unknown, socialAccountId: string, what: string) {
  if (isNetworkError(err) && err.code === 'TOKEN_INVALID') await markNeedsReconnect(prisma, socialAccountId, err.message);
  else if (!isNetworkError(err) || err.code !== 'NOT_FOUND') logger.warn({ err, socialAccountId }, `${what} analytics refresh failed`);
  return 'error';
}

registerJob(JOBS.refreshAccountAnalytics, async d => {
  if (!(await sweepable(d.socialAccountId, false))) return 'skipped';
  try { await refreshAccountAnalytics(d.socialAccountId); return 'ok'; } catch (err) { return jobFailure(err, d.socialAccountId, 'account'); }
});

registerJob(JOBS.refreshPostAnalytics, async d => {
  const pp = await prisma.profilePost.findUnique({ where: { id: d.profilePostId } });
  if (!pp || pp.deletedAt || pp.externallyDeletedAt || !(await sweepable(pp.socialAccountId, true))) return 'skipped';
  try { await refreshPostAnalytics(pp.id); return 'ok'; } catch (err) { return jobFailure(err, pp.socialAccountId, 'post'); }
});

/**
 * Every 3 hours: accounts once a day (or the org's analyticsInterval, hours), posts on a decay
 * schedule — every run for their first 24 h, then daily until they are 30 days old.
 */
export async function analyticsSweep() {
  const now = Date.now();
  const orgFilter = { deletedAt: null, suspended: false, analyticsDisabled: false, tier: { not: 'FREE' as const } };
  const accountTypes = S.NETWORK_TYPES.filter(t => t !== 'TWITTER' && !!adapter(t).accountAnalytics);
  const postTypes = S.NETWORK_TYPES.filter(t => t !== 'TWITTER' && !!adapter(t).postAnalytics);
  const accounts = await prisma.socialAccount.findMany({
    where: { deletedAt: null, state: 'CONNECTED', type: { in: accountTypes }, team: { deletedAt: null, organization: orgFilter } },
    select: { id: true, analyticsRefreshedAt: true, team: { select: { organization: { select: { analyticsInterval: true } } } } }, take: 5000,
  });
  let queuedAccounts = 0;
  for (const a of accounts) {
    const every = Math.max(3, a.team.organization.analyticsInterval ?? 24) * 3600_000;
    if (a.analyticsRefreshedAt && now - a.analyticsRefreshedAt.getTime() < every - 10 * 60_000) continue;
    await enqueue(JOBS.refreshAccountAnalytics, { socialAccountId: a.id }, { singletonKey: `aa:${a.id}:${new Date().toISOString().slice(0, 13)}`, retryLimit: 1 });
    queuedAccounts++;
  }
  const posts = await prisma.profilePost.findMany({
    where: {
      deletedAt: null, externallyDeletedAt: null, externalId: { not: null }, publishedAt: { gt: new Date(now - 30 * DAY) },
      socialAccount: { deletedAt: null, state: 'CONNECTED', type: { in: postTypes }, team: { deletedAt: null, organization: { ...orgFilter, analyticsPostsDisabled: false } } },
    },
    select: { id: true, publishedAt: true, analyticsRefreshedAt: true }, take: 20_000,
  });
  let queuedPosts = 0;
  for (const p of posts) {
    const age = now - (p.publishedAt?.getTime() ?? now);
    const since = p.analyticsRefreshedAt ? now - p.analyticsRefreshedAt.getTime() : Infinity;
    const due = age < DAY ? since >= 50 * 60_000 : since >= DAY - 30 * 60_000;
    if (!due) continue;
    await enqueue(JOBS.refreshPostAnalytics, { profilePostId: p.id }, { singletonKey: `pa:${p.id}:${new Date().toISOString().slice(0, 13)}`, retryLimit: 1 });
    queuedPosts++;
  }
  // Safety net for comments until the minute sweep calls dispatchDueComments (engine/publisher).
  const comments = await dispatchDueComments().catch(() => 0);
  await staleCommentClaims().catch(() => 0);
  return { accounts: queuedAccounts, posts: queuedPosts, comments };
}
registerJob(JOBS.analyticsSweep, () => analyticsSweep());
