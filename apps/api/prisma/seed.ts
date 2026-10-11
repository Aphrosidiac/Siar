/**
 * Demo seed: one organization full of realistic data for the dashboard, screenshots and the
 * platform reviewers' test login (docs/approvals). Idempotent per email: re-running replaces the
 * demo organization.
 *
 *   SEED_EMAIL=demo@siar.dev SEED_PASSWORD='…' pnpm --filter @siar/api db:seed
 *
 * Accounts are inserted directly (connected to the mock networks' identities), so this is for
 * development and review environments only — it refuses NODE_ENV=production unless SEED_FORCE=1.
 */
import { prisma } from '../src/platform/db.js';
import { hashPassword } from '../src/platform/auth.js';
import { tokenColumns } from '../src/platform/networks.js';
import { encrypt, randomToken, sha256 } from '../src/platform/crypto.js';
import { apiKeyPrefix, newApiKey } from '../src/platform/auth.js';
import { NETWORK_TYPES } from '../src/domain/serialize.js';
import type { NetworkType } from '@siar/networks';

if (process.env.NODE_ENV === 'production' && process.env.SEED_FORCE !== '1') { console.error('Refusing to seed demo data in production (set SEED_FORCE=1 for a review environment).'); process.exit(1); }

const EMAIL = (process.env.SEED_EMAIL ?? 'demo@siar.dev').toLowerCase();
const PASSWORD = process.env.SEED_PASSWORD ?? 'demo-password-123';
const DAY = 86400_000;
let r = 7;
const rnd = () => ((r = (r * 16807) % 2147483647) / 2147483647);
const pick = <T>(a: T[]) => a[Math.floor(rnd() * a.length)];
const int = (lo: number, hi: number) => Math.floor(lo + rnd() * (hi - lo + 1));

const TEAMS = [
  { name: 'Kopi Senja', networks: ['INSTAGRAM', 'FACEBOOK', 'TIKTOK', 'THREADS', 'GOOGLE_BUSINESS'] },
  { name: 'Northwind Labs', networks: ['LINKEDIN', 'TWITTER', 'BLUESKY', 'MASTODON', 'YOUTUBE', 'REDDIT'] },
  { name: 'Halo Fitness', networks: ['INSTAGRAM', 'TIKTOK', 'YOUTUBE', 'PINTEREST', 'SNAPCHAT', 'FACEBOOK'] },
  { name: 'Ops Alerts', networks: ['DISCORD', 'SLACK'] },
] as { name: string; networks: NetworkType[] }[];

