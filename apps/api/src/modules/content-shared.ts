import type { NetworkType } from '@siar/networks';
import { prisma } from '../platform/db.js';
import { forbidden, quotaExceeded } from '../platform/errors.js';
import type { Actor } from '../platform/auth.js';
import * as credits from '../domain/credits.js';
import { limitsFor, type XAction } from '../domain/plans.js';

/**
 * Helpers shared by the content modules (comments, analytics, imports, CSV, misc): wire
 * serializers for the rows serialize.ts does not cover yet, plan gates and X metering.
 */
export const iso = (d: Date | null | undefined) => (d ? d.toISOString() : null);

/** A stand-in actor for work done by jobs on behalf of an organization (CSV import, sweeps). */
export const jobActor = (organizationId: string, name = 'Siar'): Actor => ({ kind: 'SYSTEM', organizationId, role: 'SYSTEM', name, userId: null });

export async function orgOf(organizationId: string) {
  return prisma.organization.findUniqueOrThrow({ where: { id: organizationId } });
}

/** Analytics are a paid-plan feature (reference rate card: Free has no analytics). */
export async function requireAnalytics(organizationId: string) {
  const org = await orgOf(organizationId);
  const l = limitsFor(org);
  if (!l.analytics) throw forbidden('Analytics are not available on the Free plan. Upgrade to Pro or Business to read and refresh analytics.');
  return { org, limits: l };
}

/**
 * Run a metered X read: hold for `count` resources, call, then charge what was actually returned
 * (the hold is released and the real count captured). Non-X calls pass straight through.
 */
export async function metered<T>(organizationId: string, type: NetworkType, action: XAction, count: number, ref: { type: string; id: string }, fn: () => Promise<T>, charged: (r: T) => number = () => count): Promise<T> {
  if (type !== 'TWITTER' || count <= 0) return fn();
  const h = await credits.hold(organizationId, action, count, ref);
  let r: T;
  try { r = await fn(); } catch (err) { await credits.release(h.id); throw err; }
  const n = Math.max(0, Math.min(count, charged(r)));
  if (n === count) await credits.capture(h.id, `${action} ×${n}`);
  else {
    await credits.release(h.id);
    if (n > 0) { const h2 = await credits.hold(organizationId, action, n, ref).catch(() => null); if (h2) await credits.capture(h2.id, `${action} ×${n}`); }
  }
  return r;
}

export const remainingOr403 = (remaining: number, wanted: number, label: string, limit: number) => {
  if (wanted > remaining) throw quotaExceeded(`${label} limit reached for this account. ${Math.max(0, remaining)} of ${limit} left this month on your plan; ask for ${Math.max(0, remaining)} or fewer.`);
};

// ───────────────────────────── wire shapes ─────────────────────────────

export function fetchedComment(c: any) {
  return {
    id: c.id, teamId: c.teamId, organizationId: c.organizationId, postId: c.postId, importedPostId: c.importedPostId, socialAccountId: c.socialAccountId,
    importId: c.importId, platform: c.platform, externalId: c.externalId, externalParentId: c.externalParentId, externalPostId: c.externalPostId,
    authorName: c.authorName, authorExternalId: c.authorExternalId, authorProfileUrl: c.authorProfileUrl, authorAvatarUrl: c.authorAvatarUrl,
    text: c.text, likesCount: c.likesCount, repliesCount: c.repliesCount,
    platformData: { ...((c.platformData as object) ?? {}), hidden: c.hidden, likedByMe: c.liked },
    publishedAt: iso(c.publishedAt), createdAt: iso(c.createdAt), updatedAt: iso(c.updatedAt), deletedAt: iso(c.deletedAt),
  };
}

const COMMENT_IMPORT_STATUS: Record<string, string> = { FETCHING_POSTS: 'FETCHING', FETCHING_ANALYTICS: 'FETCHING', FETCHING_REVIEWS: 'FETCHING', FETCHING_RECOMMENDATIONS: 'FETCHING' };
export function commentImport(i: any) {
  return {
    id: i.id, teamId: i.teamId, organizationId: i.organizationId, socialAccountId: i.socialAccountId, postId: i.postId, importedPostId: i.importedPostId,
    platform: i.type, status: COMMENT_IMPORT_STATUS[i.status] ?? i.status, commentsImported: i.commentsCount, error: i.error,
    rateLimitResetAt: iso(i.rateLimitResetAt), startedAt: iso(i.startedAt), completedAt: iso(i.completedAt), createdAt: iso(i.createdAt), updatedAt: iso(i.updatedAt),
  };
}

