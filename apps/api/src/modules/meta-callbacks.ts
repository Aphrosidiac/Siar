import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import type { FastifyInstance } from 'fastify';
import { apiUrl } from '../platform/config.js';
import { prisma } from '../platform/db.js';
import { systemActor } from '../platform/audit.js';
import { logger } from '../platform/logger.js';
import { disconnectAccount } from './accounts.js';

/**
 * Meta's per-login callbacks (Facebook Login, Instagram Login, Threads). Meta POSTs a form field
 * `signed_request` = base64url(HMAC-SHA256 signature) "." base64url(JSON payload with user_id),
 * signed with that login's app secret.
 *   deauthorize   — the person removed the app: disconnect their accounts.
 *   data-deletion — the person asked for their data to be deleted: disconnect (tokens wiped) and
 *                   answer { url, confirmation_code } so Meta can show them the status page.
 * Matching is on SocialAccount.userId, the Meta user id stored at connect time.
 */

const log = logger.child({ module: 'meta-callbacks' });
const LOGINS = { facebook: 'FACEBOOK', instagram: 'INSTAGRAM', threads: 'THREADS' } as const;
type Login = keyof typeof LOGINS;

/** App secrets that may sign a request for this login (Instagram Login has its own app). */
function secretsFor(login: Login) {
  const e = process.env;
  const list = login === 'facebook' ? [e.NETWORK_FACEBOOK_CLIENT_SECRET]
    : login === 'instagram' ? [e.NETWORK_INSTAGRAM_INSTAGRAM_CLIENT_SECRET, e.NETWORK_INSTAGRAM_CLIENT_SECRET]
      : [e.NETWORK_THREADS_CLIENT_SECRET];
  return list.filter((s): s is string => !!s);
}

const b64url = (s: string) => Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/'), 'base64');

/** The payload when the signature checks out with one of the secrets, else null. */
export function parseSignedRequest(signed: unknown, secrets: string[]): { user_id?: string; algorithm?: string } | null {
  if (typeof signed !== 'string' || !signed.includes('.')) return null;
  const [sig, body] = signed.split('.', 2);
  let payload: any;
  try { payload = JSON.parse(b64url(body).toString('utf8')); } catch { return null; }
  if (String(payload?.algorithm ?? '').toUpperCase() !== 'HMAC-SHA256') return null;
  const got = b64url(sig);
  for (const secret of secrets) {
    const want = createHmac('sha256', secret).update(body).digest();
    if (got.length === want.length && timingSafeEqual(got, want)) return payload;
  }
  return null;
}

/** Facebook Login also covers Instagram accounts connected through a Facebook Page. */
const typesFor = (login: Login) => (login === 'facebook' ? ['FACEBOOK', 'INSTAGRAM'] : [LOGINS[login]]);

async function disconnectUser(login: Login, userId: string) {
  const accounts = await prisma.socialAccount.findMany({
    where: { userId, deletedAt: null, type: { in: typesFor(login) as any } },
    include: { team: { select: { organizationId: true } } },
  });
  for (const a of accounts) {
    await disconnectAccount(systemActor(a.team.organizationId), a.id).catch(err => log.error({ err, accountId: a.id }, 'disconnect failed'));
  }
  return accounts.length;
}

/** Stateless confirmation code: when + how many, signed so the status page can trust it. */
function confirmation(count: number) {
  const key = process.env.NETWORK_FACEBOOK_CLIENT_SECRET ?? process.env.NETWORK_THREADS_CLIENT_SECRET ?? 'siar';
  const body = Buffer.from(JSON.stringify({ at: new Date().toISOString(), n: count, r: randomBytes(4).toString('hex') })).toString('base64url');
  return `${body}.${createHmac('sha256', key).update(body).digest('base64url').slice(0, 16)}`;
}

function readConfirmation(code: string) {
  const key = process.env.NETWORK_FACEBOOK_CLIENT_SECRET ?? process.env.NETWORK_THREADS_CLIENT_SECRET ?? 'siar';
  const [body, mac] = code.split('.', 2);
  if (!body || !mac || createHmac('sha256', key).update(body).digest('base64url').slice(0, 16) !== mac) return null;
  try { return JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as { at: string; n: number }; } catch { return null; }
}

export async function metaCallbackRoutes(app: FastifyInstance) {
  const login = (p: unknown): Login | null => (typeof p === 'string' && p in LOGINS ? (p as Login) : null);

  app.post('/api/v1/webhooks/meta/deauthorize/:login', async (req, reply) => {
    const l = login((req.params as any).login);
    if (!l) return reply.status(404).send({ statusCode: 404, message: 'Unknown login.' });
    const p = parseSignedRequest((req.body as any)?.signed_request, secretsFor(l));
    if (!p?.user_id) return reply.status(400).send({ statusCode: 400, message: 'Invalid signed_request.' });
    const n = await disconnectUser(l, String(p.user_id));
    log.info({ login: l, accounts: n }, 'deauthorized');
    return reply.send({ success: true });
  });

  app.post('/api/v1/webhooks/meta/data-deletion/:login', async (req, reply) => {
    const l = login((req.params as any).login);
    if (!l) return reply.status(404).send({ statusCode: 404, message: 'Unknown login.' });
    const p = parseSignedRequest((req.body as any)?.signed_request, secretsFor(l));
    if (!p?.user_id) return reply.status(400).send({ statusCode: 400, message: 'Invalid signed_request.' });
    const n = await disconnectUser(l, String(p.user_id));
    const code = confirmation(n);
    log.info({ login: l, accounts: n }, 'data deletion requested');
    return reply.send({ url: apiUrl(`/api/v1/webhooks/meta/data-deletion/status/${code}`), confirmation_code: code });
  });

  app.get('/api/v1/webhooks/meta/data-deletion/status/:code', async (req, reply) => {
    const c = readConfirmation(String((req.params as any).code ?? ''));
    reply.type('text/plain; charset=utf-8');
    if (!c) return reply.status(404).send('Siar does not recognise this confirmation code.');
    return reply.send(`Siar data deletion request received ${c.at}. Connected accounts removed: ${c.n}. Their access tokens were deleted immediately; any remaining data is erased as described at https://siaran.my/data-deletion. Questions: siaran@ffdev.studio`);
  });
}
