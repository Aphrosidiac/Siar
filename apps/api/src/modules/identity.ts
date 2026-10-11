import { appUrl, config } from '../platform/config.js';
import { randomToken, sha256 } from '../platform/crypto.js';
import { prisma } from '../platform/db.js';
import { audit } from '../platform/audit.js';
import { badRequest, conflict, forbidden, notFound, unauthenticated } from '../platform/errors.js';
import { listOf, pageOf } from '../platform/http.js';
import { queueMail } from '../platform/mail.js';
import { clearSessionCookie, createSession, hashPassword, newApiKey, apiKeyPrefix, requirePermission, setSessionCookie, verifyPassword, type SessionUser } from '../platform/auth.js';
import { define } from '../platform/routes.js';
import * as S from '../domain/serialize.js';
import { RESOURCE_LIMITS } from '../domain/plans.js';

const norm = (e: string) => e.trim().toLowerCase();
const staff = new Set(config.STAFF_EMAILS.split(',').map(s => norm(s)).filter(Boolean));

async function sessionPayload(userId: string, currentOrganizationId: string | null) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const ms = await prisma.organizationMember.findMany({ where: { userId, organization: { deletedAt: null } }, include: { organization: true }, orderBy: { createdAt: 'asc' } });
  const current = ms.find(m => m.organizationId === currentOrganizationId)?.organizationId ?? ms[0]?.organizationId ?? null;
  return {
    user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, avatarUrl: user.avatarUrl, timezone: user.timezone, emailVerifiedAt: user.emailVerified?.toISOString() ?? null, createdAt: user.createdAt.toISOString(), isStaff: user.role === 'ADMIN' },
    memberships: ms.map(m => ({ id: m.id, organizationId: m.organizationId, organizationName: m.organization.name ?? 'Organization', role: m.role, tier: m.organization.tier })),
    currentOrganizationId: current,
  };
}

/** A new organization with its owner, a credit account and (per PLAN D4) a trial of Pro. */
async function createOrganization(tx: any, userId: string, name: string) {
  const org = await tx.organization.create({ data: { name, createdById: userId, trialEndsAt: null } });
  await tx.organizationMember.create({ data: { organizationId: org.id, userId, role: 'OWNER' } });
  await tx.creditAccount.create({ data: { organizationId: org.id } });
  return org;
}

async function sendVerification(userId: string, email: string) {
  const token = randomToken();
  await prisma.authToken.create({ data: { id: sha256(token), kind: 'VERIFY_EMAIL', userId, expiresAt: new Date(Date.now() + 3 * 86400_000) } });
  await queueMail(prisma, { to: email, subject: 'Confirm your email for Siar', heading: 'Confirm your email', paragraphs: ['Confirm this address to keep receiving publishing alerts and invoices from Siar.'], cta: { label: 'Confirm email', url: appUrl(`/verify-email?token=${token}`) }, footnote: 'The link works for 3 days. If you did not sign up for Siar, ignore this email.' });
}

