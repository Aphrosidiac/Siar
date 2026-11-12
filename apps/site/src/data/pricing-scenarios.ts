/**
 * The dated pricing scenarios used by /guides/social-media-api-pricing, and the Malaysian tool table used by
 * /malaysia and /for-agencies.
 *
 * Shared rival facts (billing unit, pricing URL, compare page, Duta and Zoho cells) come from ./rivals.ts, the one
 * rival data file (strike-plan.md §5.0 rule 3). This file adds only what the scenarios need: each vendor's price
 * worked out from the formula on that same pricing page, and the Malaysian tools rivals.ts does not carry
 * (MarketOS, PostLa, Synova; sources in docs/seo/research/competitors/my-sea-schedulers.md).
 * Siar cells are generated from the plan table, never typed.
 */
import { PLANS, money } from '../lib/plans';
import type { Tier } from '../lib/plans';
import { RIVALS, CHECKED, humanDate, type RivalKey } from './rivals';

export const RIVALS_CHECKED = CHECKED;
export const RIVALS_CHECKED_HUMAN = humanDate(CHECKED);

export type VendorId = 'ayrshare' | 'zernio' | 'uploadpost' | 'outstand' | 'postforme' | 'postproxy' | 'socialapi' | 'woopsocial' | 'postwire';

export interface Vendor {
  id: VendorId;
  name: string;
  /** The billing unit, as rivals.ts prints it. */
  unit: string;
  model: 'profile' | 'account' | 'delivery' | 'organization';
  /** The vendor's pricing page (the source of every number below). */
  url: string;
  /** Our compare page, when one exists. */
  page?: string;
}

const KEY: Record<VendorId, RivalKey> = {
  ayrshare: 'ayrshare', zernio: 'zernio', uploadpost: 'uploadPost', outstand: 'outstand', postforme: 'postForMe',
  postproxy: 'postproxy', socialapi: 'socialApi', woopsocial: 'woop', postwire: 'postwire',
};
const MODEL: Record<VendorId, Vendor['model']> = {
  ayrshare: 'profile', uploadpost: 'profile', postproxy: 'profile', zernio: 'account', woopsocial: 'account',
  outstand: 'delivery', postforme: 'delivery', postwire: 'organization', socialapi: 'organization',
};

export const VENDORS = Object.fromEntries(
  (Object.keys(KEY) as VendorId[]).map((id) => {
    const r = RIVALS[KEY[id]] as (typeof RIVALS)[RivalKey] & { page?: string };
    const unit = r.cells.unit!;
    return [id, { id, name: r.name, unit: unit.value, model: MODEL[id], url: unit.url, page: r.page }];
  }),
) as Record<VendorId, Vendor>;

export interface Cell {
  vendor: VendorId;
  /** Monthly USD list price, or null when the listed plans do not cover the scenario. */
  usd: number | null;
  /** Upper end when the vendor's page leaves the unit open (a range). */
  usdMax?: number;
  /** Shown instead of the number when the price is a range or not listed. */
  label?: string;
  /** How the number was reached, from the vendor's own price list. */
  how: string;
}

export interface Scenario {
  id: string;
  brands: number;
  accounts: number;
  posts: number;
  title: string;
  siarTier: Tier;
  cells: Cell[];
}

/** Each scenario: every brand connects 4 accounts on 4 different networks, and every post goes to all 4. */
export const ACCOUNTS_PER_BRAND = 4;

