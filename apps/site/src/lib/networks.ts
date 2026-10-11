import { ADAPTERS, NETWORK_TYPES } from '../../../../packages/networks/src/index.ts';
import type { NetworkAdapter, NetworkType } from '../../../../packages/networks/src/index.ts';
import { dailyPostCaps, dailyCommentCaps, COMMENT_LENGTH } from './plans';
import { postDataSchema, operations } from './openapi';

export type { NetworkType };

interface Meta {
  slug: string;
  apiSlug: string;
  name: string;
  short: string;
  /** Our own one-paragraph description of the network, written for this site. */
  about: string;
  /** What the account has to be (business, creator, page...). */
  account: string;
  /** Path segment used by network-specific operations under /misc. */
  misc?: string;
  approval?: string;
}

export const META: Record<NetworkType, Meta> = {
  TIKTOK: { slug: 'tiktok', apiSlug: 'tiktok-api', name: 'TikTok', short: 'TT', misc: 'tiktok', account: 'Any TikTok account. Creator details and privacy options are read from TikTok before every post.', about: 'Short vertical video and photo posts. TikTok decides which privacy levels and interaction settings each creator may use, so Siar reads them from the account and validates your request against them.', approval: '/blog/tiktok-content-posting-api-audit' },
  YOUTUBE: { slug: 'youtube', apiSlug: 'youtube-api', name: 'YouTube', short: 'YT', misc: 'youtube', account: 'A Google account with a YouTube channel. Brand-account channels are picked after sign-in.', about: 'Long-form videos and Shorts on a YouTube channel, with title, description, privacy, audience and disclosure settings sent through the YouTube Data API.', approval: '/blog/youtube-api-quota-and-compliance-audit' },
  INSTAGRAM: { slug: 'instagram', apiSlug: 'instagram-api', name: 'Instagram', short: 'IG', misc: 'instagram', account: 'An Instagram professional account (business or creator), connected through Facebook Login or Instagram Login.', about: 'Feed posts, carousels, reels and stories for Instagram professional accounts, connected either through a linked Facebook Page or directly with Instagram Login.', approval: '/blog/meta-app-review-for-instagram-and-facebook' },
  FACEBOOK: { slug: 'facebook', apiSlug: 'facebook-api', name: 'Facebook', short: 'FB', misc: 'facebook', account: 'A Facebook Page you manage. Personal profiles cannot be published to through the API.', about: 'Posts, reels and stories on Facebook Pages, including link posts and Page recommendations.', approval: '/blog/meta-app-review-for-instagram-and-facebook' },
  TWITTER: { slug: 'x', apiSlug: 'x-api', name: 'X (Twitter)', short: 'X', misc: 'twitter', account: 'Any X account. X charges for API usage, so X actions draw from a prepaid credit balance.', about: 'Posts, threads, polls, quotes and replies on X. Because X bills API usage per call, Siar passes those charges through at cost from a prepaid credit balance.' },
  THREADS: { slug: 'threads', apiSlug: 'threads-api', name: 'Threads', short: 'TH', account: 'A Threads profile.', about: 'Text, image, video and carousel posts on Threads, with reply controls, topic tags, link attachments and polls.' },
  LINKEDIN: { slug: 'linkedin', apiSlug: 'linkedin-api', name: 'LinkedIn', short: 'IN', misc: 'linkedin', account: 'A LinkedIn member profile, or a company page the member administers.', about: 'Posts to a LinkedIn member profile or a company page, with text, images, video, documents and links.' },
  PINTEREST: { slug: 'pinterest', apiSlug: 'pinterest-api', name: 'Pinterest', short: 'PI', misc: 'pinterest', account: 'A Pinterest account. Pins are created on a board you name in the request.', about: 'Image and video Pins on a board of your choosing, with title, description, destination link and alt text.' },
  REDDIT: { slug: 'reddit', apiSlug: 'reddit-api', name: 'Reddit', short: 'RD', misc: 'reddit', account: 'A Reddit user account. Each post names its subreddit; subreddit rules and flairs still apply.', about: 'Text, link and media submissions to the subreddit named in each request, including flair selection and NSFW marking.' },
  MASTODON: { slug: 'mastodon', apiSlug: 'mastodon-api', name: 'Mastodon', short: 'MA', misc: 'mastodon', account: 'An account on any Mastodon server. Pass the server URL when connecting.', about: 'Statuses on any Mastodon server, with visibility, content warnings and media. Siar registers its app on each server the first time someone connects from it.' },
  DISCORD: { slug: 'discord', apiSlug: 'discord-api', name: 'Discord', short: 'DC', misc: 'discord', account: 'A Discord server where the Siar bot is added. Each post names the channel.', about: 'Messages to channels in Discord servers, sent by a bot whose display name and avatar you can set per team.' },
  SLACK: { slug: 'slack', apiSlug: 'slack-api', name: 'Slack', short: 'SL', misc: 'slack', account: 'A Slack workspace where the Siar app is installed. Each post names the channel.', about: 'Messages to Slack channels, with files and an optional custom bot name and icon.' },
  BLUESKY: { slug: 'bluesky', apiSlug: 'bluesky-api', name: 'Bluesky', short: 'BS', misc: 'bluesky', account: 'A Bluesky account.', about: 'Posts on Bluesky with images, video, link cards, quotes, tags and self-labels.' },
  GOOGLE_BUSINESS: { slug: 'google-business-profile', apiSlug: 'google-business-profile-api', name: 'Google Business Profile', short: 'GB', misc: 'google-business', account: 'A Google account that manages one or more Business Profile locations. Pick the location after sign-in.', about: 'Updates, offers, events and alerts on a Google Business Profile location, plus reviews, hours, attributes, media and menus through location-level operations.' },
  SNAPCHAT: { slug: 'snapchat', apiSlug: 'snapchat-api', name: 'Snapchat', short: 'SC', account: 'A Snapchat public profile.', about: 'Stories, Spotlight and saved stories on a Snapchat public profile.' },
};