const HANDLES: Record<string, (t: string) => { username: string; displayName: string }> = {
  default: t => ({ username: t.toLowerCase().replace(/[^a-z]/g, ''), displayName: t }),
};
/** What a login can publish to, per network (pages, locations, channels…), as the network lists them. */
function channelsFor(type: string, name: string, user: string): { id?: string; name: string; username?: string; address?: string; metadata?: object }[] {
  switch (type) {
    case 'FACEBOOK': return [{ name: `${name} Official`, username: `${user}official` }, { name: `${name} Catering`, username: `${user}catering` }];
    case 'INSTAGRAM': return [{ name: `${name} Catering`, username: `${user}.catering` }, { name: `${name} Roastery`, username: `${user}.roastery` }];
    case 'LINKEDIN': return [{ name: `${name} Sdn Bhd`, username: `${user}-sdn-bhd` }];
    case 'YOUTUBE': return [{ name, username: `@${user}` }];
    case 'GOOGLE_BUSINESS': return [
      { name: `${name} Bangsar`, address: '12 Jalan Telawi 3, Bangsar Baru, 59100 Kuala Lumpur' },
      { name: `${name} Damansara Uptown`, address: '28 Jalan SS 21/39, Damansara Utama, 47400 Petaling Jaya' },
      { name: `${name} Mont Kiara`, address: 'G-07, Arcoris Mall, Jalan Kiara, 50480 Kuala Lumpur' },
    ];
    case 'PINTEREST': return [{ name: 'Official' }, { name: 'Menu ideas' }];
    case 'SLACK': return [{ name: '#announcements' }, { name: '#general' }];
    // the mock Discord server's own ids (mocks/src/networks/discord.ts), so posts and checks reach it
    case 'DISCORD': return [{ id: '2002', name: '#announcements', metadata: { guildId: '1001' } }, { id: '2001', name: '#general', metadata: { guildId: '1001' } }];
    default: return [];
  }
}
/** What each demo brand would really post, comment and message, so screenshots read true. */
const TEXTS: Record<string, string[]> = {
  'Kopi Senja': [
    'Pandan latte is back from Friday. Iced or hot?',
    'Weekend hours: 8am to 10pm at Bangsar, Uptown and Mont Kiara.',
    'Behind the bar: how we pull a double shot of the house blend.',
    'New beans in from Bukit Tinggi. Chocolatey, low acid, roasted Tuesday.',
    'Rainy morning? Kaya toast and kopi O for RM12 until 11am.',
    'Thank you for 10k followers. Comment your order for a free drink this week.',
    'Hiring baristas for Mont Kiara. Full time, training provided.',
    'Deepavali hours: all three outlets close at 6pm on Sunday.',
    'Our Mont Kiara outlet turns one this week. Free cookie with every drink.',
    'Latte art class on Saturday, 10am. Six seats left.',
    'Meet Hana, our head roaster, and the one bean she would take to an island.',
    'Oat, almond or soy at no extra charge, at every outlet.',
    'Coffee cart catering for offices: now booking for December.',
    'Cold brew in 1-litre bottles, made daily. Pick up at any outlet.',
  ],
  'Northwind Labs': [
    'v2.4 is out: scheduled exports, SSO on every plan and a faster search.',
    'We moved our job queue to Postgres. Here is what happened to p99 latency.',
    'Hiring: backend engineer (TypeScript, Postgres). Remote within GMT+8.',
    'Office hours on Thursday. Bring your migration questions.',
    'Customer story: how a four-person team runs 40 brand accounts.',
    'Changelog: webhooks now retry with backoff for 24 hours.',
  ],
  'Halo Fitness': [
    'A 20-minute HIIT you can do in a condo gym. Save this for Monday.',
    'New class: reformer Pilates at TTDI, starting 3 November.',
    'Member spotlight: Farah ran her first 10K this weekend.',
    'Form check: three cues for a better deadlift.',
    'Early birds, the 6:30am classes are back.',
  ],
  'Ops Alerts': [
    'Release 2026.10.12 is live: queue latency down 38%.',
    'Scheduled maintenance on Sunday, 02:00 to 02:30 MYT.',
    'Resolved: delayed webhooks between 14:02 and 14:19 MYT.',
  ],
};
const COMMENTS: Record<string, string[]> = {
  'Kopi Senja': ['Is the pandan latte available with oat milk?', 'What time do you open on Sunday?', 'Had the kaya toast yesterday, so good', 'Can I book a table for eight on Saturday?', 'Any parking near the Uptown outlet?', 'Iced, always iced', 'Do you sell the beans by the bag?'],
  'Northwind Labs': ['Is SSO on the starter plan too?', 'Great write-up on the queue migration', 'Any plans for a Terraform provider?', 'Applied! Is the role open to Singapore?', 'The export scheduler saved us a cron job, thank you'],
  'Halo Fitness': ['Doing this tomorrow morning', 'Is the TTDI class beginner friendly?', 'Congrats Farah!', 'Can you post the cool-down too?', 'What time is the Saturday class?'],
  'Ops Alerts': ['Thanks for the heads up', 'Confirmed on our side, all clear'],
};
const PEOPLE = ['Aisyah Rahman', 'Daniel Wong', 'Mei Ling Tan', 'Arjun Nair', 'Sofia Lim', 'Hafiz Ismail', 'Priya Menon', 'Jason Ong'];
const DMS: [string, string, string | null][] = [
  ['aisyah.k', 'Hi! Do you take reservations for eight on Saturday evening?', 'Hi Aisyah, yes. Which outlet would you like?'],
  ['danielwong', 'Is the Uptown outlet pet friendly?', null],
  ['meiling_eats', 'Could we do a coffee cart for an office event in November?', 'We would love to. Sending you our catering menu now.'],
  ['hafiz.runs', 'Do you sell the house blend in 1kg bags?', null],
];

const MEDIA_REQUIRED = new Set(['TIKTOK', 'YOUTUBE', 'INSTAGRAM', 'PINTEREST', 'SNAPCHAT']);