export function profilePost(p: any) {
  const extra = (p.extraData ?? null) as Record<string, any> | null;
  return {
    id: p.id, socialAccountId: p.socialAccountId, postId: p.postId, externalId: p.externalId, title: p.title, description: extra?.description ?? null,
    smallThumbnail: p.smallThumbnail, thumbnail: p.thumbnail, permalink: p.permalink, extraData: extra, subreddit: p.subreddit,
    publishedAt: iso(p.publishedAt), type: p.type, internal: p.internal, importedAt: iso(p.importedAt), externallyDeletedAt: iso(p.externallyDeletedAt),
    createdAt: iso(p.createdAt), updatedAt: iso(p.updatedAt), deletedAt: iso(p.deletedAt),
  };
}

export function postAnalytics(a: any) {
  return {
    id: a.id, profilePostId: a.profilePostId, impressions: a.impressions, impressionsUnique: a.impressionsUnique, views: a.views, viewsUnique: a.viewsUnique,
    likes: a.likes, dislikes: a.dislikes, comments: a.comments, shares: a.shares, saves: a.saves, raw: a.raw ?? null, forced: a.forced,
    createdAt: iso(a.createdAt), updatedAt: iso(a.updatedAt), deletedAt: iso(a.deletedAt),
  };
}

export function accountAnalytics(a: any) {
  return {
    id: a.id, socialAccountId: a.socialAccountId, impressions: a.impressions, impressionsUnique: a.impressionsUnique, views: a.views, viewsUnique: a.viewsUnique,
    likes: a.likes, comments: a.comments, postCount: a.postCount, followers: a.followers, following: a.following, forced: a.forced,
    createdAt: iso(a.createdAt), updatedAt: iso(a.updatedAt), deletedAt: iso(a.deletedAt),
  };
}

/** The post object on analytics responses (the reference returns the post without its joins). */
export function analyticsPost(p: any, wire: any) {
  return {
    id: wire.id, teamId: wire.teamId, organizationId: wire.organizationId, title: wire.title, referenceKey: wire.referenceKey, postDate: wire.postDate,
    postedDate: wire.postedDate, status: wire.status, data: wire.data, error: wire.error, errors: wire.errors, errorsVerbose: wire.errorsVerbose,
    externalData: wire.externalData, retryCount: p.retryCount, createdAt: wire.createdAt, updatedAt: wire.updatedAt, deletedAt: wire.deletedAt,
  };
}

export function historyImport(i: any) {
  const opts = (i.options ?? {}) as Record<string, any>;
  return {
    id: i.id, teamId: i.teamId, socialAccountId: i.socialAccountId, requestedCount: i.count, withAnalytics: i.withAnalytics,
    importCarousels: opts.importCarousels ?? false, surface: opts.surface ?? null, mediaType: opts.mediaType ?? null,
    status: i.status === 'FETCHING' ? 'FETCHING_POSTS' : i.status === 'RETRYING' ? 'PENDING' : i.status,
    postsImported: i.postsImported, analyticsImported: i.analyticsImported, error: i.error, rateLimitResetAt: iso(i.rateLimitResetAt),
    startedAt: iso(i.startedAt), completedAt: iso(i.completedAt), createdAt: iso(i.createdAt), updatedAt: iso(i.updatedAt), deletedAt: iso(i.deletedAt),
  };
}

export function csvImport(i: any) {
  return {
    id: i.id, teamId: i.teamId, organizationId: i.organizationId, status: i.status, fileName: i.fileName, totalRows: i.totalRows, processedRows: i.processedRows,
    successRows: i.successRows, failedRows: i.failedRows, error: i.error, rateLimitResetAt: iso(i.rateLimitResetAt), startedAt: iso(i.startedAt),
    completedAt: iso(i.completedAt), createdAt: iso(i.createdAt), updatedAt: iso(i.updatedAt), deletedAt: iso(i.deletedAt),
  };
}

