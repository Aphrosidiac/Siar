import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { createHash, timingSafeEqual } from 'node:crypto';
import { signupFields } from '../domain/traffic/channel.js';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { appUrl, config, googleSignInClient, isProd } from '../platform/config.js';
import { decrypt, encrypt, randomToken, sha256 } from '../platform/crypto.js';
import { prisma, type Db } from '../platform/db.js';
import { audit } from '../platform/audit.js';
import { SESSION_COOKIE, createSession, loadSessionUser, setSessionCookie, verifyPassword, type SessionUser } from '../platform/auth.js';
import { badRequest } from '../platform/errors.js';
import { rewriteForMock } from '../platform/networks.js';
import { redis } from '../platform/redis.js';
import { logger } from '../platform/logger.js';
import { queueMail } from '../platform/mail.js';
import { define } from '../platform/routes.js';
import { WELCOME_STEPS, createOrganization, isStaffEmail, norm, signInMethods } from './identity.js';

/**
 * "Continue with Google": OpenID Connect authorization code flow with PKCE (S256), state and nonce,
 * on a web OAuth client of its own (not the YouTube one). Raw routes, like the other OAuth plumbing.
 *
 *   GET /api/v1/auth/google/start?intent=signin|invite|link&from=login|signup&next=/path&invite=<token>&ticket=<link ticket>
 *   GET /api/v1/auth/google/callback   (Google redirects here: <APP_URL>/api/v1/auth/google/callback)
 *
 * The flow's secrets (state, nonce, PKCE verifier) travel in an encrypted, httpOnly cookie scoped to
 * /api/v1/auth/google that lives 10 minutes: the callback only accepts a state this browser started
 * (no login CSRF); the cookie is cleared once its state is presented (no replay), and a forged
 * callback with a wrong state leaves a real sign-in in progress alone. The ID token comes straight
 * from Google's token endpoint over TLS and is still verified in full: RS256 signature against
 * Google's published keys, issuer, audience, authorized party, expiry, nonce.
 *
 * Who signs in:
 *   1. a user already linked to this Google account (`sub`, which Google never reuses);
 *   2. else a user with the same, confirmed email, linked now, but only when Google is authoritative for
 *      the address (gmail.com, or a Google Workspace domain via `hd`). An account whose email was never
 *      confirmed is never linked (someone else may have registered the address): its owner recovers it
 *      with "Forgot password?", which only the mailbox can finish, then connects Google;
 *   3. else a new account (email confirmed by Google), with its own organization, onto /welcome.
 * Invitations accept with Google only for the invited address, and only where Google is authoritative.
 * Connecting Google from Your account needs the current password (a stolen session alone cannot add a
 * lasting way in) and a confirmed email; so does disconnecting it.
 */

const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const JWKS_URL = 'https://www.googleapis.com/oauth2/v3/certs';
const ISSUERS = ['https://accounts.google.com', 'accounts.google.com'];
const FLOW_COOKIE = 'siar_google';
const FLOW_PATH = '/api/v1/auth/google';
const FLOW_TTL_S = 600;
const LINK_TICKET_TTL_MS = 5 * 60_000;
/** Purpose tags inside the encrypted blobs, so one kind can never be replayed as another. */
const FLOW_KIND = 'siar.google.flow.v1';
const TICKET_KIND = 'siar.google.link.v1';
const SETTINGS = '/settings';
/** Starts per IP per minute. A person needs a handful; this only stops loops and abuse. */
const STARTS_PER_MINUTE = 30;

type Intent = 'signin' | 'link' | 'invite';
interface Flow { kind: typeof FLOW_KIND; state: string; nonce: string; verifier: string; intent: Intent; next: string | null; from: string; invite: string | null; uid: string | null; sid: string | null; exp: number }
interface LinkTicket { kind: typeof TICKET_KIND; uid: string; sid: string; exp: number }
export interface GoogleIdentity { sub: string; email: string; emailVerified: boolean; hd: string | null; givenName: string | null; familyName: string | null; name: string | null; picture: string | null }
type Invitation = NonNullable<Awaited<ReturnType<typeof openInvitation>>>;

