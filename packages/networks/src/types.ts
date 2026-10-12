/**
 * The contract every network adapter implements.
 *
 * Adapters are pure integration code: they build requests to the network's real API, parse the
 * responses and map errors. They never touch the database, the queue or the clock beyond what is
 * passed in. The API's engine owns state (tokens, targets, retries, quotas) and calls in here.
 *
 * Adapters always use the network's real URLs through `ctx.fetch`. In mock mode the runtime
 * rewrites every absolute URL to the local mock server (mocks/), so one code path is exercised in
 * tests, in development and in production.
 */

export const NETWORK_TYPES = [
  'TIKTOK', 'YOUTUBE', 'INSTAGRAM', 'FACEBOOK', 'TWITTER', 'THREADS', 'LINKEDIN', 'PINTEREST',
  'REDDIT', 'MASTODON', 'DISCORD', 'SLACK', 'BLUESKY', 'GOOGLE_BUSINESS', 'SNAPCHAT',
] as const;
export type NetworkType = (typeof NETWORK_TYPES)[number];

// ───────────────────────────── runtime ─────────────────────────────

export interface Logger {
  debug(obj: object, msg?: string): void;
  info(obj: object, msg?: string): void;
  warn(obj: object, msg?: string): void;
  error(obj: object, msg?: string): void;
}

/** App credentials for one network (from env NETWORK_<TYPE>_*). Keys are adapter-defined. */
export type AppCredentials = Record<string, string | undefined>;

export interface NetworkContext {
  mode: 'live' | 'mock';
  /** fetch with mock-mode URL rewriting, timeouts and request logging. */
  fetch: (url: string, init?: RequestInit & { timeoutMs?: number }) => Promise<Response>;
  credentials: AppCredentials;
  /** Our OAuth callback for this network, e.g. https://api.siaran.my/api/v1/social-account/callback/MASTODON */
  redirectUri: string;
  /** Public base of our API (for webhooks the network calls back, e.g. Meta, TikTok). */
  apiUrl: string;
  log: Logger;
  now: () => Date;
}

export interface TokenSet {
  accessToken: string;
  refreshToken?: string | null;
  expiresAt?: Date | null;
  refreshTokenExpiresAt?: Date | null;
  scopes?: string[];
  /**
   * Anything else secret the adapter needs later: page tokens, app passwords, webhook URLs,
   * OAuth1 token secrets, DPoP keys. Stored encrypted as JSON.
   */
  secrets?: Record<string, unknown>;
}

export interface Channel {
  id: string;
  name?: string | null;
  username?: string | null;
  address?: string | null;
  avatarUrl?: string | null;
  webhook?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
}

/** What the network tells us about the connected identity. Field names follow the public API. */
export interface AccountProfile {
  /** The posting identity: the user, or the selected page/channel/board/location. */
  externalId: string;
  username?: string | null;
  displayName?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  /** The connected *user's* stable id. Daily caps and reconnects key on type + this. */
  providerPageId: string;
  userUsername?: string | null;
  userDisplayName?: string | null;
  userEmail?: string | null;
  userId?: string | null;
  channels?: Channel[];
  instagramConnectionMethod?: 'FACEBOOK' | 'INSTAGRAM' | null;
  twitterSubType?: 'none' | 'basic' | 'premium' | 'premium_plus' | null;
  isTiktokBusinessAccount?: boolean | null;
}

export interface ConnectedAccount {
  token: TokenSet;
  profile: AccountProfile;
}

/** A connected account as the engine hands it to the adapter. */
export interface AccountRuntime {
  id: string;
  type: NetworkType;
  externalId: string | null;
  providerPageId: string | null;
  username: string | null;
  displayName: string | null;
  /** The selected channel (page, org, board, location, guild channel …), if the network has them. */
  channelId: string | null;
  channels: Channel[];
  token: TokenSet;
  serverUrl: string | null;
  instagramConnectionMethod?: 'FACEBOOK' | 'INSTAGRAM' | null;
}

export interface MediaRef {
  id: string;
  type: 'image' | 'video' | 'document';
  mime: string;
  ext: string;
  /** Short-lived public URL on our media domain — for networks that pull media by URL. */
  url: string;
  fileSize: number;
  width?: number | null;
  height?: number | null;
  /** Seconds. */
  duration?: number | null;
  altText?: string | null;
  /** The bytes, for networks that need an upload. Large videos: prefer `stream`. */
  read(): Promise<Buffer>;
  stream(): Promise<ReadableStream<Uint8Array>>;
  /** Read a byte range (chunked uploads: TikTok, YouTube resumable, X, LinkedIn). */
  readRange(start: number, endExclusive: number): Promise<Buffer>;
  /** A still frame of a video, generated on upload — for networks that require a poster image (Reddit). */
  poster?: { mime: string; ext: string; read(): Promise<Buffer> } | null;
}

