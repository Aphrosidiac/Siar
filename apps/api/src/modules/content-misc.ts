import type { NetworkType } from '@siar/networks';
import { prisma } from '../platform/db.js';
import { badRequest, notFound, notImplemented } from '../platform/errors.js';
import { adapter, loadAccount, mediaRef, networkContext } from '../platform/networks.js';
import { enqueue, JOBS } from '../platform/queue.js';
import { define, loadSpec, type Ctx } from '../platform/routes.js';
import { registerJob } from '../engine/jobs.js';
import * as credits from '../domain/credits.js';
import { limitsFor, RESOURCE_LIMITS, type XAction } from '../domain/plans.js';
import { accountKey, accountMonthUsage, consumeAccountMonth } from '../domain/quota.js';
import { accountOf, networkFailure } from './accounts.js';

/**
 * Credits endpoints, the generic misc dispatcher (misc.<network>.<op> → adapter.misc[opId]) and the
 * DB-backed review/recommendation operations (Google Business reviews, Facebook recommendations).
 */

const NET: Record<string, NetworkType> = { google_business: 'GOOGLE_BUSINESS', twitter: 'TWITTER' };
const netOf = (opId: string) => { const n = opId.split('.')[1]; return NET[n] ?? (n.toUpperCase() as NetworkType); };
const teamIdOf = (c: Ctx) => c.query.teamId ?? c.body.teamId;

const iso = (d: Date | null | undefined) => (d ? d.toISOString() : null);

// ───────────── credits ─────────────
const hasUrl = (s?: string) => !!s && /https?:\/\/\S+/i.test(s);
define({
  'credit.getCreditBalance': async ({ actor }) => credits.balance(actor.organizationId),
  'credit.quoteBillableUsage': async ({ actor, body }) => {
    const texts: string[] = body.texts ?? (body.text !== undefined ? [body.text] : []);
    const lines: { action: XAction; count?: number }[] = [];
    if (body.action) lines.push({ action: body.action, count: body.quantity ?? 1 });
    else for (const t of texts.length ? texts : ['']) lines.push({ action: hasUrl(t) ? 'TWITTER_CONTENT_CREATE_WITH_URL' : 'TWITTER_CONTENT_CREATE' });
    if (body.altTextCount) lines.push({ action: 'TWITTER_CONTENT_MANAGE', count: body.altTextCount });
    return credits.quote(actor.organizationId, lines);
  },
});

// ───────────── reviews / recommendations ─────────────
const reviewOut = (r: any) => ({
  id: r.id, externalId: r.externalId, socialAccountId: r.socialAccountId, teamId: r.teamId, reviewerName: r.reviewerName, reviewerAvatarUrl: r.reviewerAvatarUrl,
  rating: r.rating, recommendationType: r.recommendationType, text: r.text, replyText: r.replyText, replyUpdatedAt: iso(r.replyUpdatedAt),
  publishedAt: iso(r.publishedAt), platformData: r.platformData, createdAt: iso(r.createdAt), updatedAt: iso(r.updatedAt),
});
const importOut = (i: any) => ({ id: i.id, teamId: i.teamId, socialAccountId: i.socialAccountId, type: i.type, status: i.status, count: i.count, imported: i.imported, error: i.error, rateLimitResetAt: iso(i.rateLimitResetAt), startedAt: iso(i.startedAt), completedAt: iso(i.completedAt), createdAt: iso(i.createdAt) });

