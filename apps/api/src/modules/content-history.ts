import { isNetworkError, type NetworkType } from '@siar/networks';
import { prisma } from '../platform/db.js';
import { audit } from '../platform/audit.js';
import { badRequest, conflict, notFound } from '../platform/errors.js';
import { logger } from '../platform/logger.js';
import { adapter, isConfigured, loadAccount, markNeedsReconnect, networkContext } from '../platform/networks.js';
import { enqueue, JOBS } from '../platform/queue.js';
import { define } from '../platform/routes.js';
import type { Actor } from '../platform/auth.js';
import { limitsFor, RESOURCE_LIMITS } from '../domain/plans.js';
import { accountKey, accountMonthUsage, consumeAccountMonth } from '../domain/quota.js';
import { registerJob } from '../engine/jobs.js';
import { teamOf } from './teams.js';
import { accountOf } from './accounts.js';
import { historyImport, metered, postAnalytics, profilePost, remainingOr403 } from './content-shared.js';
import { refreshPostAnalytics, savePostMetrics } from './content-analytics.js';

/**
 * Post history import: an account's existing posts → ProfilePost (internal=false) + a first
 * PostAnalytics snapshot. At most 100 per network call; the cursor is saved after every page so a
 * rate-limited import (RATE_LIMITED + rateLimitResetAt) resumes where it stopped, automatically.
 * Counted per account per month (AccountMonthCounter "imports") as posts are actually imported.
 */

const RUNNING = ['PENDING', 'FETCHING', 'FETCHING_POSTS', 'FETCHING_ANALYTICS', 'RETRYING', 'RATE_LIMITED'] as const;

async function importOf(actor: Actor, id: string) {
  const i = await prisma.postHistoryImport.findFirst({ where: { id, organizationId: actor.organizationId, deletedAt: null } });
  if (!i) throw notFound('Post history import');
  return i;
}

async function capacity(organizationId: string, a: { id: string; type: string; providerPageId: string | null }) {
  const org = await prisma.organization.findUniqueOrThrow({ where: { id: organizationId } });
  const limit = limitsFor(org).importPostsPerAccount;
  const key = accountKey(a.type, a.providerPageId, a.id);
  return { limit, key, tier: org.tier, remaining: Math.max(0, limit - (await accountMonthUsage(prisma, key, 'imports', org.tier))) };
}