/** Why a sign-in stopped. The code goes back to the page as ?error=<code>; the dashboard words it. */
export class FlowError extends Error { constructor(readonly code: string) { super(code); } }

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;
const googleKeys = () => (jwks ??= createRemoteJWKSet(new URL(rewriteForMock(JWKS_URL)), { timeoutDuration: 10_000, cooldownDuration: 30_000, cacheMaxAge: 6 * 3600_000 }));

/** A same-site path to land on afterwards: "/x", never "//host" or "/\host" (open redirect). */
export const safeNext = (v: unknown): string | null =>
  typeof v === 'string' && v.length <= 512 && /^\/(?![/\\])[^\s\\]*$/.test(v) ? v : null;

const b64url = (b: Buffer) => b.toString('base64url');
const safeEqual = (a: string, b: string) => { const x = Buffer.from(a); const y = Buffer.from(b); return x.length === y.length && timingSafeEqual(x, y); };
const withError = (path: string, code: string) => `${path}${path.includes('?') ? '&' : '?'}error=${encodeURIComponent(code)}`;
const back = (reply: FastifyReply, from: string, code: string) => reply.header('Cache-Control', 'no-store').redirect(appUrl(withError(from, code)), 302);
const seal = (v: object) => encrypt(JSON.stringify(v));
function unseal<T extends { kind: string; exp: number }>(blob: unknown, kind: T['kind']): T | null {
  if (typeof blob !== 'string' || !blob) return null;
  try { const v = JSON.parse(decrypt(blob)) as T; return v?.kind === kind && typeof v.exp === 'number' && v.exp > Date.now() ? v : null; } catch { return null; }
}

/** Google speaks for the address: its own mail (gmail.com) or a Workspace domain it hosts (`hd`). */
export const googleAuthoritative = (id: Pick<GoogleIdentity, 'email' | 'hd'>) =>
  /@(gmail|googlemail)\.com$/.test(id.email) || (!!id.hd && id.email.endsWith(`@${id.hd.toLowerCase()}`));

async function limited(ip: string) {
  const k = `rl:google-signin:${ip}:${Math.floor(Date.now() / 60_000)}`;
  try {
    const n = await redis.incr(k);
    if (n === 1) await redis.pexpire(k, 61_000);
    return n > STARTS_PER_MINUTE;
  } catch (err) {
    logger.warn({ err }, 'google sign-in: rate limiter unavailable; allowing the start');
    return false;
  }
}

async function openInvitation(token: unknown) {
  if (typeof token !== 'string' || !token) return null;
  const inv = await prisma.invitation.findUnique({ where: { tokenHash: sha256(token) }, include: { organization: true } });
  return inv && !inv.acceptedAt && !inv.revokedAt && inv.expiresAt > new Date() && !inv.organization.deletedAt ? inv : null;
}

/** Code → tokens at Google, then the ID token verified in full. */
async function exchange(code: string, flow: Flow): Promise<GoogleIdentity> {
  const client = googleSignInClient()!;
  const res = await fetch(rewriteForMock(TOKEN_URL), {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded', accept: 'application/json' },
    body: new URLSearchParams({ code, client_id: client.id, client_secret: client.secret, redirect_uri: appUrl(`${FLOW_PATH}/callback`), grant_type: 'authorization_code', code_verifier: flow.verifier }),
    signal: AbortSignal.timeout(15_000),
  });
  const body = await res.json().catch(() => ({})) as Record<string, unknown>;
  if (!res.ok || typeof body.id_token !== 'string') throw new Error(`Google token endpoint answered ${res.status} ${String(body.error ?? '')} ${String(body.error_description ?? '')}`.trim());
  const { payload: p } = await jwtVerify(body.id_token, googleKeys(), { issuer: ISSUERS, audience: client.id, algorithms: ['RS256'], clockTolerance: 60, requiredClaims: ['sub', 'exp', 'iat'] });
  if (typeof p.nonce !== 'string' || !safeEqual(p.nonce, flow.nonce)) throw new Error('ID token nonce does not match this sign-in');
  if (p.azp !== undefined && p.azp !== client.id) throw new Error('ID token was issued to another client (azp)');
  const str = (v: unknown, max = 200) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null);
  const email = str(p.email, 320);
  if (!email) throw new Error('ID token has no email (the email scope was not granted)');
  return {
    sub: String(p.sub), email: norm(email), emailVerified: p.email_verified === true || p.email_verified === 'true',
    hd: str(p.hd), givenName: str(p.given_name, 100), familyName: str(p.family_name, 100), name: str(p.name), picture: str(p.picture, 1000),
  };
}

