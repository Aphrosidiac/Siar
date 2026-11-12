// Staff (User.role ADMIN) is reachable only through a proven mailbox (modules/identity.ts promoteIfStaff).
// Needs an API started with staffcheck@siar.test on STAFF_EMAILS, e.g. the launch config siar-api-staffcheck:
//   STAFF_EMAILS=hello@ffdev.studio,staffcheck@siar.test PORT=3391 pnpm exec tsx --env-file=.env src/index.ts
// then: pnpm --filter @siar/api e2e:staff   (API=http://localhost:3391; reads the local dev database with psql)
import { execSync } from 'node:child_process';
const API = process.env.API ?? 'http://localhost:3391';
const psql = (q) => execSync(`psql -d siar -At -c ${JSON.stringify(q)}`).toString().trim();
let fails = 0;
const ok = (c, m) => { console.log(`${c ? '✓' : '✗'} ${m}`); if (!c) fails++; };
async function call(method, path, cookie, body, extra = {}) {
  const r = await fetch(API + path, { method, headers: { 'x-siar': '1', ...(cookie ? { cookie } : {}), ...(body ? { 'content-type': 'application/json' } : {}), ...extra }, body: body ? JSON.stringify(body) : undefined });
  const text = await r.text(); let json = null; try { json = JSON.parse(text); } catch {}
  return { status: r.status, json, cookie: r.headers.getSetCookie().map((c) => c.split(';')[0]).find((c) => c.startsWith('siar_session=')) };
}
const me = async (c) => (await call('GET', '/api/v1/auth/me', c)).json?.user?.isStaff;

for (const e of ['staffcheck@siar.test', 'plain-staffcheck@siar.test']) { psql(`DELETE FROM "Organization" WHERE "createdById" IN (SELECT id FROM "User" WHERE email = '${e}')`); psql(`DELETE FROM "User" WHERE email = '${e}'`); }

// 1. sign up with a listed address, mailbox not proven
const s = await call('POST', '/api/v1/auth/signup', null, { email: 'staffcheck@siar.test', password: 'Staffcheck-pass-123', firstName: 'Mallory' });
ok(s.status < 300 && s.cookie, 'signup with a staff-listed email works');
ok((await me(s.cookie)) === false, 'not staff before the email is confirmed');
// 2. the obvious tries
await call('PATCH', '/api/v1/user/me', s.cookie, { firstName: 'Mallory', role: 'ADMIN', isStaff: true });
ok((await me(s.cookie)) === false, 'PATCH /user/me with role/isStaff changes nothing');
ok(psql(`SELECT role FROM "User" WHERE email = 'staffcheck@siar.test'`) === 'CUSTOMER', 'database role is CUSTOMER');
ok((await call('GET', '/api/internal/metrics', s.cookie)).status === 404, 'metrics answers 404 (looks absent)');
const other = psql(`SELECT id FROM "Organization" WHERE "deletedAt" IS NULL AND "createdById" <> (SELECT id FROM "User" WHERE email = 'staffcheck@siar.test') LIMIT 1`);
ok((await call('GET', '/api/v1/team/', s.cookie, null, { 'x-organization-id': other })).status === 403, "another organization's data is refused (x-organization-id)");
ok((await call('GET', '/api/internal/metrics', null, null, { 'x-api-key': 'sk_live_not_a_key' })).status === 401, 'API keys never reach staff routes');
// 3. prove the mailbox: the confirmation link sent to that address
const link = psql(`SELECT substring(html from 'verify-email\\?token=([A-Za-z0-9_-]+)') FROM "EmailOutbox" WHERE "to" = 'staffcheck@siar.test' ORDER BY "createdAt" DESC LIMIT 1`);
ok(!!link, 'confirmation email was sent to the address');
ok((await call('POST', '/api/v1/auth/verify-email', null, { token: link })).status < 300, 'confirmation link accepted');
ok((await me(s.cookie)) === true, 'staff only after the mailbox is proven');
ok((await call('GET', '/api/internal/metrics?days=1', s.cookie)).status === 200, 'metrics opens for confirmed staff');
// 4. an address not on the list stays a customer even when confirmed
const p = await call('POST', '/api/v1/auth/signup', null, { email: 'plain-staffcheck@siar.test', password: 'Staffcheck-pass-123', firstName: 'Pat' });
const link2 = psql(`SELECT substring(html from 'verify-email\\?token=([A-Za-z0-9_-]+)') FROM "EmailOutbox" WHERE "to" = 'plain-staffcheck@siar.test' ORDER BY "createdAt" DESC LIMIT 1`);
await call('POST', '/api/v1/auth/verify-email', null, { token: link2 });
ok((await me(p.cookie)) === false, 'a confirmed address that is not on the list stays a customer');

for (const e of ['staffcheck@siar.test', 'plain-staffcheck@siar.test']) { psql(`DELETE FROM "Organization" WHERE "createdById" IN (SELECT id FROM "User" WHERE email = '${e}')`); psql(`DELETE FROM "User" WHERE email = '${e}'`); }
console.log(fails ? `${fails} FAILED` : 'all passed');
process.exit(fails ? 1 : 0);
