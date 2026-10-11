import type { NetworkType } from '@siar/networks';
import * as storage from '../platform/storage.js';
import { limitsFor, type Tier } from './plans.js';

/**
 * Rows → wire shapes (docs/reference OpenAPI). Kept in one place so every endpoint returns the same
 * object for the same thing. Internal columns (tokens, claim state, hashes) never leave here.
 */
const iso = (d: Date | null | undefined) => (d ? d.toISOString() : null);

export function user(u: any) {
  if (!u) return null;
  return {
    id: u.id, externalId: u.externalId, email: u.email, emailVerified: iso(u.emailVerified), firstName: u.firstName, lastName: u.lastName,
    avatarUrl: u.avatarUrl, timezone: u.timezone, role: u.role, createdAt: iso(u.createdAt), updatedAt: iso(u.updatedAt), deletedAt: iso(u.deletedAt),
  };
}

export function subscription(s: any) {
  if (!s) return null;
  return {
    id: s.id, organizationId: s.organizationId, couponId: s.couponId, promotionCodeId: s.promotionCodeId,
    stripeSubscriptionId: s.provider === 'STRIPE' ? s.providerSubscriptionId ?? '' : s.providerSubscriptionId ?? s.id,
    stripeSubscriptionItems: [], status: s.status, metadata: s.metadata ?? {}, stripePriceId: s.metadata?.priceId ?? `${s.tier}_${s.billingInterval}`,
    tier: s.tier === 'ENTERPRISE' ? 'BUSINESS' : s.tier, billingInterval: s.billingInterval, isCustomPrice: s.isCustomPrice, customPriceLabel: s.customPriceLabel,
    customUnitAmount: s.isCustomPrice ? s.unitAmountCents : null, customCurrency: s.isCustomPrice ? s.currency : null,
    provider: s.provider, currentPeriodEnd: iso(s.currentPeriodEnd), cancelAtPeriodEnd: s.cancelAtPeriodEnd, trialEnd: iso(s.trialEnd),
    createdAt: iso(s.createdAt), updatedAt: iso(s.updatedAt),
  };
}

export function organization(o: any, extra: { createdBy?: any; subscription?: any } = {}) {
  const l = limitsFor({ ...o, tier: o.tier as Tier });
  return {
    id: o.id, createdById: o.createdById, promotionCodeId: o.promotionCodeId, name: o.name, avatarUrl: o.avatarUrl, ref: o.ref,
    tier: o.tier,
    dailyPostLimit: l.dailyPosts, dailyCommentLimit: l.dailyComments,
    monthlyImportLimitPerAccount: l.importPostsPerAccount, commentImportLimitPerPost: l.commentImportPerPost,
    monthlyReviewImportLimitPerAccount: l.reviewImportPerAccount, monthlyMessageLimitPerAccount: l.dmsPerAccount,
    monthlyAutomationExecutionLimitPerAccount: l.automationRunsPerAccount,
    apiAccess: o.apiAccess, analyticsDisabled: o.analyticsDisabled || !l.analytics, analyticsPostsDisabled: o.analyticsPostsDisabled || !l.analytics,
    uploadsCompressionEnabled: o.uploadsCompressionEnabled, analyticsInterval: o.analyticsInterval, analyticsPostsInterval: o.analyticsPostsInterval,
    forcedAccountAnalyticsDailyLimit: o.forcedAccountAnalyticsDailyLimit ?? 5, forcedPostAnalyticsDailyLimit: o.forcedPostAnalyticsDailyLimit ?? 5,
    showVerboseErrors: o.showVerboseErrors, disconnectCheckEnabled: o.disconnectCheckEnabled, deleteAccountAfter: o.deleteAccountAfter,
    portalBrandName: o.portalBrandName, portalLogoUrl: o.portalLogoUrl, portalAccentColor: o.portalAccentColor,
    trialEndsAt: iso(o.trialEndsAt),
    createdAt: iso(o.createdAt), updatedAt: iso(o.updatedAt), deletedAt: iso(o.deletedAt), suspended: o.suspended,
    ...(extra.createdBy !== undefined ? { createdBy: user(extra.createdBy) } : {}),
    ...(extra.subscription !== undefined ? { subscription: subscription(extra.subscription) } : {}),
  };
}

export function socialAccount(a: any) {
  return {
    id: a.id, type: a.type, teamId: a.teamId, username: a.username, displayName: a.displayName, bio: a.bio, avatarUrl: a.avatarUrl,
    externalId: a.externalId, providerPageId: a.providerPageId, userUsername: a.userUsername, userDisplayName: a.userDisplayName,
    userEmail: a.userEmail, userId: a.userId, channels: a.channels ?? [], mastodonServerId: a.mastodonServerId,
    instagramConnectionMethod: a.instagramConnectionMethod, twitterSubType: a.twitterSubType, isTiktokBusinessAccount: a.isTiktokBusinessAccount,
    disconnectedCheckTryAt: iso(a.disconnectedCheckTryAt), deleteOn: iso(a.deleteOn),
    messagingStatus: a.messagingStatus, messagingStatusUpdatedAt: iso(a.messagingStatusUpdatedAt), messagingLastError: a.messagingLastError,
    // Siar extension: connection health, so a dashboard can prompt a reconnect.
    connectionState: a.state, connectionStateReason: a.stateReason, channelId: a.channelId,
    createdAt: iso(a.createdAt), updatedAt: iso(a.updatedAt), deletedAt: iso(a.deletedAt),
  };
}

export const bot = (b: any) => ({ id: b.id, name: b.name, avatarUrl: b.avatarUrl, teamId: b.teamId, createdAt: iso(b.createdAt), updatedAt: iso(b.updatedAt), deletedAt: iso(b.deletedAt) });

