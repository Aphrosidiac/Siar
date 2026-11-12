/**
 * Where a visit or a signup came from, as one channel name, plus the first-visit cookie the site sets
 * (apps/site/src/layouts/Base.astro → `siar_ft`, domain=siaran.my, 180 days). Channel rules:
 * UTM source wins when present; otherwise the referrer host decides; no referrer = Direct.
 */
import type { FastifyRequest } from 'fastify';

export type Channel = 'Google' | 'Bing' | 'AI assistant' | 'Other search' | 'Social' | 'Referral' | 'Campaign' | 'Direct' | 'Internal';

const AI = /(^|\.)(chatgpt\.com|chat\.openai\.com|perplexity\.ai|claude\.ai|gemini\.google\.com|copilot\.microsoft\.com|bard\.google\.com|you\.com|phind\.com|poe\.com|deepseek\.com|chat\.mistral\.ai|meta\.ai|grok\.com|kagi\.com)$/i;
const GOOGLE = /(^|\.)google\.[a-z.]+$/i;
const BING = /(^|\.)(bing\.com|cn\.bing\.com)$/i;
const SEARCH = /(^|\.)(duckduckgo\.com|search\.yahoo\.com|yandex\.[a-z]+|baidu\.com|ecosia\.org|search\.brave\.com|startpage\.com|qwant\.com|naver\.com|seznam\.cz)$/i;
const SOCIAL = /(^|\.)(facebook\.com|fb\.com|l\.facebook\.com|lm\.facebook\.com|instagram\.com|l\.instagram\.com|threads\.net|threads\.com|x\.com|twitter\.com|t\.co|linkedin\.com|lnkd\.in|reddit\.com|old\.reddit\.com|youtube\.com|tiktok\.com|pinterest\.[a-z]+|bsky\.app|mastodon\.social|discord\.com|slack\.com|t\.me|telegram\.org|wa\.me|whatsapp\.com|news\.ycombinator\.com|producthunt\.com)$/i;
const OWN = /(^|\.)siaran\.my$/i;

export function channelOf(refHost?: string | null, utmSource?: string | null): Channel {
  const u = (utmSource ?? '').trim().toLowerCase();
  if (u) {
    if (/google/.test(u)) return u.includes('ads') || u.includes('cpc') ? 'Campaign' : 'Google';
    if (/bing/.test(u)) return 'Bing';
    if (/chatgpt|openai|perplexity|claude|copilot|gemini/.test(u)) return 'AI assistant';
    if (/facebook|fb|instagram|ig|threads|twitter|x\.com|linkedin|reddit|tiktok|youtube|bluesky|mastodon/.test(u)) return 'Social';
    return 'Campaign';
  }
  const h = (refHost ?? '').trim().toLowerCase().replace(/^www\./, '');
  if (!h) return 'Direct';
  if (OWN.test(h)) return 'Internal';
  if (GOOGLE.test(h)) return 'Google';
  if (BING.test(h)) return 'Bing';
  if (AI.test(h)) return 'AI assistant';
  if (SEARCH.test(h)) return 'Other search';
  if (SOCIAL.test(h)) return 'Social';
  return 'Referral';
}

export interface FirstTouch { refHost: string | null; utmSource: string | null; utmMedium: string | null; utmCampaign: string | null; landing: string | null; firstSeenAt: Date | null }

const clip = (v: unknown, n: number) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, n) : null);

/** The first-visit cookie, if the person came through the site. Never trusted for anything but reporting. */
export function firstTouch(req: FastifyRequest): FirstTouch | null {
  const raw = req.cookies?.siar_ft;
  if (!raw) return null;
  try {
    const j = JSON.parse(decodeURIComponent(raw));
    const t = Number(j.t);
    return {
      refHost: clip(j.r, 120), utmSource: clip(j.s, 80), utmMedium: clip(j.m, 80), utmCampaign: clip(j.c, 120),
      landing: clip(j.p, 200), firstSeenAt: Number.isFinite(t) && t > 1.7e12 && t < Date.now() + 864e5 ? new Date(t) : null,
    };
  } catch { return null; }
}

/** User columns for a new signup (empty object when the cookie is absent: the channel stays null = unknown). */
export function signupFields(req: FastifyRequest) {
  const ft = firstTouch(req);
  if (!ft) return {};
  return {
    signupChannel: channelOf(ft.refHost, ft.utmSource), signupRefHost: ft.refHost, signupUtmSource: ft.utmSource,
    signupUtmMedium: ft.utmMedium, signupUtmCampaign: ft.utmCampaign, signupLanding: ft.landing, firstSeenAt: ft.firstSeenAt,
  };
}