const isUniqueViolation = (e: unknown) => (e as { code?: string })?.code === 'P2002';
/** Another request linked or created this person first: read again. */
class Raced extends Error {}

/** Security notices go out in the same transaction as the change, so a change is never left unannounced. */
const linkedNotice = (db: Db, to: string, googleEmail: string) => queueMail(db, {
  to, subject: 'Google sign-in was connected to your Siar account', kicker: 'Security', heading: 'Google sign-in connected.',
  paragraphs: ['This Siar account can now be signed in to with Google, as well as with its existing sign-in.'],
  details: [['Account', to], ['Google account', googleEmail]],
  footnote: 'Did not do this? Disconnect Google in Your account, reset your password and contact siaran@ffdev.studio.',
  reason: 'You received this email because the sign-in methods of this Siar account changed.',
});

/**
 * The welcome for a Google sign-up: the password sign-up's welcome without the confirm step (Google
 * already confirmed the address), in the same transaction as the account. Invited people get none:
 * their invitation was the welcome, as with a password.
 */
const welcomeMail = (db: Db, to: string, givenName: string | null) => queueMail(db, {
  to, subject: 'Welcome to Siar', kicker: 'Welcome', heading: givenName ? `Welcome to Siar, ${givenName}.` : 'Welcome to Siar.',
  preheader: 'Your account is ready. Here is how to get your first post out.',
  paragraphs: ['Your account is ready, and Google has already confirmed your email. Here is how to get your first post out.'],
  cta: { label: 'Open your dashboard', url: appUrl('/welcome') }, linkFallback: false,
  steps: WELCOME_STEPS,
  footnote: 'Want a password too? Set one in Your account, and you can sign in either way.',
  reason: 'You received this email because this address was used to create a Siar account with Google.',
});

async function joinOrganization(tx: Db, inv: Invitation, userId: string) {
  // acceptedAt: null in the filter: a second acceptance of the same link is a no-op, not a double join
  const claimed = await tx.invitation.updateMany({ where: { id: inv.id, acceptedAt: null, revokedAt: null }, data: { acceptedAt: new Date() } });
  if (!claimed.count) throw new FlowError('invite_invalid');
  await tx.organizationMember.upsert({ where: { organizationId_userId: { organizationId: inv.organizationId, userId } }, update: {}, create: { organizationId: inv.organizationId, userId, role: inv.role } });
  await audit(tx, { kind: 'USER', organizationId: inv.organizationId, name: inv.email, userId }, 'member.join', 'OrganizationMember', userId, `${inv.email} joined as ${inv.role.toLowerCase()} (with Google)`);
}

/**
 * The Siar user for a Google identity: linked, linked now by email, or created. With an invitation, a new
 * user is created and joined in one transaction (no half-made account if the invitation went away) and
 * gets no organization of their own, skipping the welcome like invited sign-ups with a password.
 */
