// Traffic classification (docs/ANALYTICS.md). Network is faked: published lists and DNS come from the stubs below.
import { beforeAll, describe, expect, it } from 'vitest';

process.env.DATABASE_URL ??= 'postgresql://localhost:5432/unused';
process.env.SESSION_SECRET ??= 'x'.repeat(40);
process.env.ENCRYPTION_KEY ??= 'y'.repeat(48);
process.env.SITE_URL = 'https://siaran.my';

let agents: typeof import('../src/domain/traffic/agents.js');
let ip: typeof import('../src/domain/traffic/ipranges.js');
let ch: typeof import('../src/domain/traffic/channel.js');
let ing: typeof import('../src/domain/traffic/ingest.js');

const LISTS: Record<string, string> = {
  'https://developers.google.com/static/search/apis/ipranges/googlebot.json': JSON.stringify({ prefixes: [{ ipv4Prefix: '66.249.64.0/27' }, { ipv6Prefix: '2001:4860:4801:10::/64' }] }),
  'https://openai.com/gptbot.json': JSON.stringify({ prefixes: [{ ipv4Prefix: '132.196.86.0/24' }] }),
  'https://www.bing.com/toolbox/bingbot.json': JSON.stringify({ prefixes: [{ ipv4Prefix: '157.55.39.0/24' }] }),
  'https://ip-ranges.amazonaws.com/ip-ranges.json': JSON.stringify({ prefixes: [{ ip_prefix: '3.80.0.0/12' }], ipv6_prefixes: [{ ipv6_prefix: '2600:1f00::/24' }] }),
  'https://www.gstatic.com/ipranges/cloud.json': JSON.stringify({ prefixes: [{ ipv4Prefix: '34.64.0.0/10' }] }),
  'https://www.digitalocean.com/geo/google.csv': '164.90.128.0/18,DE,DE-HE,Frankfurt,60341\n',
  'https://docs.oracle.com/en-us/iaas/tools/public_ip_ranges.json': JSON.stringify({ regions: [{ cidrs: [{ cidr: '129.146.0.0/16' }] }] }),
};
const PTR: Record<string, string[]> = { '17.58.101.1': ['17-58-101-1.applebot.apple.com'], '5.5.5.5': ['fake.applebot.apple.com'] };
const A: Record<string, string[]> = { '17-58-101-1.applebot.apple.com': ['17.58.101.1'], 'fake.applebot.apple.com': ['9.9.9.9'] };

beforeAll(async () => {
  agents = await import('../src/domain/traffic/agents.js');
  ip = await import('../src/domain/traffic/ipranges.js');
  ch = await import('../src/domain/traffic/channel.js');
  ing = await import('../src/domain/traffic/ingest.js');
  ip.useNetwork(async (url) => { if (!(url in LISTS)) throw new Error('404'); return LISTS[url]; },
    { reverse: async (a) => { if (!PTR[a]) throw new Error('ENOTFOUND'); return PTR[a]; }, lookup: async (h) => A[h] ?? [] });
});

const CHROME = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36';
const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 19_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/19.0 Mobile/15E148 Safari/604.1';