function reviewOps(type: 'GOOGLE_BUSINESS' | 'FACEBOOK', ids: { start: string; status: string; byId: string; list: string; get: string; reply: string; delReply?: string; comments?: string; replyComment?: string }, listKey: 'reviews' | 'recommendations') {
  const map: Record<string, (c: Ctx) => Promise<unknown>> = {
    [ids.start]: async c => {
      const a = await accountOf(c.actor, teamIdOf(c), type);
      const org = await prisma.organization.findUniqueOrThrow({ where: { id: c.actor.organizationId } });
      const count = Math.min(RESOURCE_LIMITS.reviewImportPerCall, Number(c.body.count ?? 50));
      await consumeAccountMonth(prisma, accountKey(a.type, a.providerPageId, a.id), 'reviews', count, limitsFor(org).reviewImportPerAccount, 'Review import', org.tier);
      const imp = await prisma.reviewImport.create({ data: { type, teamId: a.teamId, organizationId: c.actor.organizationId, socialAccountId: a.id, count } });
      await enqueue(JOBS.importReviews, { importId: imp.id }, { singletonKey: `rev:${imp.id}` });
      return importOut(imp);
    },
    [ids.status]: async c => {
      const a = await accountOf(c.actor, teamIdOf(c), type);
      const rows = await prisma.reviewImport.findMany({ where: { socialAccountId: a.id, type }, orderBy: { createdAt: 'desc' }, take: 50 });
      return { imports: rows.map(importOut) };
    },
    [ids.byId]: async c => {
      const i = await prisma.reviewImport.findFirst({ where: { id: c.params.importId, organizationId: c.actor.organizationId, type } });
      if (!i) throw notFound('Import');
      return importOut(i);
    },
    [ids.list]: async c => {
      const a = await accountOf(c.actor, teamIdOf(c), type);
      const take = Math.min(100, Number(c.query.limit ?? 20)); const skip = Number(c.query.offset ?? 0);
      const where = { socialAccountId: a.id, type, deletedAt: null };
      const [rows, total] = await Promise.all([prisma.review.findMany({ where, orderBy: { publishedAt: 'desc' }, skip, take }), prisma.review.count({ where })]);
      const org = await prisma.organization.findUniqueOrThrow({ where: { id: c.actor.organizationId } });
      const limit = limitsFor(org).reviewImportPerAccount;
      const used = await accountMonthUsage(prisma, accountKey(a.type, a.providerPageId, a.id), 'reviews', org.tier);
      return { [listKey]: rows.map(reviewOut), total, limit, remainingCapacity: Math.max(0, limit - used) };
    },
    [ids.get]: async c => reviewOut(await reviewOf(c, type)),
    [ids.reply]: async c => {
      const r = await reviewOf(c, type);
      const text = String(c.body.comment ?? c.body.text ?? c.body.message ?? '');
      if (!text.trim()) throw badRequest('Reply text is required.');
      const ad = adapter(type);
      await ad.reviews!.reply(networkContext(type), await loadAccount(r.socialAccountId).catch(networkFailure), r.externalId, text).catch(networkFailure);
      return reviewOut(await prisma.review.update({ where: { id: r.id }, data: { replyText: text, replyUpdatedAt: new Date() } }));
    },
  };
  if (ids.delReply) map[ids.delReply] = async c => {
    const r = await reviewOf(c, type);
    await adapter(type).reviews!.deleteReply!(networkContext(type), await loadAccount(r.socialAccountId).catch(networkFailure), r.externalId).catch(networkFailure);
    await prisma.review.update({ where: { id: r.id }, data: { replyText: null, replyUpdatedAt: new Date() } });
    return { success: true };
  };
  if (ids.comments) map[ids.comments] = async c => {
    const r = await reviewOf(c, type);
    const items = await adapter(type).reviews!.comments!(networkContext(type), await loadAccount(r.socialAccountId).catch(networkFailure), r.externalId).catch(networkFailure);
    return { comments: items, total: items.length };
  };
  if (ids.replyComment) map[ids.replyComment] = async c => {
    const r = await reviewOf(c, type);
    const out = await adapter(type).reviews!.replyToComment!(networkContext(type), await loadAccount(r.socialAccountId).catch(networkFailure), c.params.commentId, String(c.body.message ?? c.body.text ?? '')).catch(networkFailure);
    return { success: true, ...out };
  };
  define(map);
}

async function reviewOf(c: Ctx, type: NetworkType) {
  const id = c.params.reviewId ?? c.params.recommendationId;
  const teamId = teamIdOf(c);
  const r = await prisma.review.findFirst({ where: { OR: [{ id }, { externalId: id }], type, ...(teamId ? { teamId } : {}) } });
  if (!r) throw notFound(type === 'FACEBOOK' ? 'Recommendation' : 'Review');
  const team = await prisma.team.findFirst({ where: { id: r.teamId, organizationId: c.actor.organizationId } });
  if (!team) throw notFound('Review');
  return r;
}

reviewOps('GOOGLE_BUSINESS', { start: 'misc.google_business.importReviews', status: 'misc.google_business.getReviewImportStatus', byId: 'misc.google_business.getReviewImportById', list: 'misc.google_business.getReviews', get: 'misc.google_business.getReviewById', reply: 'misc.google_business.replyToReview', delReply: 'misc.google_business.deleteReviewReply' }, 'reviews');
reviewOps('FACEBOOK', { start: 'misc.facebook.importRecommendations', status: 'misc.facebook.getRecommendationImportStatus', byId: 'misc.facebook.getRecommendationImportById', list: 'misc.facebook.getRecommendations', get: 'misc.facebook.getRecommendationById', reply: 'misc.facebook.replyToRecommendation', comments: 'misc.facebook.getRecommendationComments', replyComment: 'misc.facebook.replyToRecommendationComment' }, 'recommendations');