/** Six months on Pro (one paid invoice per period) and the X credit top-up the ledger shows. */
async function seedInvoices(organizationId: string) {
  const billTo = { name: 'Demo Studio Sdn Bhd', email: 'accounts@demostudio.example', address: 'Level 12, Menara Demo\nJalan Ampang\n50450 Kuala Lumpur\nMalaysia', taxId: null };
  const docs: { at: Date; description: string; amountCents: number; periodStart?: Date; periodEnd?: Date; ref: string }[] = [];
  for (let k = 5; k >= 0; k--) {
    const start = new Date(Date.now() - 10 * DAY - k * 30 * DAY); const end = new Date(start.getTime() + 30 * DAY);
    docs.push({ at: start, description: `Siar Pro (monthly)${k === 5 ? '' : ' renewal'}`, amountCents: 10_000, periodStart: start, periodEnd: end, ref: `seed_sub_${k}` });
  }
  docs.push({ at: new Date(Date.now() - 20 * DAY), description: 'X credit top-up ($25.00)', amountCents: 2_500, ref: 'seed_topup_1' });
  docs.sort((a, b) => a.at.getTime() - b.at.getTime());
  const seq = new Map<number, number>();
  for (const d of docs) {
    const y = d.at.getUTCFullYear();
    if (!seq.has(y)) {
      const last = await prisma.billingInvoice.findFirst({ where: { number: { startsWith: `SIAR-${y}-` } }, orderBy: { number: 'desc' }, select: { number: true } });
      seq.set(y, last ? Number(last.number.slice(`SIAR-${y}-`.length)) : 0);
    }
    const n = seq.get(y)! + 1; seq.set(y, n);
    await prisma.billingInvoice.create({ data: {
      organizationId, provider: 'MOCK', providerInvoiceId: `${d.ref}_${organizationId.slice(-8)}`, number: `SIAR-${y}-${String(n).padStart(5, '0')}`,
      description: d.description, amountCents: d.amountCents, status: 'paid', paidAt: d.at, createdAt: d.at, periodStart: d.periodStart ?? null, periodEnd: d.periodEnd ?? null,
      paymentMethod: 'Visa •••• 4242', billTo,
      lines: [{ description: d.description.replace(' renewal', ''), quantity: 1, unitAmountCents: d.amountCents, amountCents: d.amountCents, periodStart: d.periodStart?.toISOString() ?? null, periodEnd: d.periodEnd?.toISOString() ?? null }],
    } });
  }
}

