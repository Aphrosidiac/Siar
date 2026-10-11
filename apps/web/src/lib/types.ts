import type { operations } from '@siar/contract';

type Ops = operations;
type JsonOf<R> = R extends { content: { 'application/json': infer J } } ? J : never;
/** Response body of an operation (first 2xx). */
export type Resp<K extends keyof Ops> = Ops[K] extends { responses: infer R }
  ? R extends { 200: infer A } ? JsonOf<A> : R extends { 201: infer B } ? JsonOf<B> : unknown
  : unknown;
/** JSON request body of an operation. */
export type Body<K extends keyof Ops> = Ops[K] extends { requestBody?: infer RB } ? (NonNullable<RB> extends { content: { 'application/json': infer J } } ? J : never) : never;

export type NetworkType = 'TIKTOK' | 'YOUTUBE' | 'INSTAGRAM' | 'FACEBOOK' | 'TWITTER' | 'THREADS' | 'LINKEDIN' | 'PINTEREST' | 'REDDIT' | 'MASTODON' | 'DISCORD' | 'SLACK' | 'BLUESKY' | 'GOOGLE_BUSINESS' | 'SNAPCHAT';
export type Role = 'OWNER' | 'ADMIN' | 'MEMBER';

type MeBase = Resp<'auth.me'>;
export type AuthMe = Omit<MeBase, 'user' | 'memberships'> & { user: MeBase['user'] & { isStaff?: boolean }; memberships: (MeBase['memberships'][number] & { tier?: string })[] };
export type Organization = Resp<'organization.getOrganization'> & { tier?: 'FREE' | 'PRO' | 'BUSINESS' | 'ENTERPRISE'; trialEndsAt?: string | null; portalBrandName?: string | null; portalLogoUrl?: string | null; portalAccentColor?: string | null };

export interface Channel { id: string; name?: string | null; username?: string | null; address?: string | null; avatarUrl?: string | null; webhook?: string | null; metadata?: unknown }

/** Wire social account + Siar extensions (connection health and the chosen channel). */
export interface SocialAccount {
  id: string; type: NetworkType; teamId: string;
  username?: string | null; displayName?: string | null; bio?: string | null; avatarUrl?: string | null;
  externalId?: string | null; providerPageId?: string | null; userUsername?: string | null; userDisplayName?: string | null;
  channels?: Channel[] | null; channelId?: string | null;
  twitterSubType?: 'none' | 'basic' | 'premium' | 'premium_plus' | null; isTiktokBusinessAccount?: boolean | null;
  instagramConnectionMethod?: 'FACEBOOK' | 'INSTAGRAM' | null;
  deleteOn?: string | null; messagingStatus?: 'DISABLED' | 'ENABLED' | 'DISABLE_PENDING' | null; messagingLastError?: string | null;
  connectionState?: 'CONNECTED' | 'NEEDS_RECONNECT' | 'DISCONNECTED' | null; connectionStateReason?: string | null;
  createdAt?: string | null; updatedAt?: string | null;
}

export interface Bot { id: string; name: string; avatarUrl?: string | null; teamId: string; createdAt?: string | null }
export interface Team {
  id: string; name: string; avatarUrl?: string | null; organizationId: string; createdAt?: string | null;
  socialAccounts: SocialAccount[]; bots?: Bot[];
  bio?: { id: string; slug: string; title: string; published: boolean } | null;
}

export type PostStatus = 'DRAFT' | 'SCHEDULED' | 'POSTED' | 'ERROR' | 'DELETED' | 'PROCESSING' | 'REVIEW' | 'RETRYING';
export interface Upload {
  id: string; teamId?: string | null; url?: string | null; thumbnailUrl?: string | null; iconUrl?: string | null; externalLink?: string | null;
  type: 'image' | 'video' | 'document'; width?: number | null; height?: number | null; fileSize?: number | null; videoLength?: number | null;
  mime?: string | null; ext?: string | null; createdAt?: string | null; posts?: { postId: string }[];
}
export interface PostTarget {
  postId: string; socialAccountId: string; externalPostId?: string | null;
  status?: 'PENDING' | 'PROCESSING' | 'REVIEW' | 'POSTED' | 'ERROR' | 'DELETED' | string | null; permalink?: string | null; publishedAt?: string | null;
  socialAccount?: SocialAccount;
}
export interface Post {
  id: string; teamId: string; title: string; referenceKey?: string | null; postDate: string | null; postedDate?: string | null;
  status: PostStatus; data: Record<string, Record<string, any> | null>; error?: string | null;
  errors?: Record<string, string> | null; errorsVerbose?: Record<string, unknown> | null; externalData?: Record<string, any> | null;
  retryCount: number; createdAt?: string | null; updatedAt?: string | null; firstComment?: Record<string, string | null> | null;
  uploads?: { uploadId: string; upload?: Upload }[]; socialAccounts?: PostTarget[];
}

export interface Paged<T> { items: T[]; total: number }

export interface Invoice { id: string; number: string; description: string; amountCents: number; currency: string; status: string; provider: string; pdfUrl?: string | null; hostedUrl?: string | null; periodStart?: string | null; periodEnd?: string | null; paidAt?: string | null; paymentMethod?: string | null; createdAt: string }
export interface InvoiceLine { description: string; quantity: number; unitAmountCents: number; amountCents: number; periodStart?: string | null; periodEnd?: string | null }
export interface BillingDetails { name: string | null; email: string | null; address: string | null; taxId: string | null }
export interface InvoiceDocument extends Invoice { lines: InvoiceLine[]; subtotalCents: number; totalCents: number; amountPaidCents: number; amountDueCents: number; billTo: BillingDetails | null; issuer: { name: string; registration: string; product: string; country: string; email: string; website: string } }