export async function runHistoryImport(importId: string) {
  const claimed = await prisma.postHistoryImport.updateMany({ where: { id: importId, status: { in: ['PENDING', 'RETRYING', 'RATE_LIMITED'] }, deletedAt: null }, data: { status: 'FETCHING_POSTS', startedAt: new Date(), error: null, rateLimitResetAt: null } });
  if (!claimed.count) return 'skipped';
  let imp = await prisma.postHistoryImport.findUniqueOrThrow({ where: { id: importId } });
  const type = imp.type as NetworkType;
  const ad = adapter(type);
  const needsMetrics: string[] = [];
  try {
    if (!ad.importHistory) throw new Error(`${ad.displayName} history import is not available.`);
    const sa = await prisma.socialAccount.findUniqueOrThrow({ where: { id: imp.socialAccountId } });
    const cap = await capacity(imp.organizationId!, sa);
    const account = await loadAccount(imp.socialAccountId);
    let cursor = imp.cursor;
    let imported = imp.postsImported; let analytics = imp.analyticsImported; let stopNote: string | null = null;
    for (let page = 0; page < 1000 && imported < imp.count; page++) {
      const want = Math.min(RESOURCE_LIMITS.historyImportPerCall, imp.count - imported);
      const r = await metered(imp.organizationId!, type, 'TWITTER_POST_READ', want, { type: 'PostHistoryImport', id: importId },
        () => ad.importHistory!(networkContext(type), account, { cursor, limit: want }), x => Math.min(want, x.items.length));
      let items = r.items.slice(0, want);
      if (items.length) {
        // Count what is actually imported; stop cleanly when the monthly allowance runs out.
        try { await consumeAccountMonth(prisma, cap.key, 'imports', items.length, cap.limit, `${ad.displayName} post import`, cap.tier); }
        catch {
          const left = Math.max(0, cap.limit - (await accountMonthUsage(prisma, cap.key, 'imports', cap.tier)));
          items = items.slice(0, left);
          if (left) await consumeAccountMonth(prisma, cap.key, 'imports', left, cap.limit, `${ad.displayName} post import`, cap.tier).catch(() => { items = []; });
          stopNote = `Stopped at the monthly import limit (${cap.limit} posts per account on your plan).`;
        }
      }
      for (const it of items) {
        const fields = {
          title: it.title ?? null, smallThumbnail: it.smallThumbnail ?? null, thumbnail: it.thumbnail ?? null, permalink: it.permalink ?? null, subreddit: it.subreddit ?? null,
          publishedAt: it.publishedAt ?? null, type: it.type ?? 'POST', extraData: (it.extraData ?? undefined) as object | undefined, importedAt: new Date(), deletedAt: null,
        };
        const pp = await prisma.profilePost.upsert({
          where: { socialAccountId_externalId: { socialAccountId: imp.socialAccountId, externalId: it.externalId } },
          update: fields,
          create: { ...fields, socialAccountId: imp.socialAccountId, externalId: it.externalId, internal: false },
        });
        if (imp.withAnalytics) {
          if (it.metrics) { await savePostMetrics(pp.id, it.metrics); analytics++; }
          else needsMetrics.push(pp.id);
        }
        imported++;
      }
      cursor = r.nextCursor ?? null;
      imp = await prisma.postHistoryImport.update({ where: { id: importId }, data: { cursor, postsImported: imported, analyticsImported: analytics } });
      if (stopNote || !cursor || !r.items.length) break;
    }
    if (needsMetrics.length && ad.postAnalytics && type !== 'TWITTER') {
      await prisma.postHistoryImport.update({ where: { id: importId }, data: { status: 'FETCHING_ANALYTICS' } });
      for (const id of needsMetrics) {
        try { await refreshPostAnalytics(id); analytics++; } catch (err) { if (isNetworkError(err) && err.code === 'RATE_LIMITED') break; }
      }
    }
    await prisma.postHistoryImport.update({ where: { id: importId }, data: { status: 'COMPLETED', analyticsImported: analytics, completedAt: new Date(), error: stopNote } });
    return 'COMPLETED';
  } catch (err) {
    if (isNetworkError(err) && err.code === 'RATE_LIMITED') {
      const at = err.rateLimitResetAt ?? new Date(Date.now() + 15 * 60_000);
      await prisma.postHistoryImport.update({ where: { id: importId }, data: { status: 'RATE_LIMITED', rateLimitResetAt: at, error: err.message } });
      await enqueue(JOBS.importHistory, { importId }, { singletonKey: `himp:${importId}:${at.getTime()}`, startAfter: at, retryLimit: 0 });
      return 'RATE_LIMITED';
    }
    if (isNetworkError(err) && err.code === 'TOKEN_INVALID') await markNeedsReconnect(prisma, imp.socialAccountId, err.message);
    if (!isNetworkError(err)) logger.error({ err, importId }, 'history import crashed');
    await prisma.postHistoryImport.update({ where: { id: importId }, data: { status: 'FAILED', error: (err as Error).message?.slice(0, 1000) ?? 'Import failed.', completedAt: new Date() } });
    return 'FAILED';
  }
}
registerJob(JOBS.importHistory, d => runHistoryImport(d.importId));