registerJob(JOBS.importReviews, async ({ importId }) => {
  const imp = await prisma.reviewImport.findUnique({ where: { id: importId } });
  if (!imp || !['PENDING', 'RATE_LIMITED'].includes(imp.status)) return 'skipped';
  const ad = adapter(imp.type as NetworkType);
  if (!ad.reviews) { await prisma.reviewImport.update({ where: { id: imp.id }, data: { status: 'FAILED', error: 'Not supported for this network yet.' } }); return 'unsupported'; }
  await prisma.reviewImport.update({ where: { id: imp.id }, data: { status: imp.type === 'FACEBOOK' ? 'FETCHING_RECOMMENDATIONS' : 'FETCHING_REVIEWS', startedAt: imp.startedAt ?? new Date() } });
  try {
    const acc = await loadAccount(imp.socialAccountId);
    let cursor: string | null | undefined = null; let n = imp.imported;
    do {
      const page = await ad.reviews.list(networkContext(imp.type as NetworkType), acc, { cursor, limit: Math.min(50, imp.count - n) });
      for (const r of page.items) {
        await prisma.review.upsert({
          where: { socialAccountId_externalId: { socialAccountId: imp.socialAccountId, externalId: r.externalId } },
          update: { text: r.text, rating: r.rating, replyText: r.replyText, replyUpdatedAt: r.replyUpdatedAt, platformData: (r.platformData ?? {}) as object },
          create: { type: imp.type, teamId: imp.teamId, socialAccountId: imp.socialAccountId, importId: imp.id, externalId: r.externalId, reviewerName: r.reviewerName, reviewerAvatarUrl: r.reviewerAvatarUrl, rating: r.rating, recommendationType: r.recommendationType, text: r.text, replyText: r.replyText, replyUpdatedAt: r.replyUpdatedAt, publishedAt: r.publishedAt, platformData: (r.platformData ?? {}) as object },
        });
        n++;
      }
      cursor = page.nextCursor;
    } while (cursor && n < imp.count);
    await prisma.reviewImport.update({ where: { id: imp.id }, data: { status: 'COMPLETED', imported: n, completedAt: new Date() } });
    return n;
  } catch (err: any) {
    const limited = err?.code === 'RATE_LIMITED';
    await prisma.reviewImport.update({ where: { id: imp.id }, data: { status: limited ? 'RATE_LIMITED' : 'FAILED', error: String(err?.message ?? err).slice(0, 500), rateLimitResetAt: err?.rateLimitResetAt ?? null } });
    if (limited) await enqueue(JOBS.importReviews, { importId: imp.id }, { singletonKey: `rev:${imp.id}:retry`, startAfter: err.rateLimitResetAt ?? new Date(Date.now() + 15 * 60_000) });
    return 'failed';
  }
});

// ───────────── generic misc dispatcher ─────────────
const already = new Set(['misc.google_business.importReviews', 'misc.google_business.getReviewImportStatus', 'misc.google_business.getReviewImportById', 'misc.google_business.getReviews', 'misc.google_business.getReviewById', 'misc.google_business.replyToReview', 'misc.google_business.deleteReviewReply', 'misc.facebook.importRecommendations', 'misc.facebook.getRecommendationImportStatus', 'misc.facebook.getRecommendationImportById', 'misc.facebook.getRecommendations', 'misc.facebook.getRecommendationById', 'misc.facebook.getRecommendationComments', 'misc.facebook.replyToRecommendation', 'misc.facebook.replyToRecommendationComment']);

const spec = loadSpec();
const miscIds: string[] = [];
for (const ops of Object.values<any>(spec.paths)) for (const op of Object.values<any>(ops)) if (op.operationId?.startsWith('misc.') && !already.has(op.operationId)) miscIds.push(op.operationId);

define(Object.fromEntries(miscIds.map(opId => [opId, async (c: Ctx) => {
  const type = netOf(opId);
  const fn = adapter(type).misc?.[opId];
  if (!fn) throw notImplemented(opId);
  const teamId = teamIdOf(c);
  if (!teamId) throw badRequest('teamId is required.', [{ code: 'required', message: 'teamId is required', path: ['teamId'] }]);
  const a = await accountOf(c.actor, teamId, type);
  const acc = await loadAccount(a.id).catch(networkFailure);
  const orgId = c.actor.organizationId;
  return fn(networkContext(type), acc, {
    query: c.query, body: c.body, params: c.params,
    lookup: {
      post: async id => {
        const t = await prisma.postSocialAccount.findFirst({ where: { postId: id, socialAccountId: a.id, post: { organizationId: orgId } }, include: { post: true } });
        if (!t?.externalPostId) throw notFound('Published post for this network');
        return { externalPostId: t.externalPostId, externalAlternatePostId: t.externalAlternatePostId, externalVideoId: t.externalVideoId, permalink: t.permalink, data: ((t.post.data as any)?.[type] ?? {}) };
      },
      comment: async id => {
        const c1 = await prisma.comment.findFirst({ where: { id, organizationId: orgId } });
        const ext = (c1?.targets as any)?.[type]?.externalId ?? (c1?.externalData as any)?.[type]?.id;
        if (ext) return { externalId: ext, externalPostId: (c1?.targets as any)?.[type]?.externalPostId ?? null };
        const f = await prisma.fetchedComment.findFirst({ where: { OR: [{ id }, { externalId: id }], socialAccountId: a.id } });
        if (!f) throw notFound('Comment');
        return { externalId: f.externalId, externalPostId: f.externalPostId };
      },
      upload: async id => {
        const u = await prisma.upload.findFirst({ where: { id, organizationId: orgId, deletedAt: null } });
        if (!u) throw notFound('Upload');
        return mediaRef(u);
      },
    },
  }).catch(networkFailure);
}])));
