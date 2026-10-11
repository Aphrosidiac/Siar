import type { NetworkType, SocialAccount } from './types';

export interface NetworkMeta {
  type: NetworkType;
  name: string;
  /** Monogram shown in the icon tile. */
  mark: string;
  color: string;
  /** Text colour on the tile. */
  ink: string;
  /** Live counter limits (the API's validation is authoritative; these mirror the network's documented caps). */
  textMax: number | null;
  textLabel: string;
  descriptionMax?: number;
  /** Which account selection publishing needs (social-account/set-channel). */
  channel: 'none' | 'required' | 'optional';
  channelNoun: string;
  /** How the account is connected. */
  connect: 'oauth' | 'server' | 'bot';
  media: 'required' | 'optional' | 'none';
  /** Supports post history import / comment import / analytics in the contract enums. */
  history: boolean;
  analytics: boolean;
  blurb: string;
}

const n = (m: NetworkMeta) => m;

export const NETWORKS: NetworkMeta[] = [
  n({ type: 'TIKTOK', name: 'TikTok', mark: 'Tk', color: '#111111', ink: '#ffffff', textMax: 2200, textLabel: 'Caption', channel: 'none', channelNoun: '', connect: 'oauth', media: 'required', history: true, analytics: true, blurb: 'Videos and photo posts' }),
  n({ type: 'YOUTUBE', name: 'YouTube', mark: 'Yt', color: '#ff0000', ink: '#ffffff', textMax: 100, textLabel: 'Title', descriptionMax: 5000, channel: 'optional', channelNoun: 'channel', connect: 'oauth', media: 'required', history: true, analytics: true, blurb: 'Videos and Shorts' }),
  n({ type: 'INSTAGRAM', name: 'Instagram', mark: 'Ig', color: '#d62976', ink: '#ffffff', textMax: 2200, textLabel: 'Caption', channel: 'optional', channelNoun: 'account', connect: 'oauth', media: 'required', history: true, analytics: true, blurb: 'Posts, carousels, Reels, Stories' }),
  n({ type: 'FACEBOOK', name: 'Facebook', mark: 'f', color: '#1877f2', ink: '#ffffff', textMax: 63206, textLabel: 'Text', channel: 'required', channelNoun: 'page', connect: 'oauth', media: 'optional', history: true, analytics: true, blurb: 'Page posts, Reels, Stories' }),
  n({ type: 'TWITTER', name: 'X', mark: 'X', color: '#111111', ink: '#ffffff', textMax: 280, textLabel: 'Text', channel: 'none', channelNoun: '', connect: 'oauth', media: 'optional', history: true, analytics: true, blurb: 'Posts and threads, pay per use' }),
  n({ type: 'THREADS', name: 'Threads', mark: '@', color: '#111111', ink: '#ffffff', textMax: 500, textLabel: 'Text', channel: 'none', channelNoun: '', connect: 'oauth', media: 'optional', history: true, analytics: true, blurb: 'Text, image and video posts' }),
  n({ type: 'LINKEDIN', name: 'LinkedIn', mark: 'in', color: '#0a66c2', ink: '#ffffff', textMax: 3000, textLabel: 'Text', channel: 'optional', channelNoun: 'organization', connect: 'oauth', media: 'optional', history: true, analytics: true, blurb: 'Profile and company pages' }),
  n({ type: 'PINTEREST', name: 'Pinterest', mark: 'P', color: '#e60023', ink: '#ffffff', textMax: 100, textLabel: 'Title', descriptionMax: 500, channel: 'none', channelNoun: 'board', connect: 'oauth', media: 'required', history: true, analytics: true, blurb: 'Pins to your boards' }),
  n({ type: 'REDDIT', name: 'Reddit', mark: 'r/', color: '#ff4500', ink: '#ffffff', textMax: 300, textLabel: 'Title', descriptionMax: 40000, channel: 'none', channelNoun: '', connect: 'oauth', media: 'optional', history: true, analytics: true, blurb: 'Posts to subreddits' }),
  n({ type: 'MASTODON', name: 'Mastodon', mark: 'M', color: '#6364ff', ink: '#ffffff', textMax: 500, textLabel: 'Text', channel: 'none', channelNoun: '', connect: 'server', media: 'optional', history: true, analytics: true, blurb: 'Any Mastodon server' }),
  n({ type: 'DISCORD', name: 'Discord', mark: 'D', color: '#5865f2', ink: '#ffffff', textMax: 2000, textLabel: 'Message', channel: 'optional', channelNoun: 'channel', connect: 'bot', media: 'optional', history: false, analytics: false, blurb: 'Messages to server channels' }),
  n({ type: 'SLACK', name: 'Slack', mark: 'S', color: '#4a154b', ink: '#ffffff', textMax: 40000, textLabel: 'Message', channel: 'optional', channelNoun: 'channel', connect: 'bot', media: 'optional', history: false, analytics: false, blurb: 'Messages to workspace channels' }),
  n({ type: 'BLUESKY', name: 'Bluesky', mark: 'B', color: '#1185fe', ink: '#ffffff', textMax: 300, textLabel: 'Text', channel: 'none', channelNoun: '', connect: 'server', media: 'optional', history: true, analytics: true, blurb: 'Posts with an app password' }),
  n({ type: 'GOOGLE_BUSINESS', name: 'Google Business', mark: 'G', color: '#4285f4', ink: '#ffffff', textMax: 1500, textLabel: 'Text', channel: 'required', channelNoun: 'location', connect: 'oauth', media: 'optional', history: false, analytics: true, blurb: 'Updates, offers and events' }),
  n({ type: 'SNAPCHAT', name: 'Snapchat', mark: 'Sc', color: '#fffc00', ink: '#111111', textMax: 160, textLabel: 'Caption', channel: 'none', channelNoun: '', connect: 'oauth', media: 'required', history: false, analytics: true, blurb: 'Stories and Spotlight' }),
];