export const SCENARIOS: Scenario[] = [
  {
    id: 'brands-500', brands: 500, accounts: 2_000, posts: 20_000, title: 'A SaaS product with 500 customer brands', siarTier: 'BUSINESS',
    cells: [
      { vendor: 'postforme', usd: 150, usdMax: 500, label: '$150 to $500', how: '$150 for 20,000 successful posts; $500 for 100,000 if each account counts. The page does not say which.' },
      { vendor: 'outstand', usd: 279, how: 'Business $129 for 50,000 deliveries, plus 30,000 at $0.005. 80,000 deliveries in all.' },
      { vendor: 'uploadpost', usd: 713, how: 'Business $438 for 225 profiles, plus 275 profiles at $1.' },
      { vendor: 'postproxy', usd: 734, how: 'Business $49 for 20 groups, then its progressive tiers up to 500 groups.' },
      { vendor: 'woopsocial', usd: 799, how: 'Max $799 for up to 2,500 accounts.' },
      { vendor: 'zernio', usd: 2_218, how: '2 accounts free, 8 at $6, 90 at $3, 1,900 at $1. Its own example: 1,000 accounts = $1,218.' },
      { vendor: 'ayrshare', usd: 2_624, how: 'Business $599 for 30 profiles, 70 at $8.99, 400 at $3.49. Its own example: 100 profiles = $1,228.' },
      { vendor: 'postwire', usd: null, label: 'Not on its listed plans', how: 'Scale $299 stops at 200 clients.' },
      { vendor: 'socialapi', usd: null, label: 'Custom', how: 'Empire $349 stops at 200 brands; above that is Enterprise.' },
    ],
  },
  {
    id: 'brands-50', brands: 50, accounts: 200, posts: 2_000, title: 'An agency or product with 50 brands', siarTier: 'BUSINESS',
    cells: [
      { vendor: 'postforme', usd: 25, usdMax: 75, label: '$25 to $75', how: '$25 for 2,500 successful posts; $75 for 10,000 if each account counts.' },
      { vendor: 'outstand', usd: 54, how: '$19 for 3,000 deliveries, plus 5,000 at $0.007. 8,000 deliveries in all.' },
      { vendor: 'woopsocial', usd: 98, how: 'Business $49 for 100 accounts, stacked twice.' },
      { vendor: 'postwire', usd: 99, how: 'Agency $99 for 50 clients.' },
      { vendor: 'uploadpost', usd: 105, how: 'Professional $50 for 25 profiles, plus a 25-profile pack at $55.' },
      { vendor: 'socialapi', usd: 109, how: 'Full Send $109 for 50 brands.' },
      { vendor: 'postproxy', usd: 109, how: 'Business $49 for 20 groups, plus 30 at $2.' },
      { vendor: 'zernio', usd: 418, how: '2 accounts free, 8 at $6, 90 at $3, 100 at $1.' },
      { vendor: 'ayrshare', usd: 779, how: 'Business $599 for 30 profiles, plus 20 at $8.99.' },
    ],
  },
  {
    id: 'brands-10', brands: 10, accounts: 40, posts: 1_000, title: 'A freelancer or small agency with 10 clients', siarTier: 'PRO',
    cells: [
      { vendor: 'postforme', usd: 10, usdMax: 50, label: '$10 to $50', how: '$10 for 1,000 successful posts; $50 for 5,000 if each account counts.' },
      { vendor: 'outstand', usd: 26, how: '$19 for 3,000 deliveries, plus 1,000 at $0.007. 4,000 deliveries in all.' },
      { vendor: 'postwire', usd: 29, how: 'Pro $29 for 10 brands.' },
      { vendor: 'socialapi', usd: 29, how: 'Side Hustle $29 for 10 brands.' },
      { vendor: 'woopsocial', usd: 38, how: 'Pro $19 for 20 accounts, stacked twice.' },
      { vendor: 'uploadpost', usd: 39, how: 'Basic $24 for 5 profiles, plus a 5-profile pack at $15.' },
      { vendor: 'postproxy', usd: 49, how: 'Business $49 for 20 groups.' },
      { vendor: 'zernio', usd: 138, how: '2 accounts free, 8 at $6, 30 at $3.' },
      { vendor: 'ayrshare', usd: 299, how: 'Launch $299 for up to 10 profiles.' },
    ],
  },
  {
    id: 'brands-1', brands: 1, accounts: 4, posts: 300, title: 'One business on its own accounts', siarTier: 'STARTER',
    cells: [
      { vendor: 'postforme', usd: 10, usdMax: 25, label: '$10 to $25', how: '$10 for 1,000 successful posts; $25 for 2,500 if each account counts.' },
      { vendor: 'zernio', usd: 12, how: '2 accounts free, 2 at $6.' },
      { vendor: 'postproxy', usd: 17, how: 'Agentic $17 for 5 profiles.' },
      { vendor: 'outstand', usd: 19, how: '$19 for up to 3,000 deliveries. 1,200 here.' },
      { vendor: 'postwire', usd: 19, how: 'Starter $19 for 3 brands and 1,000 posts.' },
      { vendor: 'woopsocial', usd: 19, how: 'Pro $19 for 20 accounts (Free covers 2).' },
      { vendor: 'uploadpost', usd: 24, how: 'Basic $24 for 5 profiles.' },
      { vendor: 'socialapi', usd: 29, how: 'Side Hustle $29 (Hobby allows 10 posts a month).' },
      { vendor: 'ayrshare', usd: 149, how: 'Premium $149 for 1 profile.' },
    ],
  },
];