export async function resolveGoogleUser(id: GoogleIdentity, opts: { invite?: Invitation; acquisition?: ReturnType<typeof signupFields> } = {}, attempt = 0): Promise<{ user: { id: string; email: string }; organizationId: string | null; created: boolean; joined: boolean }> {
  try {
    const linked = await prisma.user.findUnique({ where: { googleSub: id.sub } });
    if (linked) {
      if (linked.deletedAt) throw new FlowError('account_deleted');
      if (linked.googleEmail !== id.email) await prisma.user.update({ where: { id: linked.id }, data: { googleEmail: id.email } });
      return { user: linked, organizationId: null, created: false, joined: false };
    }

    const existing = await prisma.user.findUnique({ where: { email: id.email } });
    if (existing) {
      if (existing.deletedAt) throw new FlowError('account_deleted');
      if (existing.googleSub) throw new FlowError('google_other_account');
      if (!existing.emailVerified) throw new FlowError('google_unconfirmed_account');
      if (!googleAuthoritative(id)) throw new FlowError('google_link_required');
      await prisma.$transaction(async tx => {
        // googleSub: null in the filter: a concurrent link loses instead of overwriting
        const won = await tx.user.updateMany({ where: { id: existing.id, googleSub: null }, data: { googleSub: id.sub, googleEmail: id.email, googleLinkedAt: new Date() } });
        if (!won.count) throw new Raced();
        const m = await tx.organizationMember.findFirst({ where: { userId: existing.id, organization: { deletedAt: null } }, orderBy: { createdAt: 'asc' } });
        if (m) await audit(tx, { kind: 'USER', organizationId: m.organizationId, name: existing.email, userId: existing.id }, 'user.google.link', 'User', existing.id, `${existing.email} connected Google sign-in`);
        await linkedNotice(tx, existing.email, id.email);
      });
      return { user: existing, organizationId: null, created: false, joined: false };
    }

    const firstName = id.givenName ?? id.name?.split(/\s+/)[0] ?? null;
    const now = new Date();
    return await prisma.$transaction(async tx => {
      const user = await tx.user.create({
        data: {
          email: id.email, googleSub: id.sub, googleEmail: id.email, googleLinkedAt: now, emailVerified: now,
          firstName: firstName ?? id.email.split('@')[0].slice(0, 100), lastName: id.givenName ? id.familyName : null, avatarUrl: id.picture,
          role: isStaffEmail(id.email) && googleAuthoritative(id) ? 'ADMIN' : 'CUSTOMER',
          ...(opts.invite ? { onboardedAt: now } : {}),
          ...(opts.acquisition ?? {}),
        },
      });
      if (opts.invite) {
        await joinOrganization(tx, opts.invite, user.id);
        return { user, organizationId: opts.invite.organizationId, created: true, joined: true };
      }
      const org = await createOrganization(tx, user.id, `${user.firstName}'s organization`);
      await audit(tx, { kind: 'USER', organizationId: org.id, name: user.email, userId: user.id }, 'organization.create', 'Organization', org.id, `Created organization ${org.name} (signed up with Google)`);
      await welcomeMail(tx, user.email, id.givenName);
      return { user, organizationId: org.id as string, created: true, joined: false };
    });
  } catch (e) {
    // two callbacks for the same person at once: the loser reads what the winner wrote
    if ((isUniqueViolation(e) || e instanceof Raced) && attempt < 2) return resolveGoogleUser(id, opts, attempt + 1);
    throw e;
  }
}

async function firstOrganization(userId: string) {
  const m = await prisma.organizationMember.findFirst({ where: { userId, organization: { deletedAt: null } }, orderBy: { createdAt: 'asc' } });
  return m?.organizationId ?? null;
}

/** Replace whatever session this browser had with a fresh one for `userId` (fresh token: no fixation). */
async function signInAs(req: FastifyRequest, reply: FastifyReply, userId: string, organizationId: string | null) {
  const old = req.cookies?.[SESSION_COOKIE];
  if (old) await prisma.session.updateMany({ where: { id: sha256(old), revokedAt: null }, data: { revokedAt: new Date() } });
  setSessionCookie(reply, await createSession(userId, organizationId, req));
}

async function finishSignIn(req: FastifyRequest, reply: FastifyReply, flow: Flow, id: GoogleIdentity) {
  const r = await resolveGoogleUser(id, { acquisition: signupFields(req) });
  await signInAs(req, reply, r.user.id, r.organizationId ?? (await firstOrganization(r.user.id)));
  return appUrl(r.created ? '/welcome' : flow.next ?? '/posts');
}

async function finishInvite(req: FastifyRequest, reply: FastifyReply, flow: Flow, id: GoogleIdentity) {
  const inv = await openInvitation(flow.invite);
  if (!inv) throw new FlowError('invite_invalid');
  if (norm(inv.email) !== id.email) throw new FlowError('invite_email_mismatch');
  // an invitation can carry admin rights: Google must speak for the address, not just have verified it once
  if (!googleAuthoritative(id)) throw new FlowError('invite_use_password');
  const r = await resolveGoogleUser(id, { invite: inv, acquisition: signupFields(req) });
  if (!r.joined) await prisma.$transaction(tx => joinOrganization(tx, inv, r.user.id));
  await signInAs(req, reply, r.user.id, inv.organizationId);
  return appUrl(flow.next ?? '/posts');
}

