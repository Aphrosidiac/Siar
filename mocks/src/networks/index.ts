import type { MockRegistry } from '../registry.js';
import mastodon from './mastodon.js';
import tiktok from './tiktok.js';
import youtube from './youtube.js';
import instagram from './instagram.js';
import facebook from './facebook.js';
import twitter from './twitter.js';
import threads from './threads.js';
import linkedin from './linkedin.js';
import pinterest from './pinterest.js';
import reddit from './reddit.js';
import discord from './discord.js';
import slack from './slack.js';
import bluesky from './bluesky.js';
import googleBusiness from './google-business.js';
import snapchat from './snapchat.js';

/**
 * Register every network mock. Order matters only for the catch-all host '*' (Mastodon, whose
 * servers can be any host) — it goes last so specific hosts win.
 */
export function registerAll(m: MockRegistry) {
  for (const r of [tiktok, youtube, instagram, facebook, twitter, threads, linkedin, pinterest, reddit, discord, slack, bluesky, googleBusiness, snapchat]) r(m);
  mastodon(m);
}
