-- CreateEnum
CREATE TYPE "SocialAccountType" AS ENUM ('TIKTOK', 'YOUTUBE', 'INSTAGRAM', 'FACEBOOK', 'TWITTER', 'THREADS', 'LINKEDIN', 'PINTEREST', 'REDDIT', 'MASTODON', 'DISCORD', 'SLACK', 'BLUESKY', 'GOOGLE_BUSINESS', 'SNAPCHAT');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'CUSTOMER');

-- CreateEnum
CREATE TYPE "AuthTokenKind" AS ENUM ('VERIFY_EMAIL', 'RESET_PASSWORD');

-- CreateEnum
CREATE TYPE "PlanTier" AS ENUM ('FREE', 'PRO', 'BUSINESS', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "MemberRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "BillingProvider" AS ENUM ('STRIPE', 'CHIP', 'MOCK');

-- CreateEnum
CREATE TYPE "BillingInterval" AS ENUM ('MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "PaymentPurpose" AS ENUM ('SUBSCRIPTION', 'CREDIT_TOPUP');

-- CreateEnum
CREATE TYPE "CreditReason" AS ENUM ('TOPUP', 'CHARGE', 'REFUND', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "CreditHoldStatus" AS ENUM ('HELD', 'CAPTURED', 'RELEASED');

-- CreateEnum
CREATE TYPE "InstagramConnectionMethod" AS ENUM ('FACEBOOK', 'INSTAGRAM');

-- CreateEnum
CREATE TYPE "MessagingStatus" AS ENUM ('DISABLED', 'ENABLED', 'DISABLE_PENDING');

-- CreateEnum
CREATE TYPE "ConnectionState" AS ENUM ('CONNECTED', 'NEEDS_RECONNECT', 'DISCONNECTED');

-- CreateEnum
CREATE TYPE "UploadType" AS ENUM ('image', 'video', 'document');

-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'POSTED', 'ERROR', 'DELETED', 'PROCESSING', 'REVIEW', 'RETRYING');

-- CreateEnum
CREATE TYPE "CreatedVia" AS ENUM ('API', 'DASHBOARD', 'CSV', 'MCP');

-- CreateEnum
CREATE TYPE "TargetStatus" AS ENUM ('PENDING', 'PROCESSING', 'REVIEW', 'POSTED', 'ERROR', 'DELETED');

-- CreateEnum
CREATE TYPE "ImportStatus" AS ENUM ('PENDING', 'FETCHING', 'FETCHING_POSTS', 'FETCHING_ANALYTICS', 'FETCHING_REVIEWS', 'FETCHING_RECOMMENDATIONS', 'RETRYING', 'COMPLETED', 'SKIPPED', 'FAILED', 'RATE_LIMITED');

-- CreateEnum
CREATE TYPE "ProfilePostType" AS ENUM ('POST', 'REEL', 'STORY', 'VIDEO', 'IMAGE');

-- CreateEnum
CREATE TYPE "CsvImportStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'COMPLETED_WITH_ERRORS', 'FAILED', 'RATE_LIMITED');

-- CreateEnum
CREATE TYPE "ConversationStatus" AS ENUM ('OPEN', 'ARCHIVED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "passwordHash" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "avatarUrl" TEXT,
    "timezone" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'CUSTOMER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT,
    "userAgent" TEXT,
    "ip" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthToken" (
    "id" TEXT NOT NULL,
    "kind" "AuthTokenKind" NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "promotionCodeId" TEXT,
    "name" TEXT,
    "avatarUrl" TEXT,
    "ref" TEXT,
    "tier" "PlanTier" NOT NULL DEFAULT 'FREE',
    "dailyPostLimit" JSONB,
    "dailyCommentLimit" JSONB,
    "monthlyPostLimit" INTEGER,
    "monthlyCommentLimit" INTEGER,
    "monthlyUploadLimit" INTEGER,
    "monthlyImportLimitPerAccount" INTEGER,
    "commentImportLimitPerPost" INTEGER,
    "monthlyReviewImportLimitPerAccount" INTEGER,
    "monthlyMessageLimitPerAccount" INTEGER,
    "monthlyAutomationExecutionLimitPerAccount" INTEGER,
    "rateLimitMultiplier" INTEGER NOT NULL DEFAULT 1,
    "apiAccess" BOOLEAN NOT NULL DEFAULT true,
    "analyticsDisabled" BOOLEAN NOT NULL DEFAULT false,
    "analyticsPostsDisabled" BOOLEAN NOT NULL DEFAULT false,
    "uploadsCompressionEnabled" BOOLEAN NOT NULL DEFAULT true,
    "analyticsInterval" INTEGER,
    "analyticsPostsInterval" INTEGER,
    "forcedAccountAnalyticsDailyLimit" INTEGER,
    "forcedPostAnalyticsDailyLimit" INTEGER,
    "showVerboseErrors" BOOLEAN NOT NULL DEFAULT false,
    "disconnectCheckEnabled" BOOLEAN NOT NULL DEFAULT true,
    "deleteAccountAfter" INTEGER NOT NULL DEFAULT 72,
    "messagingEnabled" BOOLEAN NOT NULL DEFAULT false,
    "suspended" BOOLEAN NOT NULL DEFAULT false,
    "trialEndsAt" TIMESTAMP(3),
    "billingEmail" TEXT,
    "stripeCustomerId" TEXT,
    "chipClientId" TEXT,
    "portalBrandName" TEXT,
    "portalLogoUrl" TEXT,
    "portalAccentColor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationMember" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "MemberRole" NOT NULL DEFAULT 'MEMBER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrganizationMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invitation" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "MemberRole" NOT NULL DEFAULT 'MEMBER',
    "tokenHash" TEXT NOT NULL,
    "invitedById" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "prefix" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "createdById" TEXT,
    "lastUsedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "provider" "BillingProvider" NOT NULL,
    "providerSubscriptionId" TEXT,
    "providerCustomerId" TEXT,
    "providerPaymentToken" TEXT,
    "status" TEXT NOT NULL,
    "tier" "PlanTier" NOT NULL,
    "billingInterval" "BillingInterval" NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "unitAmountCents" INTEGER NOT NULL,
    "couponId" TEXT,
    "promotionCodeId" TEXT,
    "isCustomPrice" BOOLEAN NOT NULL DEFAULT false,
    "customPriceLabel" TEXT,
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "trialEnd" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "canceledAt" TIMESTAMP(3),
    "failedAttempts" INTEGER NOT NULL DEFAULT 0,
    "nextRetryAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingInvoice" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "provider" "BillingProvider" NOT NULL,
    "providerInvoiceId" TEXT,
    "number" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "status" TEXT NOT NULL,
    "pdfUrl" TEXT,
    "hostedUrl" TEXT,
    "periodStart" TIMESTAMP(3),
    "periodEnd" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BillingInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingPayment" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "provider" "BillingProvider" NOT NULL,
    "purpose" "PaymentPurpose" NOT NULL,
    "providerRef" TEXT,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "tier" "PlanTier",
    "billingInterval" "BillingInterval",
    "settledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BillingPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditAccount" (
    "organizationId" TEXT NOT NULL,
    "balanceMicros" BIGINT NOT NULL DEFAULT 0,
    "heldMicros" BIGINT NOT NULL DEFAULT 0,
    "lowBalanceThresholdMicros" BIGINT DEFAULT 2000000,
    "lowBalanceNotifiedAt" TIMESTAMP(3),
    "exhaustedNotifiedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreditAccount_pkey" PRIMARY KEY ("organizationId")
);

-- CreateTable
CREATE TABLE "CreditLedger" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "deltaMicros" BIGINT NOT NULL,
    "reason" "CreditReason" NOT NULL,
    "action" TEXT,
    "refType" TEXT,
    "refId" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreditLedger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditHold" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "amountMicros" BIGINT NOT NULL,
    "status" "CreditHoldStatus" NOT NULL DEFAULT 'HELD',
    "refType" TEXT,
    "refId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "settledAt" TIMESTAMP(3),

    CONSTRAINT "CreditHold_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "organizationId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bot" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "teamId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Bot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialAccount" (
    "id" TEXT NOT NULL,
    "type" "SocialAccountType" NOT NULL,
    "teamId" TEXT NOT NULL,
    "username" TEXT,
    "displayName" TEXT,
    "bio" TEXT,
    "avatarUrl" TEXT,
    "externalId" TEXT,
    "providerPageId" TEXT,
    "userUsername" TEXT,
    "userDisplayName" TEXT,
    "userEmail" TEXT,
    "userId" TEXT,
    "channels" JSONB,
    "channelId" TEXT,
    "mastodonServerId" TEXT,
    "serverUrl" TEXT,
    "instagramConnectionMethod" "InstagramConnectionMethod",
    "twitterSubType" TEXT,
    "isTiktokBusinessAccount" BOOLEAN,
    "disconnectedCheckTryAt" TIMESTAMP(3),
    "deleteOn" TIMESTAMP(3),
    "messagingStatus" "MessagingStatus" NOT NULL DEFAULT 'DISABLED',
    "messagingStatusUpdatedAt" TIMESTAMP(3),
    "messagingLastError" TEXT,
    "state" "ConnectionState" NOT NULL DEFAULT 'CONNECTED',
    "stateReason" TEXT,
    "accessTokenEnc" TEXT,
    "refreshTokenEnc" TEXT,
    "secretsEnc" TEXT,
    "tokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scopes" TEXT[],
    "lastRefreshedAt" TIMESTAMP(3),
    "lastCheckedAt" TIMESTAMP(3),
    "profileRefreshedAt" TIMESTAMP(3),
    "analyticsRefreshedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "SocialAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MastodonServer" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "clientSecretEnc" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MastodonServer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OAuthState" (
    "state" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "type" "SocialAccountType" NOT NULL,
    "redirectUrl" TEXT,
    "codeVerifier" TEXT,
    "serverUrl" TEXT,
    "portalLinkId" TEXT,
    "socialAccountId" TEXT,
    "extra" JSONB,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OAuthState_pkey" PRIMARY KEY ("state")
);

-- CreateTable
CREATE TABLE "PortalLink" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "allowedTypes" "SocialAccountType"[],
    "redirectUrl" TEXT,
    "logoUrl" TEXT,
    "brandName" TEXT,
    "accentColor" TEXT,
    "language" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PortalLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Upload" (
    "id" TEXT NOT NULL,
    "teamId" TEXT,
    "organizationId" TEXT,
    "iconPath" TEXT,
    "thumbnailPath" TEXT,
    "path" TEXT,
    "externalLink" TEXT,
    "type" "UploadType" NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "fileSize" INTEGER,
    "videoLength" DOUBLE PRECISION,
    "mime" TEXT,
    "ext" TEXT,
    "originalName" TEXT,
    "sha256" TEXT,
    "status" TEXT NOT NULL DEFAULT 'READY',
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "purgedAt" TIMESTAMP(3),

    CONSTRAINT "Upload_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UploadSession" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "teamId" TEXT,
    "fileName" TEXT NOT NULL,
    "mime" TEXT NOT NULL,
    "fileSize" INTEGER,
    "storageKey" TEXT NOT NULL,
    "s3UploadId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "uploadId" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UploadSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "organizationId" TEXT,
    "title" TEXT NOT NULL,
    "referenceKey" TEXT,
    "postDate" TIMESTAMP(3),
    "postedDate" TIMESTAMP(3),
    "status" "PostStatus" NOT NULL DEFAULT 'DRAFT',
    "data" JSONB NOT NULL,
    "firstComment" JSONB,
    "error" TEXT,
    "errors" JSONB,
    "errorsVerbose" JSONB,
    "externalData" JSONB,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "countedAt" TIMESTAMP(3),
    "createdVia" "CreatedVia" NOT NULL DEFAULT 'API',
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostUpload" (
    "postId" TEXT NOT NULL,
    "uploadId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "PostUpload_pkey" PRIMARY KEY ("postId","uploadId")
);

-- CreateTable
CREATE TABLE "PostSocialAccount" (
    "postId" TEXT NOT NULL,
    "socialAccountId" TEXT NOT NULL,
    "type" "SocialAccountType" NOT NULL,
    "externalPostId" TEXT,
    "externalAlternatePostId" TEXT,
    "externalVideoId" TEXT,
    "targetStatus" "TargetStatus" NOT NULL DEFAULT 'PENDING',
    "attemptId" TEXT,
    "claimedAt" TIMESTAMP(3),
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "pendingRef" TEXT,
    "pollCount" INTEGER NOT NULL DEFAULT 0,
    "nextPollAt" TIMESTAMP(3),
    "contentHash" TEXT,
    "permalink" TEXT,
    "publishedAt" TIMESTAMP(3),
    "error" JSONB,
    "externalData" JSONB,
    "firstCommentStatus" TEXT,
    "firstCommentExternalId" TEXT,
    "creditHoldId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "PostSocialAccount_pkey" PRIMARY KEY ("postId","socialAccountId")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "organizationId" TEXT,
    "internalPostId" TEXT,
    "importedPostId" TEXT,
    "internalParentCommentId" TEXT,
    "fetchedParentCommentId" TEXT,
    "title" TEXT,
    "postDate" TIMESTAMP(3),
    "postedDate" TIMESTAMP(3),
    "status" "PostStatus" NOT NULL DEFAULT 'DRAFT',
    "data" JSONB NOT NULL,
    "error" TEXT,
    "errors" JSONB,
    "errorsVerbose" JSONB,
    "externalData" JSONB,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "targets" JSONB,
    "isFirstComment" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommentImport" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "organizationId" TEXT,
    "socialAccountId" TEXT NOT NULL,
    "type" "SocialAccountType" NOT NULL,
    "postId" TEXT,
    "importedPostId" TEXT,
    "externalPostId" TEXT,
    "status" "ImportStatus" NOT NULL DEFAULT 'PENDING',
    "commentsCount" INTEGER NOT NULL DEFAULT 0,
    "limit" INTEGER NOT NULL,
    "error" TEXT,
    "rateLimitResetAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "CommentImport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FetchedComment" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "organizationId" TEXT,
    "postId" TEXT,
    "importedPostId" TEXT,
    "socialAccountId" TEXT NOT NULL,
    "importId" TEXT NOT NULL,
    "platform" "SocialAccountType" NOT NULL,
    "externalId" TEXT NOT NULL,
    "externalParentId" TEXT,
    "externalPostId" TEXT,
    "authorName" TEXT,
    "authorExternalId" TEXT,
    "authorProfileUrl" TEXT,
    "authorAvatarUrl" TEXT,
    "text" TEXT,
    "likesCount" INTEGER NOT NULL DEFAULT 0,
    "repliesCount" INTEGER NOT NULL DEFAULT 0,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "liked" BOOLEAN NOT NULL DEFAULT false,
    "platformData" JSONB NOT NULL DEFAULT '{}',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "FetchedComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfilePost" (
    "id" TEXT NOT NULL,
    "socialAccountId" TEXT NOT NULL,
    "postId" TEXT,
    "externalId" TEXT,
    "title" TEXT,
    "smallThumbnail" TEXT,
    "thumbnail" TEXT,
    "permalink" TEXT,
    "extraData" JSONB,
    "subreddit" TEXT,
    "publishedAt" TIMESTAMP(3),
    "type" "ProfilePostType" NOT NULL DEFAULT 'POST',
    "internal" BOOLEAN NOT NULL DEFAULT false,
    "importedAt" TIMESTAMP(3),
    "externallyDeletedAt" TIMESTAMP(3),
    "analyticsRefreshedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ProfilePost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostAnalytics" (
    "id" TEXT NOT NULL,
    "profilePostId" TEXT NOT NULL,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "impressionsUnique" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "viewsUnique" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "dislikes" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "saves" INTEGER NOT NULL DEFAULT 0,
    "raw" JSONB,
    "forced" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "PostAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialAccountAnalytics" (
    "id" TEXT NOT NULL,
    "socialAccountId" TEXT NOT NULL,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "impressionsUnique" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "viewsUnique" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "postCount" INTEGER NOT NULL DEFAULT 0,
    "followers" INTEGER NOT NULL DEFAULT 0,
    "following" INTEGER NOT NULL DEFAULT 0,
    "raw" JSONB,
    "audience" JSONB,
    "forced" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "SocialAccountAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostHistoryImport" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "organizationId" TEXT,
    "socialAccountId" TEXT NOT NULL,
    "type" "SocialAccountType" NOT NULL,
    "status" "ImportStatus" NOT NULL DEFAULT 'PENDING',
    "count" INTEGER NOT NULL,
    "withAnalytics" BOOLEAN NOT NULL DEFAULT true,
    "postsImported" INTEGER NOT NULL DEFAULT 0,
    "analyticsImported" INTEGER NOT NULL DEFAULT 0,
    "cursor" TEXT,
    "error" TEXT,
    "rateLimitResetAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "PostHistoryImport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CsvImport" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "status" "CsvImportStatus" NOT NULL DEFAULT 'PENDING',
    "fileName" TEXT NOT NULL,
    "storagePath" TEXT,
    "totalRows" INTEGER NOT NULL DEFAULT 0,
    "processedRows" INTEGER NOT NULL DEFAULT 0,
    "successRows" INTEGER NOT NULL DEFAULT 0,
    "failedRows" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "rateLimitResetAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "CsvImport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CsvImportRow" (
    "id" TEXT NOT NULL,
    "importId" TEXT NOT NULL,
    "rowNumber" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "postId" TEXT,
    "rawRow" JSONB,
    "normalizedPayload" JSONB,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CsvImportRow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewImport" (
    "id" TEXT NOT NULL,
    "type" "SocialAccountType" NOT NULL,
    "teamId" TEXT NOT NULL,
    "organizationId" TEXT,
    "socialAccountId" TEXT NOT NULL,
    "status" "ImportStatus" NOT NULL DEFAULT 'PENDING',
    "count" INTEGER NOT NULL,
    "imported" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "rateLimitResetAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReviewImport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "type" "SocialAccountType" NOT NULL,
    "teamId" TEXT NOT NULL,
    "socialAccountId" TEXT NOT NULL,
    "importId" TEXT,
    "externalId" TEXT NOT NULL,
    "reviewerName" TEXT,
    "reviewerAvatarUrl" TEXT,
    "rating" INTEGER,
    "recommendationType" TEXT,
    "text" TEXT,
    "replyText" TEXT,
    "replyUpdatedAt" TIMESTAMP(3),
    "platformData" JSONB NOT NULL DEFAULT '{}',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "socialAccountId" TEXT NOT NULL,
    "platform" "SocialAccountType" NOT NULL,
    "externalConversationId" TEXT,
    "externalParticipantId" TEXT NOT NULL,
    "participantUsername" TEXT,
    "participantDisplayName" TEXT,
    "participantAvatarUrl" TEXT,
    "status" "ConversationStatus" NOT NULL DEFAULT 'OPEN',
    "lastMessageAt" TIMESTAMP(3),
    "lastActivityAt" TIMESTAMP(3),
    "lastMessagePreview" TEXT,
    "lastReadAt" TIMESTAMP(3),
    "unreadCount" INTEGER NOT NULL DEFAULT 0,
    "platformSeenAt" TIMESTAMP(3),
    "platformData" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversationMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "socialAccountId" TEXT NOT NULL,
    "platform" "SocialAccountType" NOT NULL,
    "direction" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "source" TEXT NOT NULL,
    "externalMessageId" TEXT,
    "text" TEXT,
    "attachments" JSONB NOT NULL DEFAULT '[]',
    "reactions" JSONB NOT NULL DEFAULT '[]',
    "sentAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "error" TEXT,
    "seenAt" TIMESTAMP(3),
    "replyTo" JSONB,
    "privateReplyContext" JSONB,
    "platformData" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConversationMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutomationFlow" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "organizationId" TEXT,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "platformScope" TEXT NOT NULL,
    "createdByUserId" TEXT,
    "draftVersionId" TEXT,
    "publishedVersionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "AutomationFlow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutomationFlowVersion" (
    "id" TEXT NOT NULL,
    "flowId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "definition" JSONB NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AutomationFlowVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutomationExecution" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "organizationId" TEXT,
    "flowId" TEXT NOT NULL,
    "flowVersionId" TEXT NOT NULL,
    "triggerId" TEXT,
    "platform" "SocialAccountType" NOT NULL,
    "socialAccountId" TEXT NOT NULL,
    "conversationId" TEXT,
    "conversationMessageId" TEXT,
    "fetchedCommentId" TEXT,
    "senderExternalId" TEXT,
    "currentStepId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "idempotencyKey" TEXT NOT NULL,
    "input" JSONB NOT NULL DEFAULT '{}',
    "output" JSONB NOT NULL DEFAULT '{}',
    "steps" JSONB NOT NULL DEFAULT '[]',
    "error" JSONB,
    "isTest" BOOLEAN NOT NULL DEFAULT false,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AutomationExecution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutomationProviderSetting" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "organizationId" TEXT,
    "platform" "SocialAccountType" NOT NULL,
    "socialAccountId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "config" JSONB,
    "providerResponse" JSONB,
    "lastSyncedAt" TIMESTAMP(3),
    "lastSyncError" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AutomationProviderSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bio" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "avatarUrl" TEXT,
    "theme" JSONB NOT NULL DEFAULT '{}',
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Bio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BioItem" (
    "id" TEXT NOT NULL,
    "bioId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT,
    "icon" TEXT,
    "position" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BioItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BioEvent" (
    "id" TEXT NOT NULL,
    "bioId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "itemId" TEXT,
    "country" TEXT,
    "referrer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BioEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsageCounter" (
    "organizationId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "used" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "UsageCounter_pkey" PRIMARY KEY ("organizationId","period","metric")
);

-- CreateTable
CREATE TABLE "DailyCounter" (
    "accountKey" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "used" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DailyCounter_pkey" PRIMARY KEY ("accountKey","day","metric")
);

-- CreateTable
CREATE TABLE "AccountMonthCounter" (
    "accountKey" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "used" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "AccountMonthCounter_pkey" PRIMARY KEY ("accountKey","period","metric")
);

-- CreateTable
CREATE TABLE "Webhook" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "events" TEXT[],
    "active" BOOLEAN NOT NULL DEFAULT true,
    "secretEnc" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Webhook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookDelivery" (
    "id" TEXT NOT NULL,
    "webhookId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "attempt" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "responseCode" INTEGER,
    "responseBody" TEXT,
    "durationMs" INTEGER,
    "nextAttemptAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebhookDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT,
    "kind" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "link" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "actorType" TEXT NOT NULL,
    "actorId" TEXT,
    "actorName" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "summary" TEXT NOT NULL,
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailOutbox" (
    "id" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "html" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "error" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailOutbox_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_externalId_key" ON "User"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_stripeCustomerId_key" ON "Organization"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_chipClientId_key" ON "Organization"("chipClientId");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationMember_organizationId_userId_key" ON "OrganizationMember"("organizationId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_tokenHash_key" ON "Invitation"("tokenHash");

-- CreateIndex
CREATE INDEX "Invitation_organizationId_idx" ON "Invitation"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_hash_key" ON "ApiKey"("hash");

-- CreateIndex
CREATE INDEX "ApiKey_organizationId_idx" ON "ApiKey"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_organizationId_key" ON "Subscription"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_providerSubscriptionId_key" ON "Subscription"("providerSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "BillingInvoice_number_key" ON "BillingInvoice"("number");

-- CreateIndex
CREATE INDEX "BillingInvoice_organizationId_createdAt_idx" ON "BillingInvoice"("organizationId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "BillingInvoice_provider_providerInvoiceId_key" ON "BillingInvoice"("provider", "providerInvoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "BillingPayment_providerRef_key" ON "BillingPayment"("providerRef");

-- CreateIndex
CREATE INDEX "CreditLedger_organizationId_createdAt_idx" ON "CreditLedger"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "CreditHold_organizationId_status_idx" ON "CreditHold"("organizationId", "status");

-- CreateIndex
CREATE INDEX "Team_organizationId_deletedAt_idx" ON "Team"("organizationId", "deletedAt");

-- CreateIndex
CREATE INDEX "SocialAccount_teamId_type_idx" ON "SocialAccount"("teamId", "type");

-- CreateIndex
CREATE INDEX "SocialAccount_type_providerPageId_idx" ON "SocialAccount"("type", "providerPageId");

-- CreateIndex
CREATE INDEX "SocialAccount_state_tokenExpiresAt_idx" ON "SocialAccount"("state", "tokenExpiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "MastodonServer_url_key" ON "MastodonServer"("url");

-- CreateIndex
CREATE UNIQUE INDEX "PortalLink_tokenHash_key" ON "PortalLink"("tokenHash");

-- CreateIndex
CREATE INDEX "Upload_organizationId_teamId_deletedAt_idx" ON "Upload"("organizationId", "teamId", "deletedAt");

-- CreateIndex
CREATE INDEX "Upload_lastUsedAt_idx" ON "Upload"("lastUsedAt");

-- CreateIndex
CREATE INDEX "Post_teamId_postDate_idx" ON "Post"("teamId", "postDate");

-- CreateIndex
CREATE INDEX "Post_status_postDate_idx" ON "Post"("status", "postDate");

-- CreateIndex
CREATE INDEX "Post_organizationId_createdAt_idx" ON "Post"("organizationId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Post_organizationId_referenceKey_key" ON "Post"("organizationId", "referenceKey");

-- CreateIndex
CREATE INDEX "PostSocialAccount_targetStatus_nextPollAt_idx" ON "PostSocialAccount"("targetStatus", "nextPollAt");

-- CreateIndex
CREATE INDEX "PostSocialAccount_socialAccountId_idx" ON "PostSocialAccount"("socialAccountId");

-- CreateIndex
CREATE INDEX "Comment_teamId_createdAt_idx" ON "Comment"("teamId", "createdAt");

-- CreateIndex
CREATE INDEX "Comment_status_postDate_idx" ON "Comment"("status", "postDate");

-- CreateIndex
CREATE INDEX "CommentImport_teamId_createdAt_idx" ON "CommentImport"("teamId", "createdAt");

-- CreateIndex
CREATE INDEX "FetchedComment_importId_idx" ON "FetchedComment"("importId");

-- CreateIndex
CREATE INDEX "FetchedComment_postId_idx" ON "FetchedComment"("postId");

-- CreateIndex
CREATE UNIQUE INDEX "FetchedComment_socialAccountId_externalId_key" ON "FetchedComment"("socialAccountId", "externalId");

-- CreateIndex
CREATE INDEX "ProfilePost_postId_idx" ON "ProfilePost"("postId");

-- CreateIndex
CREATE UNIQUE INDEX "ProfilePost_socialAccountId_externalId_key" ON "ProfilePost"("socialAccountId", "externalId");

-- CreateIndex
CREATE INDEX "PostAnalytics_profilePostId_createdAt_idx" ON "PostAnalytics"("profilePostId", "createdAt");

-- CreateIndex
CREATE INDEX "SocialAccountAnalytics_socialAccountId_createdAt_idx" ON "SocialAccountAnalytics"("socialAccountId", "createdAt");

-- CreateIndex
CREATE INDEX "PostHistoryImport_teamId_createdAt_idx" ON "PostHistoryImport"("teamId", "createdAt");

-- CreateIndex
CREATE INDEX "CsvImportRow_importId_rowNumber_idx" ON "CsvImportRow"("importId", "rowNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Review_socialAccountId_externalId_key" ON "Review"("socialAccountId", "externalId");

-- CreateIndex
CREATE INDEX "Conversation_teamId_lastActivityAt_idx" ON "Conversation"("teamId", "lastActivityAt");

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_socialAccountId_externalParticipantId_key" ON "Conversation"("socialAccountId", "externalParticipantId");

-- CreateIndex
CREATE INDEX "ConversationMessage_conversationId_createdAt_idx" ON "ConversationMessage"("conversationId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ConversationMessage_socialAccountId_externalMessageId_key" ON "ConversationMessage"("socialAccountId", "externalMessageId");

-- CreateIndex
CREATE UNIQUE INDEX "AutomationExecution_idempotencyKey_key" ON "AutomationExecution"("idempotencyKey");

-- CreateIndex
CREATE INDEX "AutomationExecution_flowId_createdAt_idx" ON "AutomationExecution"("flowId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AutomationProviderSetting_socialAccountId_type_key" ON "AutomationProviderSetting"("socialAccountId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Bio_teamId_key" ON "Bio"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "Bio_slug_key" ON "Bio"("slug");

-- CreateIndex
CREATE INDEX "BioEvent_bioId_createdAt_idx" ON "BioEvent"("bioId", "createdAt");

-- CreateIndex
CREATE INDEX "WebhookDelivery_webhookId_createdAt_idx" ON "WebhookDelivery"("webhookId", "createdAt");

-- CreateIndex
CREATE INDEX "WebhookDelivery_status_nextAttemptAt_idx" ON "WebhookDelivery"("status", "nextAttemptAt");

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_organizationId_createdAt_idx" ON "AuditLog"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "EmailOutbox_status_createdAt_idx" ON "EmailOutbox"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthToken" ADD CONSTRAINT "AuthToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingInvoice" ADD CONSTRAINT "BillingInvoice_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingPayment" ADD CONSTRAINT "BillingPayment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditAccount" ADD CONSTRAINT "CreditAccount_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditLedger" ADD CONSTRAINT "CreditLedger_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditHold" ADD CONSTRAINT "CreditHold_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bot" ADD CONSTRAINT "Bot_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialAccount" ADD CONSTRAINT "SocialAccount_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialAccount" ADD CONSTRAINT "SocialAccount_mastodonServerId_fkey" FOREIGN KEY ("mastodonServerId") REFERENCES "MastodonServer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortalLink" ADD CONSTRAINT "PortalLink_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Upload" ADD CONSTRAINT "Upload_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostUpload" ADD CONSTRAINT "PostUpload_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostUpload" ADD CONSTRAINT "PostUpload_uploadId_fkey" FOREIGN KEY ("uploadId") REFERENCES "Upload"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostSocialAccount" ADD CONSTRAINT "PostSocialAccount_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostSocialAccount" ADD CONSTRAINT "PostSocialAccount_socialAccountId_fkey" FOREIGN KEY ("socialAccountId") REFERENCES "SocialAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_internalPostId_fkey" FOREIGN KEY ("internalPostId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfilePost" ADD CONSTRAINT "ProfilePost_socialAccountId_fkey" FOREIGN KEY ("socialAccountId") REFERENCES "SocialAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostAnalytics" ADD CONSTRAINT "PostAnalytics_profilePostId_fkey" FOREIGN KEY ("profilePostId") REFERENCES "ProfilePost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialAccountAnalytics" ADD CONSTRAINT "SocialAccountAnalytics_socialAccountId_fkey" FOREIGN KEY ("socialAccountId") REFERENCES "SocialAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CsvImport" ADD CONSTRAINT "CsvImport_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CsvImportRow" ADD CONSTRAINT "CsvImportRow_importId_fkey" FOREIGN KEY ("importId") REFERENCES "CsvImport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_socialAccountId_fkey" FOREIGN KEY ("socialAccountId") REFERENCES "SocialAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationMessage" ADD CONSTRAINT "ConversationMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomationFlowVersion" ADD CONSTRAINT "AutomationFlowVersion_flowId_fkey" FOREIGN KEY ("flowId") REFERENCES "AutomationFlow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomationExecution" ADD CONSTRAINT "AutomationExecution_flowId_fkey" FOREIGN KEY ("flowId") REFERENCES "AutomationFlow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomationProviderSetting" ADD CONSTRAINT "AutomationProviderSetting_socialAccountId_fkey" FOREIGN KEY ("socialAccountId") REFERENCES "SocialAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bio" ADD CONSTRAINT "Bio_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BioItem" ADD CONSTRAINT "BioItem_bioId_fkey" FOREIGN KEY ("bioId") REFERENCES "Bio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BioEvent" ADD CONSTRAINT "BioEvent_bioId_fkey" FOREIGN KEY ("bioId") REFERENCES "Bio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Webhook" ADD CONSTRAINT "Webhook_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebhookDelivery" ADD CONSTRAINT "WebhookDelivery_webhookId_fkey" FOREIGN KEY ("webhookId") REFERENCES "Webhook"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ── hand-written: integrity rules Prisma cannot express ──────────────────────
-- One live account per network per team (a disconnected/deleted one may linger until purged).
CREATE UNIQUE INDEX "SocialAccount_team_type_live" ON "SocialAccount"("teamId", "type") WHERE "deletedAt" IS NULL;
-- Credit can never be over-held; the hold UPDATE also checks this, the constraint is the backstop.
ALTER TABLE "CreditAccount" ADD CONSTRAINT "CreditAccount_held_nonneg" CHECK ("heldMicros" >= 0);
ALTER TABLE "UsageCounter" ADD CONSTRAINT "UsageCounter_used_nonneg" CHECK ("used" >= 0);
ALTER TABLE "DailyCounter" ADD CONSTRAINT "DailyCounter_used_nonneg" CHECK ("used" >= 0);
ALTER TABLE "PostSocialAccount" ADD CONSTRAINT "PostSocialAccount_attempts_nonneg" CHECK ("attempts" >= 0);