define({
  'postImport.create': async ({ actor, body }) => {
    const a = await accountOf(actor, body.teamId, body.socialAccountType);
    const type = a.type as NetworkType;
    const ad = adapter(type);
    if (!ad.capabilities.historyImport || !ad.importHistory) throw badRequest(`${ad.displayName} post history import is not available${isConfigured(type) ? '' : ' on this server yet'}.`);
    const count = Number(body.count);
    if (!Number.isInteger(count) || count < 1) throw badRequest('count must be a positive integer.', [{ code: 'invalid', message: 'count must be ≥ 1', path: ['count'] }]);
    const cap = await capacity(actor.organizationId, a);
    remainingOr403(cap.remaining, count, `${ad.displayName} post import`, cap.limit);
    const running = await prisma.postHistoryImport.findFirst({ where: { socialAccountId: a.id, status: { in: [...RUNNING] }, deletedAt: null } });
    if (running) throw conflict(`An import is already running for this ${ad.displayName} account (${running.id}). Wait for it to finish.`);
    const imp = await prisma.$transaction(async tx => {
      const row = await tx.postHistoryImport.create({ data: { teamId: body.teamId, organizationId: actor.organizationId, socialAccountId: a.id, type, count, withAnalytics: body.withAnalytics ?? true } });
      await audit(tx, actor, 'postImport.create', 'PostHistoryImport', row.id, `Started importing ${count} ${ad.displayName} post(s)`);
      return row;
    });
    await enqueue(JOBS.importHistory, { importId: imp.id }, { singletonKey: `himp:${imp.id}`, retryLimit: 0 });
    // importCarousels/surface/mediaType are echoed (not stored yet: PostHistoryImport has no column for them).
    return { ...historyImport(imp), importCarousels: body.importCarousels ?? false, surface: body.surface ?? null, mediaType: body.mediaType ?? null };
  },

  'postImport.getStatus': async ({ actor, query }) => {
    await teamOf(actor, query.teamId);
    const rows = await prisma.postHistoryImport.findMany({ where: { teamId: query.teamId, organizationId: actor.organizationId, deletedAt: null, ...(query.socialAccountType ? { type: query.socialAccountType } : {}) }, orderBy: { createdAt: 'desc' }, take: 100 });
    return { imports: rows.map(historyImport) };
  },

  'postImport.getById': async ({ actor, params }) => historyImport(await importOf(actor, params.importId)),

  'postImport.getImportedPosts': async ({ actor, query }) => {
    const a = await accountOf(actor, query.teamId, query.socialAccountType);
    const limit = Math.min(100, Math.max(1, Number(query.limit ?? 50))); const offset = Math.max(0, Number(query.offset ?? 0));
    const where = { socialAccountId: a.id, internal: false, deletedAt: null };
    const [rows, total, cap] = await Promise.all([
      prisma.profilePost.findMany({ where, include: { analytics: { where: { deletedAt: null }, orderBy: { createdAt: 'asc' } } }, orderBy: [{ publishedAt: { sort: 'desc', nulls: 'last' } }, { id: 'desc' }], skip: offset, take: limit }),
      prisma.profilePost.count({ where }),
      capacity(actor.organizationId, a),
    ]);
    return { posts: rows.map(p => ({ ...profilePost(p), analytics: p.analytics.map(postAnalytics) })), total, limit, remainingCapacity: cap.remaining };
  },

  'postImport.deleteImportedPosts': async ({ actor, body }) => {
    await teamOf(actor, body.teamId);
    const r = await prisma.$transaction(async tx => {
      const res = await tx.profilePost.updateMany({ where: { id: { in: body.postIds }, internal: false, deletedAt: null, socialAccount: { teamId: body.teamId } }, data: { deletedAt: new Date() } });
      await audit(tx, actor, 'postImport.deletePosts', 'Team', body.teamId, `Deleted ${res.count} imported post(s)`);
      return res;
    });
    return { deletedCount: r.count };
  },

  'postImport.retryImport': async ({ actor, params, body }) => {
    await teamOf(actor, body.teamId);
    const i = await importOf(actor, params.importId);
    if (i.teamId !== body.teamId) throw notFound('Post history import');
    if (!['FAILED', 'RATE_LIMITED'].includes(i.status)) throw badRequest(`Only FAILED or RATE_LIMITED imports can be retried (this one is ${i.status}).`);
    const updated = await prisma.postHistoryImport.update({ where: { id: i.id }, data: { status: 'RETRYING', error: null, rateLimitResetAt: null, completedAt: null } });
    await enqueue(JOBS.importHistory, { importId: i.id }, { singletonKey: `himp:${i.id}:retry:${Date.now()}`, retryLimit: 0 });
    return historyImport(updated);
  },
});