// ───────────────────────────── publishing ─────────────────────────────

export interface PublishInput {
  account: AccountRuntime;
  postId: string;
  title: string;
  /** This network's entry from the post's `data` (shape per the public API). */
  data: Record<string, any>;
  /** Uploads referenced by data.uploadIds / mediaItems / carouselItems, in order. */
  media: MediaRef[];
  /** Resolve any other upload id the data references (thumbnails, thread items, carousel items). */
  resolveUpload(id: string): Promise<MediaRef>;
  /** Bot identity for Discord/Slack (username/avatarUrl) when set. */
  bot?: { name: string; avatarUrl?: string | null } | null;
}

export type PublishResult =
  | {
      status: 'POSTED';
      externalPostId: string;
      externalAlternatePostId?: string | null;
      externalVideoId?: string | null;
      permalink?: string | null;
      externalData?: Record<string, unknown>;
    }
  | {
      /** The network accepted the post but finishes it asynchronously — call poll() later. */
      status: 'PROCESSING';
      pendingRef: string;
      pollAfterMs: number;
      externalData?: Record<string, unknown>;
    }
  | {
      /** Published but held by the network (e.g. TikTok moderation, uploaded to drafts/inbox). */
      status: 'REVIEW';
      externalPostId?: string | null;
      pendingRef?: string | null;
      pollAfterMs?: number;
      permalink?: string | null;
      externalData?: Record<string, unknown>;
    };

export interface RecentPost {
  externalId: string;
  text?: string | null;
  createdAt?: Date | null;
  permalink?: string | null;
}

// ───────────────────────────── comments ─────────────────────────────

export interface CommentInput {
  account: AccountRuntime;
  externalPostId: string;
  /** Reply to this comment instead of the post. */
  parentExternalId?: string | null;
  text: string;
  media: MediaRef[];
  data: Record<string, any>;
}

export interface CommentResult {
  externalId: string;
  permalink?: string | null;
  externalData?: Record<string, unknown>;
}

export interface FetchedCommentInput {
  externalId: string;
  externalParentId?: string | null;
  externalPostId?: string | null;
  authorName?: string | null;
  authorExternalId?: string | null;
  authorProfileUrl?: string | null;
  authorAvatarUrl?: string | null;
  text?: string | null;
  likesCount?: number;
  repliesCount?: number;
  publishedAt?: Date | null;
  platformData?: Record<string, unknown>;
}

export type CommentAction = 'DELETE' | 'HIDE' | 'UNHIDE' | 'LIKE' | 'UNLIKE' | 'APPROVE' | 'REJECT';

// ───────────────────────────── analytics & history ─────────────────────────────

export interface PostMetrics {
  impressions?: number;
  impressionsUnique?: number;
  views?: number;
  viewsUnique?: number;
  likes?: number;
  dislikes?: number;
  comments?: number;
  shares?: number;
  saves?: number;
  raw?: unknown;
}

export interface AccountMetrics {
  impressions?: number;
  impressionsUnique?: number;
  views?: number;
  viewsUnique?: number;
  likes?: number;
  comments?: number;
  postCount?: number;
  followers?: number;
  following?: number;
  audience?: Record<string, unknown> | null;
  raw?: unknown;
}

export interface HistoryPost {
  externalId: string;
  title?: string | null;
  smallThumbnail?: string | null;
  thumbnail?: string | null;
  permalink?: string | null;
  subreddit?: string | null;
  publishedAt?: Date | null;
  type?: 'POST' | 'REEL' | 'STORY' | 'VIDEO' | 'IMAGE';
  extraData?: Record<string, unknown> | null;
  metrics?: PostMetrics | null;
}

export interface Page<T> {
  items: T[];
  nextCursor?: string | null;
}

// ───────────────────────────── validation ─────────────────────────────

export interface Issue {
  code: string;
  message: string;
  /** Path inside the request body, e.g. ['data', 'INSTAGRAM', 'text']. */
  path: (string | number)[];
}

export interface MediaRules {
  image?: { mimes: string[]; maxBytes: number; minWidth?: number; maxWidth?: number; aspect?: [number, number] };
  video?: { mimes: string[]; maxBytes: number; minSeconds?: number; maxSeconds: number; aspect?: [number, number] };
  document?: { mimes: string[]; maxBytes: number };
  maxItems: number;
}

export interface NetworkLimits {
  textMax: number | null;
  titleMax?: number | null;
  commentMax: number | null;
  media: MediaRules;
}

