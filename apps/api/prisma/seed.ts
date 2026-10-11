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
const TEXTS = [
  'New seasonal menu drops this Friday. Which one are you trying first?',
  'Behind the scenes of our latest shoot — swipe to see the setup.',
  'We shipped scheduled publishing for 15 networks. Docs in the link.',
  'Three things we learned running 10,000 posts a month through one API.',
  'Weekend hours: open 8am to 10pm. See you there!',
  'Customer story: how a 4-person team runs 40 brand accounts.',
  'Quick tip: your first comment is the best place for links on Instagram.',
  'Live now: our autumn collection. Limited run.',
  'Hiring: backend engineer (TypeScript, Postgres). Remote friendly.',
  'Thank you for 10k followers. Giveaway details below.',
];

async function main() {
  const existing = await prisma.user.findUnique({ where: { email: EMAIL } });
  if (existing) {
    const orgs = await prisma.organization.findMany({ where: { createdById: existing.id } });
    for (const o of orgs) await prisma.organization.delete({ where: { id: o.id } });
    await prisma.user.delete({ where: { id: existing.id } });
  }
  const user = await prisma.user.create({ data: { email: EMAIL, passwordHash: await hashPassword(PASSWORD), firstName: 'Demo', lastName: 'User', emailVerified: new Date(), timezone: 'Asia/Kuala_Lumpur' } });
  const org = await prisma.organization.create({ data: { name: 'Demo Studio', createdById: user.id, tier: 'PRO', messagingEnabled: true, showVerboseErrors: true } });
  await prisma.organizationMember.create({ data: { organizationId: org.id, userId: user.id, role: 'OWNER' } });
  await prisma.subscription.create({ data: { organizationId: org.id, provider: 'MOCK', status: 'active', tier: 'PRO', billingInterval: 'MONTHLY', unitAmountCents: 10_000, currentPeriodStart: new Date(Date.now() - 10 * DAY), currentPeriodEnd: new Date(Date.now() + 20 * DAY) } });
  await prisma.creditAccount.create({ data: { organizationId: org.id, balanceMicros: 18_455_000n } });
  await prisma.creditLedger.createMany({ data: [
    { organizationId: org.id, deltaMicros: 25_000_000n, reason: 'TOPUP', refType: 'seed', refId: 'topup-1', createdAt: new Date(Date.now() - 20 * DAY) },
    { organizationId: org.id, deltaMicros: -6_545_000n, reason: 'CHARGE', action: 'TWITTER_CONTENT_CREATE_WITH_URL', note: 'Seeded X usage' },
  ] });
  await prisma.billingInvoice.create({ data: { organizationId: org.id, provider: 'MOCK', number: `SIAR-${new Date().getUTCFullYear()}-${String(int(10000, 99999))}`, description: 'Siar Pro — monthly', amountCents: 10_000, status: 'paid', paidAt: new Date(Date.now() - 10 * DAY), periodStart: new Date(Date.now() - 10 * DAY), periodEnd: new Date(Date.now() + 20 * DAY) } });

  for (const t of TEAMS) {
    const team = await prisma.team.create({ data: { name: t.name, organizationId: org.id, createdById: user.id } });
    if (t.networks.includes('DISCORD')) await prisma.bot.create({ data: { teamId: team.id, name: 'Release Bot' } });
    const accounts = [];
    for (const type of t.networks) {
      const h = HANDLES.default(`${t.name}`);
      const ext = `${type.toLowerCase()}-${team.id.slice(-6)}`;
      const channels = ['FACEBOOK', 'LINKEDIN', 'PINTEREST', 'GOOGLE_BUSINESS', 'DISCORD', 'SLACK', 'YOUTUBE'].includes(type)
        ? [{ id: `${ext}-ch1`, name: type === 'DISCORD' || type === 'SLACK' ? '#announcements' : `${t.name} ${type === 'GOOGLE_BUSINESS' ? 'Bangsar' : 'Official'}` }] : [];
      accounts.push(await prisma.socialAccount.create({ data: {
        type, teamId: team.id, username: h.username, displayName: h.displayName, externalId: channels[0]?.id ?? ext, providerPageId: ext,
        userUsername: h.username, userDisplayName: h.displayName, channels, channelId: channels[0]?.id ?? null,
        instagramConnectionMethod: type === 'INSTAGRAM' ? 'FACEBOOK' : null, state: type === 'REDDIT' ? 'NEEDS_RECONNECT' : 'CONNECTED',
        stateReason: type === 'REDDIT' ? 'The Reddit token was revoked.' : null, deleteOn: type === 'REDDIT' ? new Date(Date.now() + 2 * DAY) : null,
        messagingStatus: type === 'INSTAGRAM' ? 'ENABLED' : 'DISABLED',
        ...tokenColumns({ accessToken: `seed-${ext}`, refreshToken: `seed-r-${ext}`, expiresAt: new Date(Date.now() + 30 * DAY) }),
      } }));
    }
    for (const a of accounts) {
      for (let d = 30; d >= 0; d -= 1) {
        const followers = 1200 + (30 - d) * int(3, 20);
        await prisma.socialAccountAnalytics.create({ data: { socialAccountId: a.id, followers, following: 310, postCount: 80 + (30 - d), impressions: int(800, 6000), views: int(400, 4000), likes: int(40, 400), comments: int(2, 60), createdAt: new Date(Date.now() - d * DAY) } });
      }
    }
    // Posts across every state, spread over the last 30 days and the next 14.
    for (let i = 0; i < 40; i++) {
      const subset = accounts.filter(() => rnd() > 0.45).slice(0, 4);
      if (!subset.length) subset.push(accounts[0]);
      const offset = int(-30, 14);
      const date = new Date(Date.now() + offset * DAY + int(0, 12) * 3600_000);
      const past = offset < 0;
      const status = past ? pick(['POSTED', 'POSTED', 'POSTED', 'POSTED', 'ERROR', 'REVIEW'] as const) : pick(['SCHEDULED', 'SCHEDULED', 'DRAFT'] as const);
      const text = pick(TEXTS);
      const data = Object.fromEntries(subset.map(a => [a.type, a.type === 'PINTEREST' ? { text, boardName: 'Official' } : a.type === 'REDDIT' ? { sr: 'r/startups', text } : a.type === 'DISCORD' || a.type === 'SLACK' ? { channelId: a.channelId, text } : a.type === 'TIKTOK' ? { text, privacy: 'PUBLIC_TO_EVERYONE' } : { text }]));
      const post = await prisma.post.create({ data: {
        teamId: team.id, organizationId: org.id, title: text.slice(0, 60), postDate: date, postedDate: status === 'POSTED' ? date : null, status, data,
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
            for (let c = 0; c < 3; c++) await prisma.fetchedComment.create({ data: { teamId: team.id, organizationId: org.id, postId: post.id, socialAccountId: a.id, importId: imp.id, platform: a.type, externalId: `${ext}_c${c}`, externalPostId: ext, authorName: pick(['Aisyah', 'Daniel', 'Mei Ling', 'Arjun', 'Sofia']), text: pick(['Love this!', 'What time do you open?', 'Is there a vegan option?', 'Shipped to Penang?', '🔥🔥']), likesCount: int(0, 20), publishedAt: new Date(date.getTime() + c * 3600_000) } });
          }
        }
      }
    }
    if (t.networks.includes('INSTAGRAM')) {
      const ig = accounts.find(a => a.type === 'INSTAGRAM')!;
      for (const who of ['aisyah.k', 'danielwong', 'meiling_eats']) {
        const conv = await prisma.conversation.create({ data: { teamId: team.id, socialAccountId: ig.id, platform: 'INSTAGRAM', externalParticipantId: `ig_${who}`, participantUsername: who, participantDisplayName: who, lastMessageAt: new Date(), lastActivityAt: new Date(), lastMessagePreview: 'Do you take reservations?', unreadCount: 1 } });
        await prisma.conversationMessage.create({ data: { conversationId: conv.id, teamId: team.id, socialAccountId: ig.id, platform: 'INSTAGRAM', direction: 'INBOUND', status: 'DELIVERED', source: 'WEBHOOK', externalMessageId: `m_${who}`, text: 'Do you take reservations?', sentAt: new Date() } });
      }
    }
  }
  await prisma.notification.createMany({ data: [
    { userId: user.id, organizationId: org.id, kind: 'post.error', title: 'A post failed to publish', body: 'Instagram: The media aspect ratio is not supported.', link: '/posts' },
    { userId: user.id, organizationId: org.id, kind: 'account', title: 'Reddit needs to be reconnected', body: 'Northwind Labs · The Reddit token was revoked.', link: '/social-accounts' },
  ] });
  const posts = await prisma.post.count({ where: { organizationId: org.id } });
  console.log(`seeded ${EMAIL} / ${PASSWORD} → org "Demo Studio" with ${TEAMS.length} teams and ${posts} posts`);
}

main().then(() => prisma.$disconnect()).catch(async e => { console.error(e); await prisma.$disconnect(); process.exit(1); });