export const NETWORK_TYPES = NETWORKS.map((x) => x.type);
export const META: Record<NetworkType, NetworkMeta> = Object.fromEntries(NETWORKS.map((x) => [x.type, x])) as Record<NetworkType, NetworkMeta>;
export const networkName = (t: string) => META[t as NetworkType]?.name ?? t;

/** X Premium accounts get 25,000 characters. */
export function textLimit(t: NetworkType, account?: SocialAccount | null) {
  if (t === 'TWITTER' && account?.twitterSubType && account.twitterSubType !== 'none') return 25000;
  return META[t].textMax;
}

/** Characters as the networks count them (code points; Bluesky counts graphemes, close enough here). */
export function countChars(s: string | null | undefined) {
  if (!s) return 0;
  const seg = (Intl as any).Segmenter ? new (Intl as any).Segmenter(undefined, { granularity: 'grapheme' }) : null;
  if (seg) { let c = 0; for (const _ of seg.segment(s)) c++; return c; }
  return [...s].length;
}

/** The account still needs a channel before it can publish. */
export const needsChannel = (a: SocialAccount) => META[a.type]?.channel === 'required' && !a.channelId;

export const HISTORY_TYPES: NetworkType[] = ['FACEBOOK', 'INSTAGRAM', 'THREADS', 'TIKTOK', 'YOUTUBE', 'LINKEDIN', 'PINTEREST', 'REDDIT', 'MASTODON', 'BLUESKY', 'TWITTER'];
export const COMMENT_IMPORT_TYPES: NetworkType[] = ['FACEBOOK', 'INSTAGRAM', 'LINKEDIN', 'YOUTUBE', 'TIKTOK', 'REDDIT', 'THREADS', 'MASTODON', 'BLUESKY', 'TWITTER'];
export const ANALYTICS_TYPES: NetworkType[] = ['TIKTOK', 'YOUTUBE', 'INSTAGRAM', 'FACEBOOK', 'THREADS', 'REDDIT', 'PINTEREST', 'MASTODON', 'LINKEDIN', 'BLUESKY', 'GOOGLE_BUSINESS', 'SNAPCHAT', 'TWITTER'];
export const SET_CHANNEL_TYPES: NetworkType[] = ['FACEBOOK', 'INSTAGRAM', 'LINKEDIN', 'YOUTUBE', 'GOOGLE_BUSINESS'];