export interface Capabilities {
  connect: 'oauth2' | 'oauth1' | 'app-password' | 'bot';
  /** Whether the account must pick a channel (page/org/board/location/guild channel) before posting. */
  channels: 'none' | 'required' | 'optional';
  postTypes: string[];
  comments: boolean;
  firstComment: boolean;
  editPost: boolean;
  deletePost: boolean;
  editComment: boolean;
  deleteComment: boolean;
  commentImport: boolean;
  commentActions: CommentAction[];
  accountAnalytics: boolean;
  postAnalytics: boolean;
  historyImport: boolean;
  messaging: boolean;
  /** Writes billed per use (X). */
  metered: boolean;
}

// ───────────────────────────── the adapter ─────────────────────────────

export interface AuthorizeInput {
  state: string;
  codeVerifier: string;
  codeChallenge: string;
  serverUrl?: string | null;
  /** Adapter-specific state persisted across the round trip (e.g. Mastodon app client id). */
  extra?: Record<string, unknown>;
  forceLogin?: boolean;
  options?: Record<string, unknown>;
}

export interface ExchangeInput {
  code: string;
  state: string;
  codeVerifier: string;
  serverUrl?: string | null;
  extra?: Record<string, unknown>;
  /** The full callback query, for networks that send more than `code` (oauth_verifier, guild_id …). */
  query: Record<string, string>;
}

export interface NetworkAdapter {
  type: NetworkType;
  displayName: string;
  /** Env credential keys this adapter needs in live mode (NETWORK_<TYPE>_<KEY>). */
  credentialKeys: string[];
  capabilities: Capabilities;
  limits: NetworkLimits;
  /** Scopes requested at connect. */
  scopes: string[];
  /**
   * Real rejection cases this network returns, for the public error reference
   * (site: /<network>-api/errors). `code` is the network's own code or HTTP status.
   */
  errorReference?: { code: string; message: string; meaning: string; fix: string }[];

  // connect
  authorize(ctx: NetworkContext, input: AuthorizeInput): Promise<{ url: string; extra?: Record<string, unknown> }>;
  exchange(ctx: NetworkContext, input: ExchangeInput): Promise<ConnectedAccount>;
  refresh?(ctx: NetworkContext, account: AccountRuntime): Promise<TokenSet>;
  refreshProfile(ctx: NetworkContext, account: AccountRuntime): Promise<Partial<AccountProfile>>;
  listChannels?(ctx: NetworkContext, account: AccountRuntime): Promise<Channel[]>;
  /** Called when a channel is chosen. May swap the token (Facebook page token) or the externalId. */
  selectChannel?(ctx: NetworkContext, account: AccountRuntime, channel: Channel): Promise<{ externalId?: string; token?: TokenSet; profile?: Partial<AccountProfile> }>;
  /** true = still connected; false = the network says the grant is gone. */
  checkConnection(ctx: NetworkContext, account: AccountRuntime): Promise<boolean>;
  revoke?(ctx: NetworkContext, account: AccountRuntime): Promise<void>;

  // publishing
  /** Pure checks against this network's rules. Paths are relative to data.<TYPE>. */
  validate(data: Record<string, any>, media: Pick<MediaRef, 'type' | 'mime' | 'fileSize' | 'width' | 'height' | 'duration'>[]): Issue[];
  publish(ctx: NetworkContext, input: PublishInput): Promise<PublishResult>;
  poll?(ctx: NetworkContext, input: PublishInput, pendingRef: string): Promise<PublishResult>;
  /** Recent posts by the account, to reconcile a crash between the network call and our save. */
  recentPosts?(ctx: NetworkContext, account: AccountRuntime, since: Date): Promise<RecentPost[]>;
  deletePost?(ctx: NetworkContext, account: AccountRuntime, externalPostId: string): Promise<void>;
  editPost?(ctx: NetworkContext, account: AccountRuntime, externalPostId: string, data: Record<string, any>): Promise<void>;

  // comments
  comment?(ctx: NetworkContext, input: CommentInput): Promise<CommentResult>;
  editComment?(ctx: NetworkContext, account: AccountRuntime, externalCommentId: string, text: string): Promise<void>;
  deleteComment?(ctx: NetworkContext, account: AccountRuntime, externalCommentId: string): Promise<void>;
  importComments?(ctx: NetworkContext, account: AccountRuntime, input: { externalPostId: string; cursor?: string | null; limit: number }): Promise<Page<FetchedCommentInput>>;
  commentAction?(ctx: NetworkContext, account: AccountRuntime, comment: { externalId: string; externalPostId?: string | null }, action: CommentAction): Promise<void>;

  // analytics & history
  accountAnalytics?(ctx: NetworkContext, account: AccountRuntime): Promise<AccountMetrics>;
  postAnalytics?(ctx: NetworkContext, account: AccountRuntime, externalPostId: string, extra?: Record<string, unknown>): Promise<PostMetrics>;
  importHistory?(ctx: NetworkContext, account: AccountRuntime, input: { cursor?: string | null; limit: number }): Promise<Page<HistoryPost>>;

