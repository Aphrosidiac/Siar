/**
 * "Continue with Google" end to end, against a live dev API + the mock Google (pnpm --filter @siar/api e2e:google).
 * Every path through modules/google-signin.ts: sign-up, return, linking by email (and when it must not),
 * unconfirmed accounts, connecting from settings behind a password, disconnecting, setting a password,
 * invitations, a deleted account, tampered ID tokens, CSRF/replay/open-redirect guards, a race and the
 * start rate limit. Exits non-zero on the first failure.
 */
import { prisma } from '../src/platform/db.js';
import { redis } from '../src/platform/redis.js';
import { hashPassword } from '../src/platform/auth.js';

const API = process.env.API ?? 'http://localhost:3290';
const MOCK = process.env.MOCK ?? 'http://127.0.0.1:3299';
const RUN = Date.now().toString(36);
let passed = 0;

function ok(cond: unknown, msg: string): asserts cond {
  if (!cond) { console.error(`✗ ${msg}`); process.exit(1); }
  passed++; console.log(`✓ ${msg}`);
}

const cookieOf = (res: Response, name: string) => res.headers.getSetCookie().map(c => c.split(';')[0]).find(c => c.startsWith(`${name}=`) && c.length > name.length + 1) ?? null;

async function call(method: string, path: string, session: string | null, body?: unknown) {
  const headers: Record<string, string> = { 'x-siar': '1' };
  if (session) headers.cookie = session;
  if (body !== undefined) headers['content-type'] = 'application/json';
  const res = await fetch(API + path, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined, redirect: 'manual' });
  const text = await res.text();
  let json: any = null; try { json = text ? JSON.parse(text) : null; } catch { json = text; }
  return { status: res.status, json, session: cookieOf(res, 'siar_session') };
}

interface Who { sub: string; email: string; email_verified?: boolean | string; hd?: string; name?: string; given_name?: string; family_name?: string; picture?: string; deny?: boolean; tamper?: string }
const sub = (n: string) => `${RUN}${n}`.padEnd(21, '0');
const clearLimit = () => { const m = Math.floor(Date.now() / 60_000); return redis.del(...['127.0.0.1', '::1', '::ffff:127.0.0.1'].map(ip => `rl:google-signin:${ip}:${m}`)); };
const nextIdentity = (who: Who) => fetch(`${MOCK}/__host/accounts.google.com/__mock/next-identity`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(who) });

/** start → Google (mock): the callback URL Google would send the browser to, plus this browser's flow cookie. */
async function begin(o: { intent?: 'signin' | 'link' | 'invite'; next?: string; from?: string; invite?: string; ticket?: string; startPath?: string; session?: string | null; who?: Who }) {
  await clearLimit();
  if (o.who) await nextIdentity(o.who);
  const qs = new URLSearchParams(Object.entries({ intent: o.intent, next: o.next, from: o.from, invite: o.invite, ticket: o.ticket }).filter(([, v]) => v !== undefined) as [string, string][]);
  const start = await fetch(API + (o.startPath ?? `/api/v1/auth/google/start?${qs}`), { redirect: 'manual', headers: o.session ? { cookie: o.session } : {} });
  const toGoogle = start.headers.get('location')!;
  if (!toGoogle.startsWith(MOCK)) return { start, early: new URL(toGoogle) };
  const consent = await fetch(toGoogle, { redirect: 'manual' });
  return { start, flow: cookieOf(start, 'siar_google'), cb: new URL(consent.headers.get('location')!) };
}
async function finish(cb: URL, cookies: (string | null | undefined)[]) {
  const c = cookies.filter(Boolean).join('; ');
  const done = await fetch(`${API}${cb.pathname}${cb.search}`, { redirect: 'manual', headers: c ? { cookie: c } : {} });
  return { done, landed: new URL(done.headers.get('location')!), session: cookieOf(done, 'siar_session') };
}
/** The whole browser round trip. */
async function google(o: Parameters<typeof begin>[0] & { tamper?: (cb: URL) => void; flowCookie?: 'drop' } = {}) {
  const b = await begin(o);
  if (b.early) return { landed: b.early, session: null as string | null, start: b.start, cb: null as URL | null, flow: null as string | null, done: null as Response | null };
  o.tamper?.(b.cb!);
  const f = await finish(b.cb!, [o.flowCookie === 'drop' ? null : b.flow, o.session]);
  return { ...f, start: b.start, cb: b.cb! as URL | null, flow: b.flow as string | null };
}
const errorOf = (u: URL) => u.searchParams.get('error');
const users = (email: string) => prisma.user.count({ where: { email } });