async function finishLink(req: FastifyRequest, flow: Flow, id: GoogleIdentity) {
  const su = await loadSessionUser(req);
  if (!su || su.userId !== flow.uid || su.sessionId !== flow.sid) throw new FlowError('session_changed');
  const owner = await prisma.user.findUnique({ where: { googleSub: id.sub } });
  if (owner && owner.id !== su.userId) throw new FlowError('google_in_use');
  if (owner) return appUrl(`${SETTINGS}?google=linked`);
  const me = await prisma.user.findUniqueOrThrow({ where: { id: su.userId } });
  if (me.googleSub) throw new FlowError('google_already_linked');
  if (!me.emailVerified) throw new FlowError('confirm_email_first');
  try {
    await prisma.$transaction(async tx => {
      const won = await tx.user.updateMany({ where: { id: me.id, googleSub: null }, data: { googleSub: id.sub, googleEmail: id.email, googleLinkedAt: new Date() } });
      if (!won.count) throw new FlowError('google_already_linked');
      if (su.organizationId) await audit(tx, { kind: 'USER', organizationId: su.organizationId, name: su.name, userId: me.id }, 'user.google.link', 'User', me.id, `${me.email} connected Google sign-in (${id.email})`);
      await linkedNotice(tx, me.email, id.email);
    });
  } catch (e) {
    if (isUniqueViolation(e)) throw new FlowError('google_in_use');
    throw e;
  }
  return appUrl(`${SETTINGS}?google=linked`);
}

/** Changing how an account signs in needs the password again (with a confirmed email for connecting). */
async function stepUp(su: SessionUser, currentPassword: unknown) {
  const me = await prisma.user.findUniqueOrThrow({ where: { id: su.userId } });
  if (!me.passwordHash) throw badRequest('Set a password first. You can then connect or disconnect Google.');
  if (typeof currentPassword !== 'string' || !(await verifyPassword(currentPassword, me.passwordHash))) throw badRequest('Your password is incorrect.', [{ code: 'invalid', message: 'Incorrect password', path: ['currentPassword'] }]);
  return me;
}

define({
  /** Password checked → a five-minute ticket for this session, carried through the Google redirect. */
  'user.startGoogleLink': async ({ sessionUser, body }) => {
    const su = sessionUser as SessionUser;
    if (!googleSignInClient()) throw badRequest('Google sign-in is not available on this server.');
    const me = await stepUp(su, body.currentPassword);
    if (me.googleSub) throw badRequest('Google is already connected. Disconnect it first.');
    if (!me.emailVerified) throw badRequest('Confirm your email first: use the link we sent, or send it again from this page.');
    const ticket = seal({ kind: TICKET_KIND, uid: su.userId, sid: su.sessionId, exp: Date.now() + LINK_TICKET_TTL_MS } satisfies LinkTicket);
    return { url: `${FLOW_PATH}/start?${new URLSearchParams({ intent: 'link', ticket })}` };
  },

  /** Disconnect Google: password again, and only with a password left to sign in with (no lock-out). */
  'user.unlinkGoogle': async ({ sessionUser, body }) => {
    const su = sessionUser as SessionUser;
    const me = await stepUp(su, body?.currentPassword);
    if (!me.googleSub) return signInMethods(me.id);
    await prisma.$transaction(async tx => {
      await tx.user.update({ where: { id: me.id }, data: { googleSub: null, googleEmail: null, googleLinkedAt: null } });
      if (su.organizationId) await audit(tx, { kind: 'USER', organizationId: su.organizationId, name: su.name, userId: me.id }, 'user.google.unlink', 'User', me.id, `${me.email} disconnected Google sign-in`);
      await queueMail(tx, {
        to: me.email, subject: 'Google sign-in was disconnected from Siar', kicker: 'Security', heading: 'Google sign-in disconnected.',
        paragraphs: ['Google can no longer be used to sign in to this Siar account. Your email and password still work.'],
        details: [['Account', me.email], ['Google account', me.googleEmail ?? 'Google']],
        footnote: 'Did not do this? Reset your password straight away and contact siaran@ffdev.studio.',
        reason: 'You received this email because the sign-in methods of this Siar account changed.',
      });
    });
    return signInMethods(me.id);
  },
}, { sessionOnly: true });