/** Siar's price for a scenario, from the plan table. */
export const siarCell = (s: Scenario) => ({
  price: money(s.siarTier, 'MONTHLY', 'usd'),
  myr: money(s.siarTier, 'MONTHLY', 'myr'),
  usd: Number(money(s.siarTier, 'MONTHLY', 'usd').replace(/[^0-9.]/g, '')),
  plan: PLANS[s.siarTier].name,
  posts: PLANS[s.siarTier].posts,
  brands: PLANS[s.siarTier].teams,
});

/** "$1,228" style. */
export const usd = (n: number) => `$${n.toLocaleString('en-US')}`;
export const cellLabel = (c: Cell) => c.label ?? (c.usd === null ? 'Not listed' : usd(c.usd));

/** Where a rival stands against Siar's price in the same scenario. */
export const against = (c: Cell, siarUsd: number) => {
  if (c.usd === null) return '';
  const lo = c.usd, hi = c.usdMax ?? c.usd;
  if (hi < siarUsd) return 'Cheaper than Siar';
  if (lo >= siarUsd && lo - siarUsd <= 1) return hi === lo ? 'About the same as Siar' : 'About the same as Siar, or more';
  if (lo > siarUsd) return 'Costs more than Siar';
  if (lo === siarUsd && hi === siarUsd) return 'Same as Siar';
  return 'Either side of Siar';
};

/** Rival facts quoted in prose on the pricing guide. */
export const FACTS = {
  outstandFailed: { text: '"pending, published, and failed deliveries all count. Retries do not double-count."', url: 'https://www.outstand.so/pricing.md' },
  ayrshareUnlimited: { text: 'Ayrshare says every plan includes "unlimited posts", within API and platform limits.', url: 'https://www.ayrshare.com/pricing/' },
  xPricing: { url: 'https://docs.x.com/x-api/getting-started/pricing' },
} as const;

/* ------------------------------------------------------------------------------------------------
 * Malaysia: the ringgit-priced tools, alphabetical, for /malaysia. Duta and Zoho Social come from rivals.ts;
 * MarketOS, PostLa and Synova from my-sea-schedulers.md (checked 2026-11-12). Never "first" or "only".
 * ---------------------------------------------------------------------------------------------- */

export interface Src { value: string; url: string }
export type MyField = 'who' | 'entry' | 'unit' | 'tenClients' | 'networks' | 'api' | 'pay';
export interface MyTool { name: string; home: string; cells: Record<MyField, Src | null> }

const NOT_CHECKED = null;
const s_ = (value: string, url: string): Src => ({ value, url });
const D = RIVALS.duta, Z = RIVALS.zoho;

const MARKETOS = 'https://mymarketos.com/en/pricing';
const POSTLA = 'https://postla-page.pages.dev/pricing.html';
const SYNOVA = 'https://zynex-ai-v2.pages.dev/synova.html';