async function main() {
  await fetch(`${MOCK}/__reset`, { method: 'POST' });
  const providers = await call('GET', '/api/v1/auth/providers', null);
  ok(providers.status === 200 && providers.json.google === true, 'providers lists Google as available');

  // ── 1. new account with Google ───────────────────────────────────────
  const alice: Who = { sub: sub('a'), email: `alice.${RUN}@gmail.com`, given_name: 'Alice', family_name: 'Tan', name: 'Alice Tan', picture: 'https://lh3.googleusercontent.example/a/alice' };
  const s1 = await google({ from: 'signup', who: alice });
  ok(s1.start.status === 302 && s1.flow, 'start sets the flow cookie and redirects to Google');
  const authz = new URL((await fetch(`${API}/api/v1/auth/google/start`, { redirect: 'manual' })).headers.get('location')!);
  ok(authz.searchParams.get('code_challenge_method') === 'S256' && authz.searchParams.get('code_challenge') && authz.searchParams.get('nonce') && authz.searchParams.get('state') && authz.searchParams.get('scope') === 'openid email profile' && authz.searchParams.get('response_type') === 'code' && authz.searchParams.get('prompt') === 'select_account', 'authorize request: PKCE S256, state, nonce, only openid email profile, account chooser');
  ok(s1.landed.pathname === '/welcome' && s1.session, 'a new Google user lands on /welcome, signed in');
  const me1 = await call('GET', '/api/v1/auth/me', s1.session);
  ok(me1.json.user.email === alice.email && me1.json.user.emailVerifiedAt && me1.json.user.firstName === 'Alice' && me1.json.user.lastName === 'Tan' && me1.json.user.avatarUrl === alice.picture, 'profile comes from Google, email already confirmed');
  ok(me1.json.user.hasPassword === false && me1.json.user.googleEmail === alice.email, 'the session says how this person signs in');
  ok(me1.json.memberships.length === 1 && me1.json.memberships[0].role === 'OWNER' && me1.json.memberships[0].organizationName === "Alice's organization", 'a new Google user owns a new organization');
  ok(await prisma.team.count({ where: { organizationId: me1.json.memberships[0].organizationId } }) === 1, '…with its first team');
  const m1 = await call('GET', '/api/v1/user/me/sign-in-methods', s1.session);
  ok(m1.json.password === false && m1.json.google?.email === alice.email, 'sign-in methods: Google, no password');
  ok(!(await prisma.emailOutbox.findFirst({ where: { to: alice.email, subject: { contains: 'onfirm' } } })), 'no confirm-your-email mail for a Google sign-up');
  const str = await google({ who: { sub: sub('s'), email: `stringy.${RUN}@gmail.com`, email_verified: 'true' } });
  ok(str.landed.pathname === '/welcome', 'email_verified sent as the string "true" is accepted');

  // ── 2. returning ─────────────────────────────────────────────────────
  const s2 = await google({ who: alice, next: '/calendar' });
  ok(s2.landed.pathname === '/calendar' && s2.session && s2.session !== s1.session, 'returning: lands on ?next with a fresh session');
  const me2 = await call('GET', '/api/v1/auth/me', s2.session);
  ok(me2.json.user.id === me1.json.user.id && me2.json.memberships.length === 1, 'returning: same user, no second organization');
  const s2b = await google({ who: alice, session: s2.session });
  ok((await call('GET', '/api/v1/auth/me', s2.session)).status === 401 && s2b.session, 'signing in again replaces (revokes) the session this browser had');
  for (const bad of ['//evil.example/x', '/\\evil.example', 'https://evil.example', '/ok space']) {
    const r = await google({ who: alice, next: bad });
    ok(r.landed.pathname === '/posts' && !r.landed.href.includes('evil'), `next=${JSON.stringify(bad)}: refused, lands on /posts`);
  }
  const pw = await call('POST', '/api/v1/auth/login', null, { email: alice.email, password: 'whatever-123' });
  ok(pw.status === 401 && pw.json.message === 'Email or password is incorrect.', 'password login on a Google-only account says nothing about Google (no account discovery)');
  const chg = await call('POST', '/api/v1/user/me/password', s2b.session, { currentPassword: 'x', newPassword: 'longenough123' });
  ok(chg.status === 400 && /no password/.test(chg.json.message), 'change password on a Google-only account says there is none yet');
  const unl = await call('DELETE', '/api/v1/user/me/google', s2b.session, { currentPassword: 'anything-1' });
  ok(unl.status === 400 && /password/i.test(unl.json.message), 'cannot disconnect Google without a password (no lock-out)');

  // ── 3. guards: CSRF / replay / cancel / unverified / tampered tokens ─
  const real = await begin({ who: alice });
  const forged = await finish(new URL(`${real.cb!.pathname}?state=forged&code=x`, API), [real.flow]);
  ok(errorOf(forged.landed) === 'google_expired' && !forged.session, 'forged state is refused');
  ok(!forged.done.headers.getSetCookie().some(c => c.startsWith('siar_google=;')), '…and does not cancel the real sign-in in progress');
  const realDone = await finish(real.cb!, [real.flow]);
  ok(realDone.session, '…which still completes');
  const noFlow = await google({ who: alice, flowCookie: 'drop' });
  ok(errorOf(noFlow.landed) === 'google_expired' && !noFlow.session, 'a callback this browser did not start is refused (login CSRF)');
  const once = await google({ who: alice });
  const replay = await fetch(`${API}${once.cb!.pathname}${once.cb!.search}`, { redirect: 'manual', headers: { cookie: once.flow! } });
  ok(errorOf(new URL(replay.headers.get('location')!)) === 'google_failed' && !cookieOf(replay, 'siar_session'), 'replaying a used code signs nobody in');
  ok(replay.headers.getSetCookie().some(c => c.startsWith('siar_google=;')), 'the flow cookie is cleared once its state is presented');
  const cancel = await google({ who: { ...alice, deny: true }, from: 'signup' });
  ok(cancel.landed.pathname === '/signup' && errorOf(cancel.landed) === 'google_cancelled', 'cancel at Google returns to the page it started from');
  const unv = await google({ who: { sub: sub('u'), email: `unverified.${RUN}@gmail.com`, email_verified: false } });
  ok(errorOf(unv.landed) === 'google_unverified' && !(await users(`unverified.${RUN}@gmail.com`)), 'an unverified Google email creates nothing');
  for (const t of ['aud', 'azp', 'iss', 'nonce', 'exp', 'sig', 'kid', 'alg-none']) {
    const email = `tamper.${t}.${RUN}@gmail.com`;
    const r = await google({ who: { sub: sub(`t${t}`), email, tamper: t } });
    ok(errorOf(r.landed) === 'google_failed' && !r.session && !(await users(email)), `ID token with a bad ${t} is refused`);
  }

  // ── 4. existing password accounts ────────────────────────────────────
  const mk = async (email: string, verified: boolean) => { const r = await call('POST', '/api/v1/auth/signup', null, { email, password: 'password-1234', firstName: 'Pat' }); if (verified) await prisma.user.update({ where: { email }, data: { emailVerified: new Date() } }); return r; };
  const bob = `bob.${RUN}@gmail.com`; const bobSignup = await mk(bob, true);
  const sb = await google({ who: { sub: sub('b'), email: bob, given_name: 'Robert' } });
  ok(sb.landed.pathname === '/posts' && sb.session, 'confirmed password account + gmail: linked and signed in');
  const bobRow = await prisma.user.findUniqueOrThrow({ where: { email: bob } });
  ok(bobRow.googleSub === sub('b') && bobRow.passwordHash && bobRow.firstName === 'Pat', '…keeps its password and its own name');
  ok((await call('POST', '/api/v1/auth/login', null, { email: bob, password: 'password-1234' })).status === 200 && (await call('GET', '/api/v1/auth/me', bobSignup.session)).status === 200, '…password and existing sessions still work');
  ok(await prisma.emailOutbox.findFirst({ where: { to: bob, subject: { contains: 'Google sign-in was connected' } } }), '…and the owner gets a security email');

  const victim = `victim.${RUN}@gmail.com`; const squatter = await mk(victim, false);
  const sv = await google({ who: { sub: sub('v'), email: victim } });
  const vRow = await prisma.user.findUniqueOrThrow({ where: { email: victim } });
  ok(errorOf(sv.landed) === 'google_unconfirmed_account' && !sv.session && !vRow.googleSub && vRow.passwordHash, 'unconfirmed account: never linked, nothing changed');
  ok((await call('GET', '/api/v1/auth/me', squatter.session)).status === 200, '…(no one is signed out by a failed attempt)');
  const sqConnect = await call('POST', '/api/v1/user/me/google/connect', squatter.session, { currentPassword: 'password-1234' });
  ok(sqConnect.status === 400 && /[Cc]onfirm/.test(sqConnect.json.message), 'an unconfirmed account cannot connect Google from settings either (squatter hole closed)');
  await call('POST', '/api/v1/auth/forgot-password', null, { email: victim });
  const resetMail = await prisma.emailOutbox.findFirst({ where: { to: victim, subject: { contains: 'Reset' } }, orderBy: { createdAt: 'desc' } });
  const rt = resetMail?.text.match(/reset-password\?token=([\w-]+)/)?.[1];
  ok((await call('POST', '/api/v1/auth/reset-password', null, { token: rt, password: 'victim-owns-it-1' })).status === 200 && (await call('GET', '/api/v1/auth/me', squatter.session)).status === 401, 'the inbox owner takes it over with Forgot password (squatter signed out)');
  const sv2 = await google({ who: { sub: sub('v'), email: victim } });
  ok(sv2.session && (await prisma.user.findUniqueOrThrow({ where: { email: victim } })).googleSub === sub('v'), '…then Google links normally');

  const other = `pat.${RUN}@example.com`; await mk(other, true);
  const so = await google({ who: { sub: sub('o'), email: other } });
  ok(errorOf(so.landed) === 'google_link_required' && !(await prisma.user.findUniqueOrThrow({ where: { email: other } })).googleSub, 'non-Google domain without hd: never auto-linked');
  const ws = `carol@acme-${RUN}.test`; await mk(ws, true);
  const sw = await google({ who: { sub: sub('c'), email: ws, hd: `acme-${RUN}.test` } });
  ok(sw.session && (await prisma.user.findUniqueOrThrow({ where: { email: ws } })).googleSub === sub('c'), 'Google Workspace (hd matches the domain): linked');
  const sx = await google({ who: { sub: sub('x'), email: bob } });
  ok(errorOf(sx.landed) === 'google_other_account' && !sx.session, 'a second Google account with a linked email is refused');
  const newExt = `newcomer.${RUN}@example.com`;
  const sn = await google({ who: { sub: sub('n'), email: newExt } });
  ok(sn.landed.pathname === '/welcome' && (await prisma.user.findUniqueOrThrow({ where: { email: newExt } })).emailVerified, 'new account on a non-Google domain (Google verified it): created');

  // ── 5. connect from settings (password step-up), disconnect, set a password ─
  const dave = `dave.${RUN}@example.com`; const daveS = (await mk(dave, true)).session!;
  const out = await google({ intent: 'link' });
  ok(out.landed.pathname === '/login' && out.landed.searchParams.get('next') === '/settings', 'connect while signed out goes to sign-in first');
  const noTicket = await google({ intent: 'link', session: daveS });
  ok(errorOf(noTicket.landed) === 'link_ticket_invalid', 'connect without the password step is refused');
  const wrongPw = await call('POST', '/api/v1/user/me/google/connect', daveS, { currentPassword: 'not-it-12345' });
  ok(wrongPw.status === 400 && wrongPw.json.issues?.[0]?.path?.[0] === 'currentPassword', 'connect with a wrong password is refused');
  const conn = await call('POST', '/api/v1/user/me/google/connect', daveS, { currentPassword: 'password-1234' });
  ok(conn.status === 200 && conn.json.url.startsWith('/api/v1/auth/google/start?intent=link&ticket='), 'connect with the password returns the Google URL');
  const daveOther = (await call('POST', '/api/v1/auth/login', null, { email: dave, password: 'password-1234' })).session;
  const stolen = await google({ startPath: conn.json.url, session: daveOther });
  ok(errorOf(stolen.landed) === 'link_ticket_invalid', 'the ticket only works for the session that asked for it');
  const dl = await google({ startPath: conn.json.url, session: daveS, who: { sub: sub('d'), email: `dave.personal.${RUN}@gmail.com` } });
  ok(dl.landed.pathname === '/settings' && dl.landed.searchParams.get('google') === 'linked', 'Google connected from settings');
  ok((await call('GET', '/api/v1/user/me/sign-in-methods', daveS)).json.google?.email === `dave.personal.${RUN}@gmail.com`, '…sign-in methods show the Google account');
  ok(await prisma.emailOutbox.findFirst({ where: { to: dave, subject: { contains: 'Google sign-in was connected' } } }), '…with a security email');
  const dg = await google({ who: { sub: sub('d'), email: `dave.personal.${RUN}@gmail.com` } });
  ok((await call('GET', '/api/v1/auth/me', dg.session)).json.user.email === dave, '…then Google signs in to that account, whatever its Google email');
  const ericS = (await mk(`eric.${RUN}@example.com`, true)).session!;
  const eConn = await call('POST', '/api/v1/user/me/google/connect', ericS, { currentPassword: 'password-1234' });
  const taken = await google({ startPath: eConn.json.url, session: ericS, who: alice });
  ok(errorOf(taken.landed) === 'google_in_use', 'a Google account linked to someone else cannot be connected');
  ok((await call('POST', '/api/v1/user/me/google/connect', daveS, { currentPassword: 'password-1234' })).status === 400, 'one Google account per Siar account (disconnect first)');
  ok((await call('POST', '/api/v1/user/me/google/connect', s2b.session, { currentPassword: 'x' })).status === 400, 'a Google-only account has nothing to connect');
  ok((await call('DELETE', '/api/v1/user/me/google', daveS, { currentPassword: 'nope-nope-1' })).status === 400, 'disconnect with a wrong password is refused');
  const du = await call('DELETE', '/api/v1/user/me/google', daveS, { currentPassword: 'password-1234' });
  ok(du.status === 200 && du.json.google === null && du.json.password === true, 'disconnect Google with the password');
  ok(await prisma.emailOutbox.findFirst({ where: { to: dave, subject: { contains: 'disconnected' } } }), '…with a security email');
  const relinkUrl = (await call('POST', '/api/v1/user/me/google/connect', daveS, { currentPassword: 'password-1234' })).json.url;
  const relink = await google({ startPath: relinkUrl, session: daveS, who: { sub: sub('d'), email: `dave.personal.${RUN}@gmail.com` } });
  ok(relink.landed.searchParams.get('google') === 'linked', 'and connect it again later');

  const setup = await call('POST', '/api/v1/user/me/password/setup', s2b.session);
  ok(setup.status === 200, 'Google-only user asks for a set-a-password link');
  const mail = await prisma.emailOutbox.findFirst({ where: { to: alice.email, subject: 'Set a password for Siar' }, orderBy: { createdAt: 'desc' } });
  const token = mail?.text.match(/reset-password\?token=([\w-]+)/)?.[1];
  ok(token, '…the email carries a link');
  ok((await call('POST', '/api/v1/auth/reset-password', null, { token, password: 'alice-password-1' })).status === 200, '…which sets the password');
  const alicePw = await call('POST', '/api/v1/auth/login', null, { email: alice.email, password: 'alice-password-1' });
  ok(alicePw.status === 200, '…and both password and Google now sign in');
  ok((await call('POST', '/api/v1/user/me/password/setup', alicePw.session)).status === 400, 'no set-a-password link once a password exists');

  // ── 6. invitations ───────────────────────────────────────────────────
  const inviteTo = async (email: string, role = 'MEMBER') => {
    await call('POST', '/api/v1/user/invitations', alicePw.session, { email, role });
    const m = await prisma.emailOutbox.findFirst({ where: { to: email }, orderBy: { createdAt: 'desc' } });
    return m?.text.match(/accept-invite\?token=([\w-]+)/)?.[1] ?? '';
  };
  const orgA = me1.json.memberships[0].organizationId;
  const erin = `erin.${RUN}@gmail.com`; const inv = await inviteTo(erin);
  ok(inv, 'invitation sent');
  const wrong = await google({ intent: 'invite', invite: inv, who: { sub: sub('w'), email: `someone.else.${RUN}@gmail.com` } });
  ok(wrong.landed.pathname === '/accept-invite' && errorOf(wrong.landed) === 'invite_email_mismatch' && !(await prisma.invitation.findFirst({ where: { email: erin } }))?.acceptedAt, 'invite with a different Google account: refused, invitation still open');
  const hint = new URL((await fetch(`${API}/api/v1/auth/google/start?intent=invite&invite=${inv}`, { redirect: 'manual' })).headers.get('location')!);
  ok(hint.searchParams.get('login_hint') === erin, 'invite start suggests the invited address to Google');
  const ei = await google({ intent: 'invite', invite: inv, who: { sub: sub('e'), email: erin, given_name: 'Erin' } });
  const erinMe = await call('GET', '/api/v1/auth/me', ei.session);
  ok(ei.landed.pathname === '/posts' && erinMe.json.memberships.length === 1 && erinMe.json.memberships[0].organizationId === orgA && erinMe.json.currentOrganizationId === orgA, 'invite with Google: joins the inviting organization only');
  ok(erinMe.json.user.onboardedAt && erinMe.json.memberships[0].role === 'MEMBER', '…as a member, skipping the welcome');
  const again = await google({ intent: 'invite', invite: inv, who: { sub: sub('e'), email: erin } });
  ok(errorOf(again.landed) === 'invite_invalid', 'a used invitation cannot be used again');
  ok(errorOf((await google({ intent: 'invite', invite: 'nope' })).landed) === 'invite_invalid', 'an unknown invitation stops before Google');
  const extInv = await inviteTo(`frank@frank-${RUN}.test`);
  const fx = await google({ intent: 'invite', invite: extInv, who: { sub: sub('f'), email: `frank@frank-${RUN}.test` } });
  ok(errorOf(fx.landed) === 'invite_use_password' && !(await users(`frank@frank-${RUN}.test`)), 'invite for an address Google is not authoritative for: use the password form');
  const bobInv = await inviteTo(bob, 'ADMIN');
  const bi = await google({ intent: 'invite', invite: bobInv, who: { sub: sub('b'), email: bob } });
  const bobMe = await call('GET', '/api/v1/auth/me', bi.session);
  ok(bobMe.json.memberships.length === 2 && bobMe.json.currentOrganizationId === orgA, 'an existing user accepts with Google: joins, keeps their own organization');

  // ── 7. race, deleted account, rate limit ─────────────────────────────
  const twin: Who = { sub: sub('r'), email: `twin.${RUN}@gmail.com`, given_name: 'Twin' };
  const ta = await begin({ who: twin }); const tb = await begin({ who: twin });
  const [ra, rb] = await Promise.all([finish(ta.cb!, [ta.flow]), finish(tb.cb!, [tb.flow])]);
  ok(ra.session && rb.session && (await users(twin.email)) === 1, 'two simultaneous first sign-ins: one account, both signed in');
  ok(await prisma.organizationMember.count({ where: { user: { email: twin.email } } }) === 1, '…with one organization');
  const gone = `gone.${RUN}@gmail.com`;
  await prisma.user.create({ data: { email: gone, googleSub: sub('g'), passwordHash: await hashPassword('x-x-x-x-x-x'), deletedAt: new Date() } });
  const sg = await google({ who: { sub: sub('g'), email: gone } });
  ok(errorOf(sg.landed) === 'account_deleted' && !sg.session, 'a deleted account cannot sign in with Google');
  await clearLimit();
  let limited = false;
  for (let i = 0; i < 35 && !limited; i++) {
    const r = await fetch(`${API}/api/v1/auth/google/start`, { redirect: 'manual' });
    limited = errorOf(new URL(r.headers.get('location')!)) === 'google_rate_limited';
  }
  ok(limited, 'starts are rate limited per IP');
  await clearLimit();

  console.log(`\n${passed} checks passed`);
  await redis.quit(); await prisma.$disconnect();
}

main().catch(async e => { console.error(e); process.exit(1); });
