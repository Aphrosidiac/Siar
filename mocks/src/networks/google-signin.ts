/**
 * Sign in with Google (OpenID Connect) — the mock of accounts.google.com / oauth2.googleapis.com for
 * Siar's own "Continue with Google", per developers.google.com/identity/openid-connect/openid-connect.
 *
 * It shares Google's authorize and token endpoints with the YouTube mock (same hosts and paths), so the
 * YouTube routes hand over: a request whose scope includes `openid` is a sign-in, and so is a code
 * minted here (mockcode_gsi_…). What it checks, as Google does: client_id, redirect_uri, response_type
 * code, PKCE S256 (challenge at authorize, verifier at token), single-use codes. ID tokens are real
 * RS256 JWTs signed with a key published at www.googleapis.com/oauth2/v3/certs, so the API's signature,
 * issuer, audience, expiry and nonce checks run for real.
 *
 * Who signs in: POST /__host/accounts.google.com/__mock/next-identity { sub, email, email_verified, hd,
 * name, given_name, family_name, picture, deny } sets the next identity (used once). Without it: the
 * login_hint address, else mock.user@gmail.com.
 */
import { createHash, generateKeyPairSync, sign } from 'node:crypto';
import { id, type MockRegistry, type MockRequest, type MockResponse } from '../registry.js';

interface Identity { sub: string; email: string; email_verified?: boolean | string; hd?: string; name?: string; given_name?: string; family_name?: string; picture?: string; deny?: boolean }
interface Pending { identity: Identity; nonce: string | null; challenge: string; clientId: string; redirectUri: string; exp: number }

const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const KID = `mock-${id()}`;
const JWK = { ...publicKey.export({ format: 'jwk' }), kid: KID, alg: 'RS256', use: 'sig' };

const b64 = (v: unknown) => Buffer.from(JSON.stringify(v)).toString('base64url');
function jwt(claims: Record<string, unknown>) {
  const head = b64({ alg: 'RS256', kid: KID, typ: 'JWT' });
  const body = b64(claims);
  return `${head}.${body}.${sign('sha256', Buffer.from(`${head}.${body}`), privateKey).toString('base64url')}`;
}
const subOf = (email: string) => String(BigInt('0x' + createHash('sha256').update(email).digest('hex').slice(0, 15))).padStart(21, '1');
const err = (status: number, error: string, error_description: string): MockResponse => ({ status, json: { error, error_description } });

const st = (m: MockRegistry) => m.ns('googleSignIn', () => ({ codes: {} as Record<string, Pending>, next: null as Identity | null, issued: [] as { sub: string; email: string; aud: string }[] }));

export const isSignInAuthorize = (req: MockRequest) => String(req.query.scope ?? '').split(/\s+/).includes('openid');
export const isSignInCode = (code: unknown) => String(code ?? '').startsWith('mockcode_gsi_');

export function authorize(m: MockRegistry, req: MockRequest): MockResponse {
  const q = req.query;
  if (!q.client_id) return err(400, 'invalid_request', 'Missing required parameter: client_id');
  if (!q.redirect_uri) return err(400, 'invalid_request', 'Missing required parameter: redirect_uri');
  if (q.response_type !== 'code') return err(400, 'unsupported_response_type', 'Only response_type=code is supported here.');
  if (!q.code_challenge || q.code_challenge_method !== 'S256') return err(400, 'invalid_request', 'PKCE: code_challenge with code_challenge_method=S256 is required.');
  const s = st(m);
  const identity: Identity = s.next ?? (q.login_hint ? { sub: subOf(q.login_hint), email: q.login_hint, email_verified: true, name: 'Invited Person', given_name: 'Invited', family_name: 'Person' }
    : { sub: subOf('mock.user@gmail.com'), email: 'mock.user@gmail.com', email_verified: true, name: 'Mock User', given_name: 'Mock', family_name: 'User', picture: 'https://lh3.googleusercontent.example/a/mock-user' });
  s.next = null;
  const back = new URL(q.redirect_uri);
  if (q.state) back.searchParams.set('state', q.state);
  if (identity.deny || q.deny === '1') { back.searchParams.set('error', 'access_denied'); return { redirect: back.toString() }; }
  const code = `mockcode_gsi_${id()}${id()}`;
  s.codes[code] = { identity, nonce: q.nonce ?? null, challenge: q.code_challenge, clientId: q.client_id, redirectUri: q.redirect_uri, exp: Date.now() + 5 * 60_000 };
  back.searchParams.set('code', code);
  back.searchParams.set('scope', 'email profile openid https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile');
  return { redirect: back.toString() };
}

export function token(m: MockRegistry, b: Record<string, string>): MockResponse {
  const s = st(m);
  if (!b.client_id || !b.client_secret) return err(401, 'invalid_client', 'The OAuth client was not found.');
  if (b.grant_type !== 'authorization_code') return err(400, 'unsupported_grant_type', 'Invalid grant_type');
  const p = s.codes[b.code];
  delete s.codes[b.code]; // single use, even when the exchange fails
  if (!p || p.exp < Date.now()) return err(400, 'invalid_grant', 'Malformed auth code.');
  if (p.clientId !== b.client_id) return err(400, 'invalid_grant', 'The code was issued to another client.');
  if (p.redirectUri !== b.redirect_uri) return err(400, 'redirect_uri_mismatch', 'Bad Request');
  if (!b.code_verifier || createHash('sha256').update(b.code_verifier).digest('base64url') !== p.challenge) return err(400, 'invalid_grant', 'Invalid code verifier.');
  const now = Math.floor(Date.now() / 1000);
  const i = p.identity;
  const claims: Record<string, unknown> = {
    iss: 'https://accounts.google.com', azp: b.client_id, aud: b.client_id, sub: i.sub, email: i.email, email_verified: i.email_verified ?? true,
    at_hash: id(), iat: now, exp: now + 3600,
    ...(p.nonce ? { nonce: p.nonce } : {}), ...(i.hd ? { hd: i.hd } : {}), ...(i.name ? { name: i.name } : {}),
    ...(i.given_name ? { given_name: i.given_name } : {}), ...(i.family_name ? { family_name: i.family_name } : {}), ...(i.picture ? { picture: i.picture } : {}),
  };
  s.issued.push({ sub: i.sub, email: i.email, aud: b.client_id });
  return { json: { access_token: `ya29.${id()}`, expires_in: 3599, scope: 'openid https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile', token_type: 'Bearer', id_token: jwt(claims) } };
}

export default function googleSignIn(m: MockRegistry) {
  m.on('GET', 'www.googleapis.com', '/oauth2/v3/certs', () => ({ json: { keys: [JWK] }, headers: { 'cache-control': 'public, max-age=21600' } }));
  m.on('POST', 'accounts.google.com', '/__mock/next-identity', req => { st(m).next = req.body as Identity; return { json: { ok: true } }; });
}