describe('user agents', () => {
  it('names crawlers, specific before family', () => {
    const k = (ua: string) => { const p = agents.parseUa(ua); return p.kind === 'bot' ? p.bot.name : `${p.kind}:${'name' in p ? p.name : ''}`; };
    expect(k('Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)')).toBe('Googlebot');
    expect(k('Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)')).toBe('Googlebot');
    expect(k('Mozilla/5.0 (compatible; Google-InspectionTool/1.0;)')).toBe('Google-InspectionTool');
    expect(k('Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.1; +https://openai.com/gptbot')).toBe('GPTBot');
    expect(k('Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)')).toBe('ClaudeBot');
    expect(k('Mozilla/5.0 (compatible; Claude-User/1.0; +Claude-User@anthropic.com)')).toBe('Claude-User');
    expect(k('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1 Safari/605.1.15 (Applebot/0.1; +http://www.apple.com/go/applebot)')).toBe('Applebot');
    expect(k('Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)')).toBe('Bingbot');
    expect(k('facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)')).toBe('facebookexternalhit');
  });
  it('tells tools, monitors, scanners and browsers apart', () => {
    expect(agents.parseUa('curl/8.7.1')).toMatchObject({ kind: 'tool', name: 'curl' });
    expect(agents.parseUa('python-requests/2.32.3')).toMatchObject({ kind: 'tool', name: 'Python' });
    expect(agents.parseUa('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/140.0.0.0 Safari/537.36')).toMatchObject({ kind: 'tool', name: 'HeadlessChrome' });
    expect(agents.parseUa('Mozilla/5.0+(compatible; UptimeRobot/2.0; http://www.uptimerobot.com/)')).toMatchObject({ kind: 'monitor' });
    expect(agents.parseUa('Mozilla/5.0 zgrab/0.x')).toMatchObject({ kind: 'scanner' });
    expect(agents.parseUa('')).toMatchObject({ kind: 'tool', name: 'No user agent' });
    expect(agents.parseUa(CHROME)).toEqual({ kind: 'browser', name: 'Chrome' });
    expect(agents.parseUa(IPHONE)).toEqual({ kind: 'browser', name: 'Safari' });
    expect(agents.parseUa('Mozilla/5.0 (compatible; SomeNewCrawler/1.0; +https://x.example)')).toMatchObject({ kind: 'unknown-bot' });
  });
  it('flags scanner paths only', () => {
    for (const p of ['/wp-login.php', '/.env', '/.git/config', '/phpmyadmin/', '/xmlrpc.php', '/cgi-bin/x', '/vendor/phpunit/x']) expect(agents.isScannerPath(p)).toBe(true);
    for (const p of ['/', '/pricing', '/docs/api/post', '/.well-known/security.txt', '/how-publishing-works']) expect(agents.isScannerPath(p)).toBe(false);
  });
});

describe('ip ranges', () => {
  it('matches v4 and v6 CIDRs', () => {
    const r = ['66.249.64.0/27', '2001:4860:4801:10::/64'].map((c) => ip.parseCidr(c)!);
    expect(ip.inRanges('66.249.64.5', r)).toBe(true);
    expect(ip.inRanges('66.249.64.40', r)).toBe(false);
    expect(ip.inRanges('2001:4860:4801:10::abcd', r)).toBe(true);
    expect(ip.inRanges('2001:4860:4801:11::1', r)).toBe(false);
    expect(ip.inRanges('::ffff:66.249.64.5', [ip.parseCidr('::ffff:66.249.64.0/123')!])).toBe(true);
  });
  it('reads every published format', () => {
    expect(ip.cidrsFrom(LISTS['https://ip-ranges.amazonaws.com/ip-ranges.json'])).toEqual(['3.80.0.0/12', '2600:1f00::/24']);
    expect(ip.cidrsFrom(LISTS['https://docs.oracle.com/en-us/iaas/tools/public_ip_ranges.json'])).toEqual(['129.146.0.0/16']);
    expect(ip.cidrsFrom(LISTS['https://www.digitalocean.com/geo/google.csv'])).toEqual(['164.90.128.0/18']);
  });
  it('verifies by list, fails impostors, forward-confirms reverse DNS', async () => {
    const google = agents.KNOWN_BOTS.find((b) => b.name === 'Googlebot')!.verify;
    expect(await ip.verifyClaim('66.249.64.9', google)).toBe('verified');
    expect(await ip.verifyClaim('45.12.3.4', google)).toBe('failed');
    const apple = agents.KNOWN_BOTS.find((b) => b.name === 'Applebot')!.verify;
    expect(await ip.verifyClaim('17.58.101.1', apple)).toBe('verified');
    expect(await ip.verifyClaim('5.5.5.5', apple)).toBe('failed'); // PTR says applebot, A record disagrees
    expect(await ip.verifyClaim('1.1.1.1', agents.KNOWN_BOTS.find((b) => b.name === 'ClaudeBot')!.verify)).toBe('unverifiable');
  });
  it('knows datacenters', async () => {
    expect(await ip.datacenterOf('3.85.1.1')).toBe('AWS');
    expect(await ip.datacenterOf('34.80.0.1')).toBe('Google Cloud');
    expect(await ip.datacenterOf('164.90.130.2')).toBe('DigitalOcean');
    expect(await ip.datacenterOf('115.164.1.1')).toBe(null);
  });
});