async function main() {
  const existing = await prisma.user.findUnique({ where: { email: EMAIL } });
  if (existing) {
    const orgs = await prisma.organization.findMany({ where: { createdById: existing.id } });
    for (const o of orgs) await prisma.organization.delete({ where: { id: o.id } });
    await prisma.user.delete({ where: { id: existing.id } });
  }
  const user = await prisma.user.create({ data: { email: EMAIL, passwordHash: await hashPassword(PASSWORD), firstName: 'Demo', lastName: 'User', emailVerified: new Date(), timezone: 'Asia/Kuala_Lumpur' } });
  const org = await prisma.organization.create({ data: { name: 'Demo Studio', createdById: user.id, tier: 'PRO', messagingEnabled: true, showVerboseErrors: true, billingName: 'Demo Studio Sdn Bhd', billingEmail: 'accounts@demostudio.example', billingAddress: 'Level 12, Menara Demo\nJalan Ampang\n50450 Kuala Lumpur\nMalaysia' } });
  await prisma.organizationMember.create({ data: { organizationId: org.id, userId: user.id, role: 'OWNER' } });
  await prisma.subscription.create({ data: { organizationId: org.id, provider: 'MOCK', status: 'active', tier: 'PRO', billingInterval: 'MONTHLY', unitAmountCents: 10_000, currentPeriodStart: new Date(Date.now() - 10 * DAY), currentPeriodEnd: new Date(Date.now() + 20 * DAY) } });
  await prisma.creditAccount.create({ data: { organizationId: org.id, balanceMicros: 18_455_000n } });
  await prisma.creditLedger.createMany({ data: [
    { organizationId: org.id, deltaMicros: 25_000_000n, reason: 'TOPUP', refType: 'seed', refId: 'topup-1', createdAt: new Date(Date.now() - 20 * DAY) },
    { organizationId: org.id, deltaMicros: -6_545_000n, reason: 'CHARGE', action: 'TWITTER_CONTENT_CREATE_WITH_URL', note: 'Seeded X usage' },
  ] });
  await seedInvoices(org.id);

  for (const t of TEAMS) {
    const team = await prisma.team.create({ data: { name: t.name, organizationId: org.id, createdById: user.id } });
    if (t.networks.includes('DISCORD')) await prisma.bot.create({ data: { teamId: team.id, name: 'Release Bot' } });
    const accounts = [];
    for (const type of t.networks) {
      const h = HANDLES.default(`${t.name}`);
      const ext = `${type.toLowerCase()}-${team.id.slice(-6)}`;
      const channels = channelsFor(type, t.name, h.username).map((c, i) => ({ id: type === 'GOOGLE_BUSINESS' ? `accounts/${team.id.slice(-6)}/locations/${i + 1}` : `${ext}-ch${i + 1}`, ...c }));
      const providerPageId = type === 'DISCORD' ? '1001' : ext;
      accounts.push(await prisma.socialAccount.create({ data: {
        type, teamId: team.id, username: h.username, displayName: h.displayName, externalId: channels[0]?.id ?? ext, providerPageId,
        userUsername: h.username, userDisplayName: h.displayName, channels, channelId: type === 'INSTAGRAM' || type === 'LINKEDIN' ? null : channels[0]?.id ?? null,
        instagramConnectionMethod: type === 'INSTAGRAM' ? 'FACEBOOK' : null, state: type === 'REDDIT' ? 'NEEDS_RECONNECT' : 'CONNECTED',
        stateReason: type === 'REDDIT' ? 'The Reddit token was revoked.' : null, deleteOn: type === 'REDDIT' ? new Date(Date.now() + 2 * DAY) : null,
        messagingStatus: type === 'INSTAGRAM' ? 'ENABLED' : 'DISABLED',
        ...tokenColumns({ accessToken: `seed-${ext}`, refreshToken: `seed-r-${ext}`, expiresAt: new Date(Date.now() + 30 * DAY) }),
      } }));
    }
    for (const a of accounts) {
      for (let d = 30; d >= 0; d -= 1) {
        const followers = 1200 + (30 - d) * int(3, 20);
        // a weekly rhythm (weekends busier) on a slow climb, with a little noise, like a real account
        const day = new Date(Date.now() - d * DAY).getDay();
        const wave = (day === 0 || day === 6 ? 1.35 : 1) * (1 + (30 - d) / 60) * (0.88 + rnd() * 0.24);
        await prisma.socialAccountAnalytics.create({ data: { socialAccountId: a.id, followers, following: 310, postCount: 80 + (30 - d), impressions: Math.round(3200 * wave), views: Math.round(2100 * wave), likes: Math.round(180 * wave), comments: Math.round(22 * wave), createdAt: new Date(Date.now() - d * DAY) } });
      }
    }
    // Posts across every state, spread over the last 30 days and the next 14.
    for (let i = 0; i < 40; i++) {
      const offset = int(-30, 14);
      // Upcoming posts carry text only, so they go to networks that publish text without media —
      // otherwise the demo calendar is full of posts that would fail validation on any edit.
      const pool = offset < 0 ? accounts : accounts.filter(a => !MEDIA_REQUIRED.has(a.type));
      const subset = pool.filter(() => rnd() > 0.45).slice(0, 4);
      if (!subset.length) subset.push(pool[0] ?? accounts[0]);
      const date = new Date(Date.now() + offset * DAY + int(0, 12) * 3600_000);
      const past = offset < 0;
      const status = past ? pick(['POSTED', 'POSTED', 'POSTED', 'POSTED', 'ERROR', 'REVIEW'] as const) : pick(['SCHEDULED', 'SCHEDULED', 'DRAFT'] as const);
      const text = TEXTS[t.name][i % TEXTS[t.name].length];
      const data = Object.fromEntries(subset.map(a => [a.type, a.type === 'PINTEREST' ? { text, boardName: 'Official' } : a.type === 'REDDIT' ? { sr: 'r/startups', text } : a.type === 'DISCORD' || a.type === 'SLACK' ? { channelId: a.channelId, text } : a.type === 'TIKTOK' ? { text, privacy: 'PUBLIC_TO_EVERYONE' } : { text }]));
      const post = await prisma.post.create({ data: {
        teamId: team.id, organizationId: org.id, title: text.length <= 60 ? text : `${text.slice(0, text.lastIndexOf(' ', 58))}…`, postDate: date, postedDate: status === 'POSTED' ? date : null, status, data,
        createdVia: pick(['API', 'API', 'DASHBOARD', 'CSV'] as const), countedAt: status === 'DRAFT' ? null : date,
        error: status === 'ERROR' ? `${subset[0].type}: The media aspect ratio is not supported.` : null,
      } });
      for (const [k, a] of subset.entries()) {
        const failed = status === 'ERROR' && k === 0;
        const ts = status === 'POSTED' ? 'POSTED' : status === 'REVIEW' ? 'REVIEW' : failed ? 'ERROR' : status === 'ERROR' ? 'POSTED' : 'PENDING';
        const ext = ts === 'POSTED' || ts === 'REVIEW' ? `${a.type.toLowerCase()}_${post.id.slice(-8)}` : null;
        await prisma.postSocialAccount.create({ data: {
          postId: post.id, socialAccountId: a.id, type: a.type, targetStatus: ts, externalPostId: ext, permalink: ext ? `https://example.com/${a.type.toLowerCase()}/${ext}` : null,
          publishedAt: ts === 'POSTED' ? date : null, attempts: ts === 'PENDING' ? 0 : 1,
          error: failed ? { code: 'MEDIA_INVALID', errorMessage: 'The aspect ratio is not supported.', isTransient: false, retryability: 'non_retryable', httpStatus: 400, userFacingMessage: 'The media aspect ratio is not supported. Use 4:5 to 1.91:1.' } : undefined,
        } });
        if (ts === 'POSTED' && ext) {
          const pp = await prisma.profilePost.create({ data: { socialAccountId: a.id, externalId: ext, postId: post.id, internal: true, permalink: `https://example.com/${ext}`, publishedAt: date, title: post.title } });
          for (let s = 0; s < 3; s++) await prisma.postAnalytics.create({ data: { profilePostId: pp.id, impressions: int(200, 9000) * (s + 1), views: int(100, 6000) * (s + 1), likes: int(5, 500) * (s + 1), comments: int(0, 40) * (s + 1), shares: int(0, 30), saves: int(0, 50), createdAt: new Date(date.getTime() + s * DAY) } });
          if (rnd() > 0.6) {
            const imp = await prisma.commentImport.create({ data: { teamId: team.id, organizationId: org.id, socialAccountId: a.id, type: a.type, postId: post.id, externalPostId: ext, status: 'COMPLETED', commentsCount: 3, limit: 200, completedAt: new Date() } });
            for (let c = 0; c < 3; c++) await prisma.fetchedComment.create({ data: { teamId: team.id, organizationId: org.id, postId: post.id, socialAccountId: a.id, importId: imp.id, platform: a.type, externalId: `${ext}_c${c}`, externalPostId: ext, authorName: pick(PEOPLE), text: pick(COMMENTS[t.name]), likesCount: int(0, 20), publishedAt: new Date(date.getTime() + c * 3600_000) } });
          }
        }
      }
    }
    if (t.name === 'Kopi Senja') {
      const ig = accounts.find(a => a.type === 'INSTAGRAM')!;
      for (const [k, [who, text, reply]] of DMS.entries()) {
        const at = new Date(Date.now() - (k * 3 + 1) * 3600_000);
        const last = reply ?? text;
        const conv = await prisma.conversation.create({ data: { teamId: team.id, socialAccountId: ig.id, platform: 'INSTAGRAM', externalParticipantId: `ig_${who}`, participantUsername: who, participantDisplayName: who, lastMessageAt: at, lastActivityAt: at, lastMessagePreview: last, unreadCount: reply ? 0 : 1 } });
        await prisma.conversationMessage.create({ data: { conversationId: conv.id, teamId: team.id, socialAccountId: ig.id, platform: 'INSTAGRAM', direction: 'INBOUND', status: 'DELIVERED', source: 'WEBHOOK', externalMessageId: `m_${who}`, text, sentAt: new Date(at.getTime() - 20 * 60_000) } });
        if (reply) await prisma.conversationMessage.create({ data: { conversationId: conv.id, teamId: team.id, socialAccountId: ig.id, platform: 'INSTAGRAM', direction: 'OUTBOUND', status: 'SENT', source: 'API', externalMessageId: `m_${who}_r`, text: reply, sentAt: at } });
      }
      const bio = await prisma.bio.create({ data: { teamId: team.id, slug: 'kopisenja', title: 'Kopi Senja', description: 'Specialty coffee in Bangsar, Uptown and Mont Kiara.', theme: { accent: '#161615' }, published: true } });
      const links: [string, string, string | null][] = [['HEADER', 'Order', null], ['LINK', 'Order on GrabFood', 'https://food.grab.com/my/en/'], ['LINK', 'Today\'s menu', 'https://kopisenja.example/menu'], ['LINK', 'Catering and coffee carts', 'https://kopisenja.example/catering'], ['HEADER', 'Visit', null], ['LINK', 'Find an outlet', 'https://kopisenja.example/outlets'], ['SOCIAL', 'Instagram', 'https://instagram.com/kopisenja']];
      const items = [];
      for (const [i, [type, title, url]] of links.entries()) items.push(await prisma.bioItem.create({ data: { bioId: bio.id, type, title, url, position: i + 1 } }));
      const clickable = items.filter(i => i.type !== 'HEADER');
      const events = [];
      for (let d = 29; d >= 0; d--) for (let v = int(30, 90); v > 0; v--) {
        const at = new Date(Date.now() - d * DAY - int(0, 20) * 3600_000);
        events.push({ bioId: bio.id, kind: 'VIEW', country: pick(['MY', 'MY', 'MY', 'SG']), referrer: pick(['instagram.com', 'tiktok.com', null]), createdAt: at });
        if (rnd() > 0.55) events.push({ bioId: bio.id, kind: 'CLICK', itemId: pick(clickable).id, country: 'MY', createdAt: at });
      }
      await prisma.bioEvent.createMany({ data: events });
    }
  }
  const hook = await prisma.webhook.create({ data: { organizationId: org.id, url: 'https://api.demostudio.example/hooks/siar', events: ['post.published', 'comment.received', 'social-account.updated', 'conversation.message.created'], secretEnc: encrypt(`whsec_${randomToken(24)}`) } });
  const deliveries = [];
  for (let k = 0; k < 24; k++) {
    const event = pick(['post.published', 'post.published', 'post.published', 'comment.received', 'conversation.message.created', 'social-account.updated']);
    const failed = k === 5;
    deliveries.push({ webhookId: hook.id, eventId: `evt_${randomToken(9)}`, event, payload: { type: event, data: {} }, attempt: failed ? 3 : 1, status: failed ? 'FAILED' : 'SUCCESS', responseCode: failed ? 502 : 200, responseBody: failed ? 'Bad gateway' : '{"ok":true}', durationMs: failed ? 10_000 : int(60, 420), createdAt: new Date(Date.now() - k * int(40, 140) * 60_000) });
  }
  await prisma.webhookDelivery.createMany({ data: deliveries });
  for (const [name, used] of [['Production server', 0.02], ['Zapier', 2], ['Staging', 9]] as const) {
    const key = newApiKey();
    await prisma.apiKey.create({ data: { organizationId: org.id, name, prefix: apiKeyPrefix(key), hash: sha256(key), createdById: user.id, lastUsedAt: new Date(Date.now() - used * DAY), createdAt: new Date(Date.now() - (40 + used * 3) * DAY) } });
  }
  await prisma.notification.createMany({ data: [
    { userId: user.id, organizationId: org.id, kind: 'post.error', title: 'A post failed to publish', body: 'Instagram: The media aspect ratio is not supported.', link: '/posts' },
    { userId: user.id, organizationId: org.id, kind: 'account', title: 'Reddit needs to be reconnected', body: 'Northwind Labs · The Reddit token was revoked.', link: '/social-accounts' },
  ] });
  const posts = await prisma.post.count({ where: { organizationId: org.id } });
  console.log(`seeded ${EMAIL} / ${PASSWORD} → org "Demo Studio" with ${TEAMS.length} teams and ${posts} posts`);
}

main().then(() => prisma.$disconnect()).catch(async e => { console.error(e); await prisma.$disconnect(); process.exit(1); });