export function team(t: any) {
  return {
    id: t.id, name: t.name, avatarUrl: t.avatarUrl, organizationId: t.organizationId, createdById: t.createdById,
    createdAt: iso(t.createdAt), updatedAt: iso(t.updatedAt), deletedAt: iso(t.deletedAt),
    ...(t.organization ? { organization: organization(t.organization) } : {}),
    ...(t.createdBy ? { createdBy: user(t.createdBy) } : {}),
    bots: (t.bots ?? []).filter((b: any) => !b.deletedAt).map(bot),
    socialAccounts: (t.socialAccounts ?? []).filter((a: any) => !a.deletedAt).map(socialAccount),
    bio: t.bio && !t.bio.deletedAt ? { id: t.bio.id, slug: t.bio.slug, title: t.bio.title, published: t.bio.published } : null,
  };
}

export function upload(u: any) {
  const url = (k: string | null) => (k ? storage.signedUrl(k) : null);
  return {
    id: u.id, teamId: u.teamId, organizationId: u.organizationId,
    iconUrl: url(u.iconPath), thumbnailUrl: url(u.thumbnailPath), url: url(u.path), externalLink: u.externalLink,
    iconPath: u.iconPath, thumbnailPath: u.thumbnailPath, path: u.path,
    type: u.type, width: u.width, height: u.height, fileSize: u.fileSize, videoLength: u.videoLength, mime: u.mime, ext: u.ext,
    createdAt: iso(u.createdAt), updatedAt: iso(u.updatedAt), deletedAt: iso(u.deletedAt),
    posts: (u.posts ?? []).map((p: any) => ({ postId: p.postId, uploadId: p.uploadId, createdAt: iso(p.createdAt), updatedAt: iso(p.updatedAt), deletedAt: iso(p.deletedAt) })),
  };
}

/** Per-network maps from the targets (errors, errorsVerbose, externalData) — the wire keeps them on the post. */
export function targetMaps(targets: any[], verbose: boolean) {
  const errors: Record<string, string> = {};
  const errorsVerbose: Record<string, unknown> = {};
  const externalData: Record<string, unknown> = {};
  for (const t of targets) {
    if (t.error) {
      errors[t.type] = t.error.userFacingMessage ?? t.error.errorMessage ?? 'Publishing failed.';
      if (verbose) errorsVerbose[t.type] = t.error;
    }
    if (t.externalPostId || t.externalData || t.permalink) {
      externalData[t.type] = { id: t.externalPostId, permalink: t.permalink, status: t.targetStatus, publishedAt: iso(t.publishedAt), ...(t.externalData ?? {}) };
    }
  }
  return { errors: Object.keys(errors).length ? errors : null, errorsVerbose: Object.keys(errorsVerbose).length ? errorsVerbose : null, externalData: Object.keys(externalData).length ? externalData : null };
}

export function post(p: any, opts: { verbose?: boolean } = {}) {
  const targets = p.socialAccounts ?? [];
  const maps = targetMaps(targets, opts.verbose ?? false);
  return {
    id: p.id, teamId: p.teamId, organizationId: p.organizationId, title: p.title, referenceKey: p.referenceKey,
    postDate: iso(p.postDate), postedDate: iso(p.postedDate), status: p.status, data: p.data, error: p.error,
    errors: maps.errors, errorsVerbose: opts.verbose ? maps.errorsVerbose : null, externalData: maps.externalData,
    retryCount: p.retryCount, createdAt: iso(p.createdAt), updatedAt: iso(p.updatedAt), deletedAt: iso(p.deletedAt),
    firstComment: p.firstComment ?? null,
    uploads: (p.uploads ?? []).map((pu: any) => ({ postId: pu.postId, uploadId: pu.uploadId, createdAt: iso(pu.createdAt), updatedAt: iso(pu.updatedAt), deletedAt: iso(pu.deletedAt), upload: pu.upload ? upload(pu.upload) : undefined })),
    socialAccounts: targets.map((t: any) => ({
      postId: t.postId, socialAccountId: t.socialAccountId, externalPostId: t.externalPostId, externalAlternatePostId: t.externalAlternatePostId,
      externalVideoId: t.externalVideoId, createdAt: iso(t.createdAt), updatedAt: iso(t.updatedAt), deletedAt: iso(t.deletedAt),
      // Siar extension: per-network state.
      status: t.targetStatus, permalink: t.permalink, publishedAt: iso(t.publishedAt),
      socialAccount: t.socialAccount ? socialAccount(t.socialAccount) : undefined,
    })),
  };
}

export function comment(c: any, opts: { verbose?: boolean } = {}) {
  return {
    id: c.id, teamId: c.teamId, organizationId: c.organizationId, internalPostId: c.internalPostId, importedPostId: c.importedPostId,
    internalParentCommentId: c.internalParentCommentId, fetchedParentCommentId: c.fetchedParentCommentId, title: c.title,
    postDate: iso(c.postDate), postedDate: iso(c.postedDate), status: c.status, data: c.data, error: c.error,
    errors: c.errors ?? null, errorsVerbose: opts.verbose ? c.errorsVerbose ?? null : null, externalData: c.externalData ?? null,
    retryCount: c.retryCount, createdAt: iso(c.createdAt), updatedAt: iso(c.updatedAt), deletedAt: iso(c.deletedAt),
  };
}

export const NETWORK_TYPES: NetworkType[] = ['TIKTOK', 'YOUTUBE', 'INSTAGRAM', 'FACEBOOK', 'TWITTER', 'THREADS', 'LINKEDIN', 'PINTEREST', 'REDDIT', 'MASTODON', 'DISCORD', 'SLACK', 'BLUESKY', 'GOOGLE_BUSINESS', 'SNAPCHAT'];
