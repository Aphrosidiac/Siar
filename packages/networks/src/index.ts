export * from './types.js';
export * from './lib/errors.js';
export * from './lib/http.js';
export * from './lib/oauth.js';
export * from './lib/validate.js';

import type { NetworkAdapter, NetworkType } from './types.js';
import { bluesky } from './adapters/bluesky.js';
import { discord } from './adapters/discord.js';
import { facebook } from './adapters/facebook.js';
import { googleBusiness } from './adapters/google-business.js';
import { instagram } from './adapters/instagram.js';
import { linkedin } from './adapters/linkedin.js';
import { mastodon } from './adapters/mastodon.js';
import { pinterest } from './adapters/pinterest.js';
import { reddit } from './adapters/reddit.js';
import { slack } from './adapters/slack.js';
import { snapchat } from './adapters/snapchat.js';
import { threads } from './adapters/threads.js';
import { tiktok } from './adapters/tiktok.js';
import { twitter } from './adapters/twitter.js';
import { youtube } from './adapters/youtube.js';

export const ADAPTERS: Record<NetworkType, NetworkAdapter> = {
  TIKTOK: tiktok,
  YOUTUBE: youtube,
  INSTAGRAM: instagram,
  FACEBOOK: facebook,
  TWITTER: twitter,
  THREADS: threads,
  LINKEDIN: linkedin,
  PINTEREST: pinterest,
  REDDIT: reddit,
  MASTODON: mastodon,
  DISCORD: discord,
  SLACK: slack,
  BLUESKY: bluesky,
  GOOGLE_BUSINESS: googleBusiness,
  SNAPCHAT: snapchat,
};

export const adapterFor = (type: NetworkType) => ADAPTERS[type];