  /**
   * Network-specific operations behind /api/v1/misc/<network>/… — keyed by operationId
   * (e.g. 'misc.youtube.playlist.list'). `args` = { query, body } of the request.
   */
  misc?: Record<string, MiscHandler>;

  /** Google Business reviews / Facebook recommendations. */
  reviews?: ReviewsAdapter;

  /** Networks whose OAuth app is registered per server (Mastodon). Returns the client credentials. */
  prepareServer?(ctx: NetworkContext, serverUrl: string): Promise<{ clientId: string; clientSecret: string }>;

  /** Meta messaging (Instagram/Facebook) — conversations, sends, webhooks. */
  messaging?: MessagingAdapter;
}

export interface MiscArgs {
  query: Record<string, any>;
  body: Record<string, any>;
  params: Record<string, string>;
  /** Our ids → the network's ids. Throw NOT_FOUND (from the API) when missing. */
  lookup: {
    post(postId: string): Promise<{ externalPostId: string; externalAlternatePostId?: string | null; externalVideoId?: string | null; permalink?: string | null; data: Record<string, any> }>;
    comment(commentId: string): Promise<{ externalId: string; externalPostId?: string | null }>;
    upload(uploadId: string): Promise<MediaRef>;
  };
}
export type MiscHandler = (ctx: NetworkContext, account: AccountRuntime, args: MiscArgs) => Promise<unknown>;

export interface ReviewInput {
  externalId: string;
  reviewerName?: string | null;
  reviewerAvatarUrl?: string | null;
  rating?: number | null;
  recommendationType?: string | null;
  text?: string | null;
  replyText?: string | null;
  replyUpdatedAt?: Date | null;
  publishedAt?: Date | null;
  platformData?: Record<string, unknown>;
}

export interface ReviewsAdapter {
  list(ctx: NetworkContext, account: AccountRuntime, input: { cursor?: string | null; limit: number }): Promise<Page<ReviewInput>>;
  reply(ctx: NetworkContext, account: AccountRuntime, externalId: string, text: string): Promise<void>;
  deleteReply?(ctx: NetworkContext, account: AccountRuntime, externalId: string): Promise<void>;
  /** Facebook recommendation threads. */
  comments?(ctx: NetworkContext, account: AccountRuntime, externalId: string): Promise<FetchedCommentInput[]>;
  replyToComment?(ctx: NetworkContext, account: AccountRuntime, externalCommentId: string, text: string): Promise<{ externalId: string }>;
}

export interface InboundMessage {
  externalMessageId: string;
  externalParticipantId: string;
  participantUsername?: string | null;
  participantDisplayName?: string | null;
  participantAvatarUrl?: string | null;
  direction: 'INBOUND' | 'OUTBOUND';
  text?: string | null;
  attachments?: unknown[];
  sentAt: Date;
  isEcho?: boolean;
  replyToExternalId?: string | null;
  platformData?: Record<string, unknown>;
}

export interface MessagingAdapter {
  enable(ctx: NetworkContext, account: AccountRuntime): Promise<void>;
  disable(ctx: NetworkContext, account: AccountRuntime): Promise<void>;
  send(ctx: NetworkContext, account: AccountRuntime, input: { recipientId: string; text?: string | null; media?: MediaRef[]; quickReplies?: unknown[]; buttons?: unknown[]; replyToExternalId?: string | null }): Promise<{ externalMessageId: string }>;
  react(ctx: NetworkContext, account: AccountRuntime, input: { recipientId: string; externalMessageId: string; reaction: string; unreact: boolean }): Promise<void>;
  markSeen(ctx: NetworkContext, account: AccountRuntime, recipientId: string): Promise<void>;
  privateReply(ctx: NetworkContext, account: AccountRuntime, input: { commentExternalId: string; text: string }): Promise<{ externalMessageId: string; recipientId?: string | null }>;
  syncProviderSetting(ctx: NetworkContext, account: AccountRuntime, input: { type: string; config: unknown }): Promise<unknown>;
  /** Throws a NetworkError (with what to do) when the account is connected but messages cannot flow. */
  check?(ctx: NetworkContext, account: AccountRuntime): Promise<void>;
  /** The person on the other side of a conversation (webhooks carry only their id). Needs Business Asset User Profile Access. */
  participant?(ctx: NetworkContext, account: AccountRuntime, id: string): Promise<{ displayName?: string | null; username?: string | null; avatarUrl?: string | null }>;
  /** Parse one network webhook delivery into messages/comments for this account. */
  parseWebhook(body: unknown): { accountExternalId: string; messages: InboundMessage[]; comments: (FetchedCommentInput & { externalPostId: string })[] }[];
}