export const csvRow = (r: any) => ({ id: r.id, importId: r.importId, rowNumber: r.rowNumber, status: r.status, postId: r.postId, rawRow: r.rawRow ?? {}, normalizedPayload: r.normalizedPayload ?? null, error: r.error, createdAt: iso(r.createdAt) });

const IMPORT_FETCHING = { GOOGLE_BUSINESS: 'FETCHING_REVIEWS', FACEBOOK: 'FETCHING_RECOMMENDATIONS' } as Record<string, string>;
export function reviewImport(i: any) {
  const status = ['FETCHING', 'FETCHING_REVIEWS', 'FETCHING_RECOMMENDATIONS'].includes(i.status) ? IMPORT_FETCHING[i.type] : i.status === 'RETRYING' ? 'PENDING' : i.status;
  return {
    id: i.id, teamId: i.teamId, socialAccountId: i.socialAccountId, requestedCount: i.count, status,
    ...(i.type === 'FACEBOOK' ? { itemsImported: i.imported } : { reviewsImported: i.imported }),
    error: i.error, rateLimitResetAt: iso(i.rateLimitResetAt), startedAt: iso(i.startedAt), completedAt: iso(i.completedAt),
    createdAt: iso(i.createdAt), updatedAt: iso(i.updatedAt), deletedAt: null,
  };
}

const STARS = ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE'];
export function gbpReview(r: any) {
  const pd = (r.platformData ?? {}) as Record<string, any>;
  return {
    id: r.id, socialAccountId: r.socialAccountId, teamId: r.teamId, externalReviewId: r.externalId,
    reviewerDisplayName: r.reviewerName, reviewerProfilePhotoUrl: r.reviewerAvatarUrl,
    starRating: r.rating && r.rating >= 1 && r.rating <= 5 ? STARS[r.rating - 1] : (pd.starRating ?? null),
    comment: r.text, reviewReplyComment: r.replyText, reviewReplyUpdatedAt: iso(r.replyUpdatedAt),
    reviewReplyState: pd.reviewReplyState ?? null, reviewReplyPolicyViolation: pd.reviewReplyPolicyViolation ?? null, reviewReplyUrl: pd.reviewReplyUrl ?? null,
    createTime: iso(r.publishedAt), updateTime: pd.updateTime ?? iso(r.publishedAt), importedAt: iso(r.createdAt),
    createdAt: iso(r.createdAt), updatedAt: iso(r.updatedAt), deletedAt: iso(r.deletedAt),
  };
}

export function fbRecommendation(r: any) {
  const pd = (r.platformData ?? {}) as Record<string, any>;
  const t = String(r.recommendationType ?? '').toLowerCase();
  return {
    id: r.id, socialAccountId: r.socialAccountId, teamId: r.teamId, externalRecommendationId: r.externalId, openGraphStoryId: pd.openGraphStoryId ?? null,
    reviewerDisplayName: r.reviewerName, reviewerProfilePhotoUrl: r.reviewerAvatarUrl,
    recommendationValue: t === 'positive' || t === 'recommend' ? 'RECOMMEND' : t === 'negative' || t === 'not_recommend' ? 'NOT_RECOMMEND' : 'UNKNOWN',
    rating: r.rating ?? null, comment: r.text, hasMedia: !!pd.hasMedia, mediaSummary: Array.isArray(pd.mediaSummary) ? pd.mediaSummary : null,
    ownerReplyComment: r.replyText, ownerReplyCommentId: pd.ownerReplyCommentId ?? null, ownerReplyUpdatedAt: iso(r.replyUpdatedAt),
    createTime: iso(r.publishedAt), updateTime: pd.updateTime ?? iso(r.publishedAt), importedAt: iso(r.createdAt),
    createdAt: iso(r.createdAt), updatedAt: iso(r.updatedAt), deletedAt: iso(r.deletedAt),
  };
}

/** Comma/array query values → string[] (Ajv coerces arrays, but tolerate "a,b"). */
export const listParam = (v: unknown): string[] | null => (v === undefined || v === null || v === '' ? null : (Array.isArray(v) ? v : [v]).flatMap(x => String(x).split(',')).map(s => s.trim()).filter(Boolean));