define({
  'auth.signup': async ({ body, req, reply }) => {
    const email = norm(body.email);
    if (await prisma.user.findUnique({ where: { email } })) throw conflict('An account with this email already exists. Sign in instead.');
    const out = await prisma.$transaction(async tx => {
      const user = await tx.user.create({ data: { email, passwordHash: await hashPassword(body.password), firstName: body.firstName, lastName: body.lastName ?? null, role: staff.has(email) ? 'ADMIN' : 'CUSTOMER' } });
      const org = await createOrganization(tx, user.id, body.organizationName?.trim() || `${body.firstName}'s organization`);
      await audit(tx, { kind: 'USER', organizationId: org.id, name: email, userId: user.id }, 'organization.create', 'Organization', org.id, `Created organization ${org.name}`);
      return { user, org };
    });
    await sendVerification(out.user.id, email);
    setSessionCookie(reply, await createSession(out.user.id, out.org.id, req));
    return sessionPayload(out.user.id, out.org.id);
  },

  'auth.login': async ({ body, req, reply }) => {
    const user = await prisma.user.findUnique({ where: { email: norm(body.email) } });
    if (!user || user.deletedAt || !user.passwordHash || !(await verifyPassword(body.password, user.passwordHash))) throw unauthenticated('Email or password is incorrect.');
    const first = await prisma.organizationMember.findFirst({ where: { userId: user.id, organization: { deletedAt: null } }, orderBy: { createdAt: 'asc' } });
    setSessionCookie(reply, await createSession(user.id, first?.organizationId ?? null, req));
    return sessionPayload(user.id, first?.organizationId ?? null);
  },

  'auth.logout': async ({ req, reply }) => {
    const raw = req.cookies?.siar_session;
    if (raw) await prisma.session.updateMany({ where: { id: sha256(raw) }, data: { revokedAt: new Date() } });
    clearSessionCookie(reply);
    return { success: true };
  },

  'auth.verifyEmail': async ({ body }) => {
    const t = await prisma.authToken.findUnique({ where: { id: sha256(body.token) } });
    if (!t || t.kind !== 'VERIFY_EMAIL' || t.usedAt || t.expiresAt < new Date()) throw badRequest('This confirmation link has expired or was already used. Request a new one from your profile.');
    await prisma.$transaction([prisma.authToken.update({ where: { id: t.id }, data: { usedAt: new Date() } }), prisma.user.update({ where: { id: t.userId }, data: { emailVerified: new Date() } })]);
    return { success: true };
  },

  'auth.forgotPassword': async ({ body }) => {
    const user = await prisma.user.findUnique({ where: { email: norm(body.email) } });
    // Same answer whether or not the account exists — no account enumeration.
    if (user && !user.deletedAt) {
      const token = randomToken();
      await prisma.authToken.create({ data: { id: sha256(token), kind: 'RESET_PASSWORD', userId: user.id, expiresAt: new Date(Date.now() + 3600_000) } });
      await queueMail(prisma, { to: user.email, subject: 'Reset your Siar password', heading: 'Reset your password', paragraphs: ['Someone (hopefully you) asked to reset the password for this Siar account.'], cta: { label: 'Choose a new password', url: appUrl(`/reset-password?token=${token}`) }, footnote: 'The link works for one hour. If you did not ask for this, your password is unchanged.' });
    }
    return { success: true };
  },

  'auth.resetPassword': async ({ body }) => {
    const t = await prisma.authToken.findUnique({ where: { id: sha256(body.token) } });
    if (!t || t.kind !== 'RESET_PASSWORD' || t.usedAt || t.expiresAt < new Date()) throw badRequest('This reset link has expired or was already used. Request a new one.');
    await prisma.$transaction([
      prisma.authToken.update({ where: { id: t.id }, data: { usedAt: new Date() } }),
      prisma.user.update({ where: { id: t.userId }, data: { passwordHash: await hashPassword(body.password), emailVerified: new Date() } }),
      prisma.session.updateMany({ where: { userId: t.userId, revokedAt: null }, data: { revokedAt: new Date() } }),
    ]);
    return { success: true };
  },

  'user.acceptInvitation': async ({ body, req, reply }) => {
    const inv = await prisma.invitation.findUnique({ where: { tokenHash: sha256(body.token) }, include: { organization: true } });
    if (!inv || inv.acceptedAt || inv.revokedAt || inv.expiresAt < new Date() || inv.organization.deletedAt) throw badRequest('This invitation has expired or was revoked. Ask for a new one.');
    let user = await prisma.user.findUnique({ where: { email: inv.email } });
    if (!user) {
      if (!body.password || String(body.password).length < 10) throw badRequest('Choose a password of at least 10 characters.', [{ code: 'too_short', message: 'At least 10 characters', path: ['password'] }]);
      user = await prisma.user.create({ data: { email: inv.email, passwordHash: await hashPassword(body.password), firstName: body.firstName ?? null, emailVerified: new Date() } });
    }
    const uid = user.id;
    await prisma.$transaction(async tx => {
      await tx.organizationMember.upsert({ where: { organizationId_userId: { organizationId: inv.organizationId, userId: uid } }, update: {}, create: { organizationId: inv.organizationId, userId: uid, role: inv.role } });
      await tx.invitation.update({ where: { id: inv.id }, data: { acceptedAt: new Date() } });
      await audit(tx, { kind: 'USER', organizationId: inv.organizationId, name: inv.email, userId: uid }, 'member.join', 'OrganizationMember', uid, `${inv.email} joined as ${inv.role.toLowerCase()}`);
    });
    setSessionCookie(reply, await createSession(uid, inv.organizationId, req));
    return sessionPayload(uid, inv.organizationId);
  },
});