export async function googleSignInRawRoutes(app: FastifyInstance) {
  const appHost = new URL(config.APP_URL).hostname;

  app.get(`${FLOW_PATH}/start`, async (req: FastifyRequest<{ Querystring: Record<string, string | undefined> }>, reply) => {
    const q = req.query ?? {};
    const intent: Intent = q.intent === 'link' || q.intent === 'invite' ? q.intent : 'signin';
    const from = intent === 'link' ? SETTINGS
      : intent === 'invite' ? `/accept-invite?token=${encodeURIComponent(q.invite ?? '')}`
      : q.from === 'signup' ? '/signup' : '/login';
    const client = googleSignInClient();
    if (!client) return back(reply, from, 'google_unavailable');
    // the flow cookie must be set on the host Google sends the browser back to
    if (isProd && req.hostname !== appHost) return reply.redirect(appUrl(req.url), 302);
    if (await limited(req.ip)) return back(reply, from, 'google_rate_limited');

    let uid: string | null = null;
    let sid: string | null = null;
    let loginHint: string | null = null;
    if (intent === 'link') {
      const su = await loadSessionUser(req).catch(() => null);
      if (!su) return reply.redirect(appUrl(`/login?next=${encodeURIComponent(SETTINGS)}`), 302);
      const t = unseal<LinkTicket>(q.ticket, TICKET_KIND);
      if (!t || t.uid !== su.userId || t.sid !== su.sessionId) return back(reply, from, 'link_ticket_invalid');
      uid = su.userId; sid = su.sessionId;
    }
    if (intent === 'invite') {
      const inv = await openInvitation(q.invite);
      if (!inv) return back(reply, from, 'invite_invalid');
      loginHint = inv.email;
    }

    const flow: Flow = { kind: FLOW_KIND, state: randomToken(32), nonce: randomToken(32), verifier: randomToken(48), intent, next: safeNext(q.next), from, invite: intent === 'invite' ? q.invite ?? null : null, uid, sid, exp: Date.now() + FLOW_TTL_S * 1000 };
    reply.setCookie(FLOW_COOKIE, seal(flow), { path: FLOW_PATH, httpOnly: true, secure: isProd, sameSite: 'lax', maxAge: FLOW_TTL_S });
    const u = new URL(AUTH_URL);
    u.search = new URLSearchParams({
      client_id: client.id, redirect_uri: appUrl(`${FLOW_PATH}/callback`), response_type: 'code', scope: 'openid email profile',
      state: flow.state, nonce: flow.nonce, code_challenge: b64url(createHash('sha256').update(flow.verifier).digest()), code_challenge_method: 'S256',
      prompt: 'select_account', ...(loginHint ? { login_hint: loginHint } : {}),
    }).toString();
    return reply.header('Cache-Control', 'no-store').redirect(rewriteForMock(u.toString()), 302);
  });

  app.get(`${FLOW_PATH}/callback`, async (req: FastifyRequest<{ Querystring: Record<string, string | undefined> }>, reply) => {
    const q = req.query ?? {};
    const clear = () => reply.clearCookie(FLOW_COOKIE, { path: FLOW_PATH, httpOnly: true, secure: isProd, sameSite: 'lax' });
    const flow = unseal<Flow>(req.cookies?.[FLOW_COOKIE], FLOW_KIND);
    if (!flow) { clear(); return back(reply, '/login', 'google_expired'); }
    // a wrong state is not this browser's sign-in (a forged or stale link): leave the real one in progress
    if (typeof q.state !== 'string' || !safeEqual(q.state, flow.state)) return back(reply, flow.from, 'google_expired');
    clear();
    if (q.error) return back(reply, flow.from, q.error === 'access_denied' ? 'google_cancelled' : 'google_failed');
    if (typeof q.code !== 'string' || !q.code) return back(reply, flow.from, 'google_failed');

    let id: GoogleIdentity;
    try { id = await exchange(q.code, flow); } catch (err) {
      logger.warn({ err: { message: (err as Error).message } }, 'google sign-in: code exchange or ID token check failed');
      return back(reply, flow.from, 'google_failed');
    }
    if (!id.emailVerified) return back(reply, flow.from, 'google_unverified');

    try {
      const to = flow.intent === 'link' ? await finishLink(req, flow, id)
        : flow.intent === 'invite' ? await finishInvite(req, reply, flow, id)
        : await finishSignIn(req, reply, flow, id);
      return reply.header('Cache-Control', 'no-store').redirect(to, 302);
    } catch (e) {
      if (e instanceof FlowError) return back(reply, flow.from, e.code);
      logger.error({ err: e }, 'google sign-in failed');
      return back(reply, flow.from, 'google_failed');
    }
  });
}