export interface NetworkInfo extends Meta {
  type: NetworkType;
  adapter: NetworkAdapter;
  ready: boolean;
  postTypes: string[];
  capabilityList: { label: string; value: boolean }[];
  fields: any;
  dailyPosts: [number, number, number];
  dailyComments: [number, number, number];
  commentLength: number | null;
  miscOps: ReturnType<typeof operations>;
  errors: NonNullable<NetworkAdapter['errorReference']>;
}

const CAP_LABELS: [keyof NetworkAdapter['capabilities'], string][] = [
  ['comments', 'Comments and replies'],
  ['firstComment', 'First comment'],
  ['editPost', 'Edit a published post'],
  ['deletePost', 'Delete a published post'],
  ['editComment', 'Edit a comment'],
  ['deleteComment', 'Delete a comment'],
  ['commentImport', 'Import comments'],
  ['postAnalytics', 'Post analytics'],
  ['accountAnalytics', 'Account analytics'],
  ['historyImport', 'Post history import'],
  ['messaging', 'Direct messages'],
];

export const CONNECT_LABEL: Record<string, string> = {
  oauth2: 'OAuth 2.0 in the browser',
  oauth1: 'OAuth 1.0a in the browser',
  'app-password': 'Handle and app password',
  bot: 'Bot install into a server or workspace',
};

export function network(type: NetworkType): NetworkInfo {
  const adapter = ADAPTERS[type];
  const meta = META[type];
  const schema = postDataSchema(type);
  const enumTypes: string[] = schema?.properties?.type?.enum ?? [];
  const caps = adapter.capabilities;
  const ready = caps.postTypes.length > 0 || adapter.scopes.length > 0;
  const posts = [dailyPostCaps('FREE')[type], dailyPostCaps('PRO')[type], dailyPostCaps('BUSINESS')[type]] as [number, number, number];
  const comments = [dailyCommentCaps('FREE')[type], dailyCommentCaps('PRO')[type], dailyCommentCaps('BUSINESS')[type]] as [number, number, number];
  return {
    ...meta,
    type,
    adapter,
    ready,
    postTypes: caps.postTypes.length ? caps.postTypes : enumTypes.length ? enumTypes : ['POST'],
    capabilityList: CAP_LABELS.map(([k, label]) => ({ label, value: Boolean(caps[k]) })),
    fields: schema,
    dailyPosts: posts,
    dailyComments: comments,
    commentLength: COMMENT_LENGTH[type] ?? null,
    miscOps: meta.misc ? operations().filter((o) => o.tag === 'misc' && o.path.startsWith(`/api/v1/misc/${meta.misc}/`)) : [],
    errors: adapter.errorReference ?? [],
  };
}

export const NETWORKS: NetworkInfo[] = NETWORK_TYPES.map(network);
export const NETWORK_COUNT = NETWORKS.length;
export const bySlug = (slug: string) => NETWORKS.find((n) => n.slug === slug || n.apiSlug === slug);

export const mb = (bytes: number) => {
  const m = bytes / 1024 / 1024;
  return m >= 1024 ? `${+(m / 1024).toFixed(1)} GB` : `${+m.toFixed(1)} MB`;
};
export const seconds = (s: number) => (s >= 3600 ? `${+(s / 3600).toFixed(1)} h` : s >= 60 ? `${+(s / 60).toFixed(1)} min` : `${s} s`);