define({
  'auth.me': async ({ sessionUser }) => sessionPayload(sessionUser!.userId, sessionUser!.organizationId),

  'auth.resendVerification': async ({ sessionUser }) => {
    const u = await prisma.user.findUniqueOrThrow({ where: { id: sessionUser!.userId } });
    if (u.emailVerified) return { success: true };
    await sendVerification(u.id, u.email);
    return { success: true };
  },

  'auth.switchOrganization': async ({ sessionUser, body }) => {
    const su = sessionUser as SessionUser;
    const m = await prisma.organizationMember.findUnique({ where: { organizationId_userId: { organizationId: body.organizationId, userId: su.userId } } });
    if (!m && !su.isStaff) throw forbidden('You are not a member of this organization.');
    await prisma.session.update({ where: { id: su.sessionId }, data: { organizationId: body.organizationId } });
    return sessionPayload(su.userId, body.organizationId);
  },

  'user.me': async ({ sessionUser }) => {
    const u = await prisma.user.findUniqueOrThrow({ where: { id: sessionUser!.userId } });
    return { id: u.id, email: u.email, firstName: u.firstName, lastName: u.lastName, avatarUrl: u.avatarUrl, timezone: u.timezone, emailVerifiedAt: u.emailVerified?.toISOString() ?? null, createdAt: u.createdAt.toISOString() };
  },

  'user.updateMe': async ({ sessionUser, body }) => {
    const data: Record<string, unknown> = {};
    for (const k of ['firstName', 'lastName', 'timezone', 'avatarUrl'] as const) if (k in body) data[k] = body[k];
    if (data.timezone) { try { new Intl.DateTimeFormat('en', { timeZone: String(data.timezone) }); } catch { throw badRequest('Unknown timezone.', [{ code: 'invalid', message: 'Use an IANA timezone like Asia/Kuala_Lumpur', path: ['timezone'] }]); } }
    const u = await prisma.user.update({ where: { id: sessionUser!.userId }, data });
    return { id: u.id, email: u.email, firstName: u.firstName, lastName: u.lastName, avatarUrl: u.avatarUrl, timezone: u.timezone, emailVerifiedAt: u.emailVerified?.toISOString() ?? null, createdAt: u.createdAt.toISOString() };
  },

  'user.changePassword': async ({ sessionUser, body }) => {
    const u = await prisma.user.findUniqueOrThrow({ where: { id: sessionUser!.userId } });
    if (!u.passwordHash || !(await verifyPassword(body.currentPassword, u.passwordHash))) throw badRequest('Your current password is incorrect.', [{ code: 'invalid', message: 'Incorrect password', path: ['currentPassword'] }]);
    await prisma.$transaction([
      prisma.user.update({ where: { id: u.id }, data: { passwordHash: await hashPassword(body.newPassword) } }),
      prisma.session.updateMany({ where: { userId: u.id, revokedAt: null, id: { not: sessionUser!.sessionId } }, data: { revokedAt: new Date() } }),
    ]);
    return { success: true };
  },

  'organization.create': async ({ sessionUser, body }) => {
    const org = await prisma.$transaction(tx => createOrganization(tx, sessionUser!.userId, body.name.trim()));
    await prisma.session.update({ where: { id: sessionUser!.sessionId }, data: { organizationId: org.id } });
    return { id: org.id, organizationId: org.id, organizationName: org.name, role: 'OWNER' };
  },
}, { sessionOnly: true });

// ───────────────────────── organization (API) ─────────────────────────