describe('classification of log lines', () => {
  const ctx = () => ({ staffIps: new Set(['180.75.232.36']), cache: new Map() });
  const line = (o: Partial<import('../src/domain/traffic/ingest.js').LogLine>) => ({ t: '2026-11-12T05:00:00+00:00', h: 'siaran.my', ip: '115.164.1.1', m: 'GET', u: '/pricing', s: 200, b: 1000, rt: 0.002, ua: CHROME, r: '', c: 'MY', q: '', ...o });
  it('people', async () => {
    expect((await ing.prepare(line({}), ctx()))!.hit).toMatchObject({ class: 'unconfirmed', kind: 'page', ip: null, country: 'MY' });
    expect((await ing.prepare(line({ ip: '180.75.232.36' }), ctx()))!.hit.class).toBe('staff');
    expect((await ing.prepare(line({ ip: '3.85.1.1' }), ctx()))!.hit).toMatchObject({ class: 'datacenter', agent: 'Chrome on AWS', ip: '3.85.1.1' });
    const beacon = await ing.prepare(line({ u: '/_e', m: 'POST', s: 204, q: 'p=%2Fpricing&r=www.google.com&w=1440&wd=0&e=t' }), ctx());
    expect(beacon!.hit).toMatchObject({ kind: 'beacon', class: 'human', data: { p: '/pricing', r: 'www.google.com', w: 1440, wd: false, device: 'desktop' } });
    const robot = await ing.prepare(line({ u: '/_e', q: 'p=%2F&wd=1' }), ctx());
    expect(robot!.hit.class).toBe('automation');
  });
  it('crawlers and noise', async () => {
    const gb = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';
    expect((await ing.prepare(line({ ua: gb, ip: '66.249.64.3' }), ctx()))!.hit).toMatchObject({ class: 'search-bot', agent: 'Googlebot', verified: 'verified' });
    expect((await ing.prepare(line({ ua: gb, ip: '45.12.3.4' }), ctx()))!.hit).toMatchObject({ class: 'impostor', agent: 'Googlebot', verified: 'failed', ip: '45.12.3.4' });
    expect((await ing.prepare(line({ ua: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.1; +https://openai.com/gptbot', ip: '132.196.86.7', u: '/llms.txt' }), ctx()))!.hit).toMatchObject({ class: 'ai-bot', kind: 'file', verified: 'verified' });
    expect((await ing.prepare(line({ u: '/wp-login.php' }), ctx()))!.hit.class).toBe('scanner');
    expect((await ing.prepare(line({ ip: '127.0.0.1', ua: 'curl/8.5.0', h: 'api.siaran.my', u: '/api/v1/' }), ctx()))!.hit).toBe(null);
    expect((await ing.prepare(line({ u: '/_astro/index.css' }), ctx()))!.hit).toBe(null); // assets are counted, not stored
    // a customer's browser on the dashboard is counted, not stored; a crawler there is stored
    expect((await ing.prepare(line({ h: 'app.siaran.my', u: '/posts' }), ctx()))!.hit).toBe(null);
    expect((await ing.prepare(line({ h: 'app.siaran.my', u: '/login', ua: 'Mozilla/5.0 (compatible; SomeNewCrawler/1.0)' }), ctx()))!.hit.class).toBe('other-bot');
  });
  it('normalises paths', () => {
    expect(ing.normPath('/pricing/')).toBe('/pricing');
    expect(ing.normPath('/pricing?utm_source=x')).toBe('/pricing');
    expect(ing.normPath('/')).toBe('/');
    expect(ing.kindOf('site', '/sitemap-index.xml')).toBe('file');
    expect(ing.kindOf('api', '/api/v1/post')).toBe('api');
  });
});

describe('channels', () => {
  it('reads referrers and UTM tags', () => {
    expect(ch.channelOf('www.google.com')).toBe('Google');
    expect(ch.channelOf('www.google.com.my')).toBe('Google');
    expect(ch.channelOf('bing.com')).toBe('Bing');
    expect(ch.channelOf('chatgpt.com')).toBe('AI assistant');
    expect(ch.channelOf('perplexity.ai')).toBe('AI assistant');
    expect(ch.channelOf('l.facebook.com')).toBe('Social');
    expect(ch.channelOf('t.co')).toBe('Social');
    expect(ch.channelOf('news.example.com')).toBe('Referral');
    expect(ch.channelOf('siaran.my')).toBe('Internal');
    expect(ch.channelOf('', 'threads')).toBe('Social');
    expect(ch.channelOf('', 'newsletter')).toBe('Campaign');
    expect(ch.channelOf(null)).toBe('Direct');
  });
});