export const MY_TOOLS: MyTool[] = [
  {
    name: D.name, home: D.home,
    cells: {
      who: s_('Baloot MY Digital Agency, Kota Bharu, Kelantan', 'https://getduta.com/terms'),
      entry: D.cells.entry!, unit: D.cells.unit!, tenClients: D.cells.scenario!, networks: D.cells.networks!,
      api: D.facts.api!, pay: D.facts.fpx!,
    },
  },
  {
    name: 'MarketOS', home: 'https://mymarketos.com/en',
    cells: {
      who: s_('MarketOS, Kuala Lumpur; no company number on the pages read', 'https://mymarketos.com/en/about'),
      entry: s_('Starter RM199 a month: 3 channels, 30 posts; 7-day trial', MARKETOS),
      unit: s_('Capped by channels, posts and workspaces', MARKETOS),
      tenClients: s_('Pro RM1,499 a month covers 5 workspaces', MARKETOS),
      networks: s_('Facebook, Instagram, TikTok, WhatsApp Business, Shopee and Lazada', 'https://mymarketos.com/faq'),
      api: s_('API access listed from Growth (RM599 a month)', MARKETOS),
      pay: s_('FPX, in ringgit', MARKETOS),
    },
  },
  {
    name: 'PostLa', home: 'https://postla-page.pages.dev/',
    cells: {
      who: s_('PostLa, Kuala Lumpur; no company named on the pages read', 'https://postla-page.pages.dev/contact.html'),
      entry: s_('Starter RM97 a month: 3 accounts, 30 posts; 14-day trial, no card', POSTLA),
      unit: s_('Per social account', POSTLA),
      tenClients: s_('Professional RM197 a month covers 10 accounts', POSTLA),
      networks: s_('TikTok, Instagram, Facebook, LinkedIn, X and YouTube named', 'https://postla-page.pages.dev/'),
      api: s_('None published', 'https://postla-page.pages.dev/features.html'),
      pay: s_('Bank transfer, credit card and PayNet', POSTLA),
    },
  },
  {
    name: 'Synova', home: SYNOVA,
    cells: {
      who: s_('Zynex AI, Johor Bahru', SYNOVA),
      entry: s_('Starter RM99 a month: 3 platforms, 1 account each, 30 posts; 14-day trial', SYNOVA),
      unit: s_('Per account per platform', SYNOVA),
      tenClients: s_('Business RM799 a month: 20 accounts per platform', SYNOVA),
      networks: s_('Facebook, Instagram, TikTok, Xiaohongshu, Threads and X named', SYNOVA),
      api: s_('Listed on Business (RM799 a month)', SYNOVA),
      pay: NOT_CHECKED,
    },
  },
  {
    name: Z.name, home: Z.home,
    cells: {
      who: s_('Zoho; shows ringgit prices to visitors in Malaysia', Z.cells.unit!.url),
      entry: Z.cells.entry!, unit: Z.cells.unit!, tenClients: Z.cells.scenario!,
      networks: NOT_CHECKED, api: NOT_CHECKED, pay: Z.facts.tax!,
    },
  },
];

/** The source pages behind a tool's row, de-duplicated, with descriptive link text. */
export const sourcesOf = (t: MyTool) => {
  const seen = new Map<string, string>();
  for (const c of Object.values(t.cells)) if (c && !seen.has(c.url)) seen.set(c.url, `${t.name} ${pageName(c.url)}`);
  return [...seen].map(([url, label]) => ({ url, label }));
};
const pageName = (url: string) => {
  const p = new URL(url).pathname.replace(/\/$/, '').split('/').pop() ?? '';
  if (!p || p === 'en' || p === 'social' || p === 'synova.html') return p === 'synova.html' ? 'product page' : 'home page';
  return p.replace(/\.(html|txt)$/, (m) => (m === '.txt' ? '.txt' : '')).replace(/-/g, ' ');
};

/** Ten clients in ringgit, for /for-agencies (the same sources as MY_TOOLS). */
export const MY_TEN_CLIENTS = MY_TOOLS.map((t) => ({ name: t.name, what: t.cells.tenClients!.value, url: t.cells.tenClients!.url }));