define({
  'organization.getOrganization': async ({ actor }) => {
    const o = await prisma.organization.findUniqueOrThrow({ where: { id: actor.organizationId }, include: { createdBy: true, subscription: true } });
    return S.organization(o, { createdBy: o.createdBy, subscription: o.subscription });
  },

  'organization.updateSettings': async ({ actor, body }) => {
    requirePermission(actor, 'org.settings');
    const map: Record<string, string> = { name: 'name', uploadsCompression: 'uploadsCompressionEnabled', verboseErrors: 'showVerboseErrors', remoteDisconnectChecks: 'disconnectCheckEnabled', deleteDisconnectedAfterHours: 'deleteAccountAfter', portalBrandName: 'portalBrandName', portalLogoUrl: 'portalLogoUrl', portalAccentColor: 'portalAccentColor' };
    const data: Record<string, unknown> = {};
    for (const [k, col] of Object.entries(map)) if (k in body) data[col] = body[k];
    if (data.portalAccentColor && !/^#[0-9a-f]{6}$/i.test(String(data.portalAccentColor))) throw badRequest('Accent colour must be a hex colour like #D9FF43.');
    const o = await prisma.$transaction(async tx => {
      const o = await tx.organization.update({ where: { id: actor.organizationId }, data });
      await audit(tx, actor, 'organization.update', 'Organization', o.id, 'Updated organization settings', data);
      return o;
    });
    return S.organization(o);
  },

  'organization.delete': async ({ actor, body }) => {
    requirePermission(actor, 'org.delete');
    const o = await prisma.organization.findUniqueOrThrow({ where: { id: actor.organizationId }, include: { subscription: true } });
    if ((o.name ?? '') !== body.confirmName) throw badRequest('Type the organization name exactly to confirm.', [{ code: 'mismatch', message: 'Name does not match', path: ['confirmName'] }]);
    if (o.subscription && ['active', 'trialing', 'past_due'].includes(o.subscription.status) && !o.subscription.cancelAtPeriodEnd) throw badRequest('Cancel the subscription in Billing before deleting the organization.');
    await prisma.$transaction(async tx => {
      await tx.organization.update({ where: { id: o.id }, data: { deletedAt: new Date() } });
      await tx.apiKey.updateMany({ where: { organizationId: o.id, revokedAt: null }, data: { revokedAt: new Date() } });
      await tx.socialAccount.updateMany({ where: { team: { organizationId: o.id }, deletedAt: null }, data: { deletedAt: new Date(), state: 'DISCONNECTED' } });
      await tx.post.updateMany({ where: { organizationId: o.id, status: { in: ['SCHEDULED', 'DRAFT'] } }, data: { status: 'DELETED', deletedAt: new Date() } });
      await audit(tx, actor, 'organization.delete', 'Organization', o.id, `Deleted organization ${o.name}`);
    });
    return { success: true };
  },

  'organization.auditLog': async ({ actor, query }) => {
    requirePermission(actor, 'members');
    const p = pageOf(query);
    const [rows, total] = await Promise.all([
      prisma.auditLog.findMany({ where: { organizationId: actor.organizationId }, orderBy: { createdAt: 'desc' }, ...p }),
      prisma.auditLog.count({ where: { organizationId: actor.organizationId } }),
    ]);
    return listOf(rows.map(r => ({ id: r.id, actorType: r.actorType, actorName: r.actorName, action: r.action, entity: r.entity, entityId: r.entityId, summary: r.summary, createdAt: r.createdAt.toISOString() })), total);
  },

  // ── members ──
  'user.members': async ({ actor, query }) => {
    const p = pageOf(query);
    const where = { organizationId: actor.organizationId };
    const [rows, total] = await Promise.all([prisma.organizationMember.findMany({ where, include: { user: true }, orderBy: { createdAt: 'asc' }, ...p }), prisma.organizationMember.count({ where })]);
    return listOf(rows.map(m => ({ id: m.id, userId: m.userId, email: m.user.email, firstName: m.user.firstName, lastName: m.user.lastName, role: m.role, createdAt: m.createdAt.toISOString() })), total);
  },

  'user.updateMember': async ({ actor, params, body }) => {
    requirePermission(actor, 'members');
    const m = await prisma.organizationMember.findFirst({ where: { id: params.id, organizationId: actor.organizationId }, include: { user: true } });
    if (!m) throw notFound('Member');
    if (body.role === 'OWNER' && actor.role !== 'OWNER') throw forbidden('Only an owner can make someone an owner.');
    if (m.role === 'OWNER' && body.role !== 'OWNER') {
      const owners = await prisma.organizationMember.count({ where: { organizationId: actor.organizationId, role: 'OWNER' } });
      if (owners <= 1) throw badRequest('An organization needs at least one owner. Make someone else an owner first.');
      if (actor.role !== 'OWNER') throw forbidden('Only an owner can change another owner.');
    }
    const u = await prisma.$transaction(async tx => {
      const u = await tx.organizationMember.update({ where: { id: m.id }, data: { role: body.role } });
      await audit(tx, actor, 'member.role', 'OrganizationMember', m.id, `Changed ${m.user.email} to ${body.role.toLowerCase()}`);
      return u;
    });
    return { id: u.id, userId: u.userId, email: m.user.email, firstName: m.user.firstName, lastName: m.user.lastName, role: u.role, createdAt: u.createdAt.toISOString() };
  },

  'user.removeMember': async ({ actor, params }) => {
    const m = await prisma.organizationMember.findFirst({ where: { id: params.id, organizationId: actor.organizationId }, include: { user: true } });
    if (!m) throw notFound('Member');
    const self = actor.kind === 'USER' && m.userId === actor.userId;
    if (!self) requirePermission(actor, 'members');
    if (m.role === 'OWNER') {
      const owners = await prisma.organizationMember.count({ where: { organizationId: actor.organizationId, role: 'OWNER' } });
      if (owners <= 1) throw badRequest('The last owner cannot leave. Transfer ownership or delete the organization.');
      if (!self && actor.role !== 'OWNER') throw forbidden('Only an owner can remove an owner.');
    }
    await prisma.$transaction(async tx => {
      await tx.organizationMember.delete({ where: { id: m.id } });
      await tx.session.updateMany({ where: { userId: m.userId, organizationId: actor.organizationId }, data: { organizationId: null } });
      await audit(tx, actor, 'member.remove', 'OrganizationMember', m.id, self ? `${m.user.email} left` : `Removed ${m.user.email}`);
    });
    return { success: true };
  },

  'user.invitations': async ({ actor }) => {
    const rows = await prisma.invitation.findMany({ where: { organizationId: actor.organizationId, acceptedAt: null, revokedAt: null, expiresAt: { gt: new Date() } }, orderBy: { createdAt: 'desc' } });
    return listOf(rows.map(i => ({ id: i.id, email: i.email, role: i.role, expiresAt: i.expiresAt.toISOString(), createdAt: i.createdAt.toISOString() })), rows.length);
  },

  'user.invite': async ({ actor, body }) => {
    requirePermission(actor, 'members');
    if (body.role === 'OWNER' && actor.role !== 'OWNER') throw forbidden('Only an owner can invite another owner.');
    const email = norm(body.email);
    const existing = await prisma.organizationMember.findFirst({ where: { organizationId: actor.organizationId, user: { email } } });
    if (existing) throw conflict(`${email} is already a member.`);
    const org = await prisma.organization.findUniqueOrThrow({ where: { id: actor.organizationId } });
    const token = randomToken();
    const inv = await prisma.$transaction(async tx => {
      await tx.invitation.updateMany({ where: { organizationId: actor.organizationId, email, acceptedAt: null, revokedAt: null }, data: { revokedAt: new Date() } });
      const inv = await tx.invitation.create({ data: { organizationId: actor.organizationId, email, role: body.role, tokenHash: sha256(token), invitedById: actor.userId, expiresAt: new Date(Date.now() + 7 * 86400_000) } });
      await queueMail(tx, { to: email, subject: `You're invited to ${org.name} on Siar`, heading: `Join ${org.name} on Siar`, paragraphs: [`${actor.name} invited you to ${org.name} as ${body.role.toLowerCase()}. Siar is where the team schedules and publishes to social networks.`], cta: { label: 'Accept invitation', url: appUrl(`/accept-invite?token=${token}`) }, footnote: 'The invitation is valid for 7 days.' });
      await audit(tx, actor, 'member.invite', 'Invitation', inv.id, `Invited ${email} as ${body.role.toLowerCase()}`);
      return inv;
    });
    return { id: inv.id, email: inv.email, role: inv.role, expiresAt: inv.expiresAt.toISOString(), createdAt: inv.createdAt.toISOString() };
  },

  'user.revokeInvitation': async ({ actor, params }) => {
    requirePermission(actor, 'members');
    const r = await prisma.invitation.updateMany({ where: { id: params.id, organizationId: actor.organizationId, acceptedAt: null }, data: { revokedAt: new Date() } });
    if (!r.count) throw notFound('Invitation');
    return { success: true };
  },

  // ── API keys ──
  'apiKey.list': async ({ actor, query }) => {
    requirePermission(actor, 'apiKeys');
    const p = pageOf(query);
    const where = { organizationId: actor.organizationId, revokedAt: null, ...(query.q ? { name: { contains: String(query.q), mode: 'insensitive' as const } } : {}) };
    const [rows, total] = await Promise.all([prisma.apiKey.findMany({ where, orderBy: { createdAt: 'desc' }, ...p }), prisma.apiKey.count({ where })]);
    return listOf(rows.map(k => ({ id: k.id, name: k.name, prefix: k.prefix, lastUsedAt: k.lastUsedAt?.toISOString() ?? null, createdAt: k.createdAt.toISOString() })), total);
  },

  'apiKey.create': async ({ actor, body }) => {
    requirePermission(actor, 'apiKeys');
    const count = await prisma.apiKey.count({ where: { organizationId: actor.organizationId, revokedAt: null } });
    if (count >= RESOURCE_LIMITS.apiKeys) throw forbidden(`API keys limit reached. Limit is ${RESOURCE_LIMITS.apiKeys} keys.`);
    const key = newApiKey();
    const k = await prisma.$transaction(async tx => {
      const k = await tx.apiKey.create({ data: { organizationId: actor.organizationId, name: body.name.trim(), prefix: apiKeyPrefix(key), hash: sha256(key), createdById: actor.userId } });
      await audit(tx, actor, 'apiKey.create', 'ApiKey', k.id, `Created API key "${k.name}"`);
      return k;
    });
    return { id: k.id, name: k.name, prefix: k.prefix, key, createdAt: k.createdAt.toISOString() };
  },

  'apiKey.delete': async ({ actor, params }) => {
    requirePermission(actor, 'apiKeys');
    const k = await prisma.apiKey.findFirst({ where: { id: params.id, organizationId: actor.organizationId, revokedAt: null } });
    if (!k) throw notFound('API key');
    await prisma.$transaction(async tx => {
      await tx.apiKey.update({ where: { id: k.id }, data: { revokedAt: new Date() } });
      await audit(tx, actor, 'apiKey.delete', 'ApiKey', k.id, `Deleted API key "${k.name}"`);
    });
    return { success: true };
  },

  'apiKey.roll': async ({ actor, params }) => {
    requirePermission(actor, 'apiKeys');
    const k = await prisma.apiKey.findFirst({ where: { id: params.id, organizationId: actor.organizationId, revokedAt: null } });
    if (!k) throw notFound('API key');
    const key = newApiKey();
    const nk = await prisma.$transaction(async tx => {
      await tx.apiKey.update({ where: { id: k.id }, data: { revokedAt: new Date() } });
      const nk = await tx.apiKey.create({ data: { organizationId: actor.organizationId, name: k.name, prefix: apiKeyPrefix(key), hash: sha256(key), createdById: actor.userId } });
      await audit(tx, actor, 'apiKey.roll', 'ApiKey', nk.id, `Rolled API key "${k.name}"`);
      return nk;
    });
    return { id: nk.id, name: nk.name, prefix: nk.prefix, key, createdAt: nk.createdAt.toISOString() };
  },
});
