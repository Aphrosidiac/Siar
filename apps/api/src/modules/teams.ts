import { prisma } from '../platform/db.js';
import { audit } from '../platform/audit.js';
import { emit, flushDeliveries } from '../platform/events.js';
import { forbidden, notFound } from '../platform/errors.js';
import { listOf, pageOf } from '../platform/http.js';
import { requirePermission, type Actor } from '../platform/auth.js';
import { define } from '../platform/routes.js';
import * as S from '../domain/serialize.js';
import { limitsFor, RESOURCE_LIMITS } from '../domain/plans.js';
import { accountKey, accountMonthUsage, dailyUsage, orgUsage } from '../domain/quota.js';

const include = { organization: true, createdBy: true, bots: true, socialAccounts: true, bio: true } as const;

/** A team of the caller's organization, or 404 (never 403 — ids from other orgs do not exist). */
export async function teamOf(actor: Actor, id: string) {
  const t = await prisma.team.findFirst({ where: { id, organizationId: actor.organizationId, deletedAt: null } });
  if (!t) throw notFound('Team');
  return t;
}

define({
  'team.getList': async ({ actor, query }) => {
    const p = pageOf(query);
    const where = { organizationId: actor.organizationId, deletedAt: null, ...(query.search ? { name: { contains: String(query.search), mode: 'insensitive' as const } } : {}) };
    const [rows, total] = await Promise.all([prisma.team.findMany({ where, include, orderBy: { createdAt: 'asc' }, ...p }), prisma.team.count({ where })]);
    return listOf(rows.map(S.team), total);
  },

  'team.getTeam': async ({ actor, params }) => {
    await teamOf(actor, params.id);
    return S.team(await prisma.team.findUniqueOrThrow({ where: { id: params.id }, include }));
  },

  'team.createTeam': async ({ actor, body }) => {
    requirePermission(actor, 'teams.manage');
    const created = await prisma.$transaction(async tx => {
      // Serialise team creation per org so two concurrent creates cannot both slip under the free cap.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${'teams:' + actor.organizationId}))`;
      const org = await tx.organization.findUniqueOrThrow({ where: { id: actor.organizationId } });
      const l = limitsFor(org);
      if (l.teams !== null) {
        const n = await tx.team.count({ where: { organizationId: org.id, deletedAt: null } });
        if (n >= l.teams) throw forbidden(`Social sets limit reached. Limit is ${l.teams} ${l.teams === 1 ? 'set' : 'sets'}. Your ${l.plan.name} plan includes ${l.teams} ${l.teams === 1 ? 'brand' : 'brands'}; upgrade in Billing to add more.`);
      }
      const t = await tx.team.create({ data: { name: body.name.trim(), avatarUrl: body.avatarUrl ?? null, organizationId: org.id, createdById: actor.userId ?? org.createdById }, include });
      await audit(tx, actor, 'team.create', 'Team', t.id, `Created team ${t.name}`);
      const ids = await emit(tx, org.id, 'team.created', S.team(t));
      return { t, ids };
    });
    void flushDeliveries(created.ids);
    return S.team(created.t);
  },

  'team.updateTeam': async ({ actor, params, body }) => {
    requirePermission(actor, 'teams.manage');
    await teamOf(actor, params.id);
    const data: Record<string, unknown> = {};
    if ('name' in body) data.name = String(body.name).trim();
    if ('avatarUrl' in body) data.avatarUrl = body.avatarUrl;
    const out = await prisma.$transaction(async tx => {
      const t = await tx.team.update({ where: { id: params.id }, data, include });
      await audit(tx, actor, 'team.update', 'Team', t.id, `Updated team ${t.name}`, data);
      return { t, ids: await emit(tx, actor.organizationId, 'team.updated', S.team(t)) };
    });
    void flushDeliveries(out.ids);
    return S.team(out.t);
  },

  'team.deleteTeam': async ({ actor, params }) => {
    requirePermission(actor, 'teams.manage');
    const t = await teamOf(actor, params.id);
    const out = await prisma.$transaction(async tx => {
      const now = new Date();
      await tx.post.updateMany({ where: { teamId: t.id, status: { in: ['DRAFT', 'SCHEDULED'] } }, data: { status: 'DELETED', deletedAt: now } });
      await tx.socialAccount.updateMany({ where: { teamId: t.id, deletedAt: null }, data: { deletedAt: now, state: 'DISCONNECTED' } });
      const d = await tx.team.update({ where: { id: t.id }, data: { deletedAt: now }, include });
      await audit(tx, actor, 'team.delete', 'Team', t.id, `Deleted team ${t.name}`);
      return { d, ids: await emit(tx, actor.organizationId, 'team.deleted', S.team(d)) };
    });
    void flushDeliveries(out.ids);
    return S.team(out.d);
  },

  // ── bots (Discord/Slack posting identities, ≤50 per team) ──
  'bot.list': async ({ actor, query }) => {
    await teamOf(actor, query.teamId);
    const rows = await prisma.bot.findMany({ where: { teamId: query.teamId, deletedAt: null }, orderBy: { createdAt: 'asc' } });
    return listOf(rows.map(S.bot), rows.length);
  },
  'bot.create': async ({ actor, body }) => {
    await teamOf(actor, body.teamId);
    const n = await prisma.bot.count({ where: { teamId: body.teamId, deletedAt: null } });
    if (n >= RESOURCE_LIMITS.botsPerTeam) throw forbidden(`Bots limit reached. Limit is ${RESOURCE_LIMITS.botsPerTeam} per team.`);
    return S.bot(await prisma.bot.create({ data: { teamId: body.teamId, name: body.name.trim(), avatarUrl: body.avatarUrl ?? null } }));
  },
  'bot.update': async ({ actor, params, body }) => {
    const b = await prisma.bot.findFirst({ where: { id: params.id, deletedAt: null, team: { organizationId: actor.organizationId } } });
    if (!b) throw notFound('Bot');
    const data: Record<string, unknown> = {};
    if ('name' in body) data.name = body.name; if ('avatarUrl' in body) data.avatarUrl = body.avatarUrl;
    return S.bot(await prisma.bot.update({ where: { id: b.id }, data }));
  },
  'bot.delete': async ({ actor, params }) => {
    const b = await prisma.bot.findFirst({ where: { id: params.id, deletedAt: null, team: { organizationId: actor.organizationId } } });
    if (!b) throw notFound('Bot');
    await prisma.bot.update({ where: { id: b.id }, data: { deletedAt: new Date() } });
    return { success: true };
  },

  // ── usage ──
  'organization.getPostsUsage': async ({ actor }) => usage(actor, 'posts'),
  'organization.getCommentsUsage': async ({ actor }) => usage(actor, 'comments'),
  'organization.getUploadsUsage': async ({ actor }) => usage(actor, 'uploads'),

  'organization.getDailyLimitsUsage': async ({ actor, query }) => {
    const a = await prisma.socialAccount.findFirst({ where: { id: query.socialAccountId, team: { organizationId: actor.organizationId } } });
    if (!a) throw notFound('Social account');
    const org = await prisma.organization.findUniqueOrThrow({ where: { id: actor.organizationId } });
    const l = limitsFor(org);
    const day = query.date ? new Date(`${String(query.date).slice(0, 10)}T00:00:00Z`) : new Date();
    const key = accountKey(a.type, a.providerPageId, a.id);
    const [p, c] = await Promise.all([dailyUsage(prisma, key, 'posts', day), dailyUsage(prisma, key, 'comments', day)]);
    const pl = l.dailyPosts[a.type]; const cl = l.dailyComments[a.type];
    return { date: day.toISOString().slice(0, 10), socialAccountId: a.id, type: a.type, posts: { used: p, limit: pl, remaining: Math.max(0, pl - p) }, comments: { used: c, limit: cl, remaining: Math.max(0, cl - c) } };
  },

  'organization.getImportsUsage': async ({ actor, query }) => {
    const page = Math.max(1, Number(query.page ?? 1)); const pageSize = Math.min(100, Math.max(1, Number(query.pageSize ?? 20)));
    const org = await prisma.organization.findUniqueOrThrow({ where: { id: actor.organizationId } });
    const l = limitsFor(org);
    const where = { deletedAt: null, team: { organizationId: actor.organizationId, deletedAt: null }, ...(query.teamId ? { teamId: query.teamId } : {}), ...(query.socialAccountType ? { type: query.socialAccountType } : {}), ...(query.socialAccountId ? { id: query.socialAccountId } : {}) };
    const [rows, total] = await Promise.all([prisma.socialAccount.findMany({ where, orderBy: { createdAt: 'asc' }, skip: (page - 1) * pageSize, take: pageSize }), prisma.socialAccount.count({ where })]);
    const socialAccounts = await Promise.all(rows.map(async a => {
      const used = await accountMonthUsage(prisma, accountKey(a.type, a.providerPageId, a.id), 'imports', org.tier);
      return { socialAccountId: a.id, teamId: a.teamId, type: a.type, username: a.username, used, limit: l.importPostsPerAccount, remaining: Math.max(0, l.importPostsPerAccount - used) };
    }));
    return { limitPerSocialAccount: l.importPostsPerAccount, socialAccounts, pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) } };
  },
});

async function usage(actor: Actor, metric: 'posts' | 'comments' | 'uploads') {
  const org = await prisma.organization.findUniqueOrThrow({ where: { id: actor.organizationId } });
  const limit = limitsFor(org)[metric];
  const used = await orgUsage(prisma, org, metric);
  // Siar extension: Free's allowance is one-time (resets: false); paid plans reset each month (UTC).
  return { used, limit, remaining: Math.max(0, limit - used), resets: !limitsFor(org).plan.oneTime };
}
