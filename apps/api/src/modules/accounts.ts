import type { FastifyInstance } from 'fastify';
import { isNetworkError, pkceChallenge, randomString, type Channel, type NetworkType } from '@siar/networks';
import { appUrl } from '../platform/config.js';
import { encrypt, decrypt, randomToken, sha256 } from '../platform/crypto.js';
import { prisma, type Db } from '../platform/db.js';
import { audit, systemActor } from '../platform/audit.js';
import { emit, flushDeliveries } from '../platform/events.js';
import { badRequest, notFound, unavailable, upstream } from '../platform/errors.js';
import { adapter, isConfigured, loadAccount, networkContext, rewriteForMock, runtimeOf, tokenColumns } from '../platform/networks.js';
import { logger } from '../platform/logger.js';
import { requirePermission, type Actor } from '../platform/auth.js';
import { define } from '../platform/routes.js';
import * as S from '../domain/serialize.js';
import { teamOf } from './teams.js';

const STATE_TTL_MS = 30 * 60_000;

/** The live account of a network in a team, or 404. */
export async function accountOf(actor: Actor, teamId: string, type: string) {
  await teamOf(actor, teamId);
  const a = await prisma.socialAccount.findFirst({ where: { teamId, type: type as NetworkType, deletedAt: null }, include: { mastodonServer: true } });
  if (!a) throw notFound(`${type} social account for this team`);
  return a;
}

/** Turn a NetworkError into the API envelope (the network's words, verbatim). */
export function networkFailure(err: unknown): never {
  if (isNetworkError(err)) {
    const status = err.code === 'TOKEN_INVALID' ? 403 : err.code === 'NOT_FOUND' ? 404 : err.code === 'RATE_LIMITED' ? 429 : err.code === 'NETWORK_UNAVAILABLE' ? 502 : err.code === 'NOT_SUPPORTED' || err.code === 'NOT_CONFIGURED' ? 400 : 400;
    throw Object.assign(upstream(err.code === 'TOKEN_INVALID' ? `${err.message} Reconnect the account.` : err.message, { errorCode: err.code, retryability: err.retryability }), { statusCode: status });
  }
  throw err;
}

async function ensureMastodonServer(serverUrl: string) {
  const url = new URL(serverUrl).origin;
  const existing = await prisma.mastodonServer.findUnique({ where: { url } });
  if (existing) return { id: existing.id, clientId: existing.clientId, clientSecret: decrypt(existing.clientSecretEnc), url };
  const creds = await adapter('MASTODON').prepareServer!(networkContext('MASTODON'), url).catch(networkFailure);
  const row = await prisma.mastodonServer.create({ data: { url, clientId: creds.clientId, clientSecretEnc: encrypt(creds.clientSecret) } });
  return { id: row.id, clientId: creds.clientId, clientSecret: creds.clientSecret, url };
}

export interface ConnectOptions {
  type: NetworkType;
  teamId: string;
  organizationId: string;
  redirectUrl?: string | null;
  serverUrl?: string | null;
  portalLinkId?: string | null;
  /** Raw portal token, so the callback can return the person to the portal page. */
  portalToken?: string | null;
  options?: Record<string, unknown>;
}

/** Start an OAuth round trip; returns the URL to send the person to. */
export async function startConnect(o: ConnectOptions) {
  const ad = adapter(o.type);
  if (!isConfigured(o.type)) throw unavailable(`${ad.displayName} is not available on this server yet (app credentials are not configured).`);
  if (o.redirectUrl) { try { const u = new URL(o.redirectUrl); if (!/^https?:$/.test(u.protocol)) throw 0; } catch { throw badRequest('redirectUrl must be an http(s) URL.', [{ code: 'invalid', message: 'Invalid URL', path: ['redirectUrl'] }]); } }
  let serverUrl = o.serverUrl ?? null;
  const extra: Record<string, unknown> = { options: o.options ?? {}, ...(o.portalToken ? { portalToken: o.portalToken } : {}) };
  if (o.type === 'MASTODON') {
    if (!serverUrl) throw badRequest('serverUrl is required for Mastodon (e.g. https://mastodon.social).', [{ code: 'required', message: 'Required for Mastodon', path: ['serverUrl'] }]);
    const srv = await ensureMastodonServer(serverUrl);
    Object.assign(extra, { clientId: srv.clientId, clientSecretEnc: encrypt(srv.clientSecret), mastodonServerId: srv.id });
    serverUrl = srv.url;
  }
  const existing = await prisma.socialAccount.findFirst({ where: { teamId: o.teamId, type: o.type, deletedAt: null }, select: { id: true } });
  const state = randomString(24);
  const codeVerifier = randomString(48);
  const res = await ad.authorize(networkContext(o.type), {
    state, codeVerifier, codeChallenge: pkceChallenge(codeVerifier), serverUrl, forceLogin: !!(o.options?.disableAutoLogin || o.options?.tiktokForceLogin || o.options?.forceBrowserOAuth),
    options: o.options, extra: { ...extra, clientSecret: extra.clientSecretEnc ? decrypt(String(extra.clientSecretEnc)) : undefined },
  }).catch(networkFailure);
  Object.assign(extra, res.extra ?? {});
  await prisma.oAuthState.create({ data: { state, organizationId: o.organizationId, teamId: o.teamId, type: o.type, redirectUrl: o.redirectUrl ?? null, codeVerifier, serverUrl, portalLinkId: o.portalLinkId ?? null, socialAccountId: existing?.id ?? null, extra: extra as object, expiresAt: new Date(Date.now() + STATE_TTL_MS) } });
  return { url: rewriteForMock(res.url) };
}

/** Finish the round trip: exchange the code, create/refresh the account, pick a channel when there is exactly one. */
async function finishConnect(type: NetworkType, query: Record<string, string>) {
  const stateId = query.state ?? query.oauth_token ?? '';
  const st = stateId ? await prisma.oAuthState.findUnique({ where: { state: stateId } }) : null;
  if (!st || st.usedAt || st.expiresAt < new Date() || st.type !== type) return { redirect: null as string | null, error: 'This connection link expired. Start again.' };
  await prisma.oAuthState.update({ where: { state: st.state }, data: { usedAt: new Date() } });
  const back = (params: Record<string, string>) => {
    const target = st.portalLinkId ? appUrl(`/connect/${encodeURIComponent((st.extra as any)?.portalToken ?? '')}`) : st.redirectUrl ?? appUrl('/social-accounts');
    const u = new URL(target);
    for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
    return u.toString();
  };
  if (query.error || (!query.code && !query.oauth_verifier && type !== 'DISCORD')) {
    return { redirect: back({ success: 'false', type, error: query.error_description || query.error || 'The connection was cancelled.' }) };
  }
  const ex = (st.extra ?? {}) as Record<string, any>;
  const ad = adapter(type);
  try {
    const connected = await ad.exchange(networkContext(type), {
      code: query.code ?? query.oauth_verifier ?? '', state: st.state, codeVerifier: st.codeVerifier ?? '', serverUrl: st.serverUrl, query,
      extra: { ...ex, clientSecret: ex.clientSecretEnc ? decrypt(ex.clientSecretEnc) : undefined },
    });
    const p = connected.profile;
    const channels = p.channels ?? [];
    const result = await prisma.$transaction(async tx => {
      const current = await tx.socialAccount.findFirst({ where: { teamId: st.teamId, type, deletedAt: null } });
      const events: string[] = [];
      const base = {
        username: p.username ?? null, displayName: p.displayName ?? null, avatarUrl: p.avatarUrl ?? null, bio: p.bio ?? null,
        externalId: p.externalId, providerPageId: p.providerPageId, userUsername: p.userUsername ?? null, userDisplayName: p.userDisplayName ?? null,
        userEmail: p.userEmail ?? null, userId: p.userId ?? null, channels: channels as object[], instagramConnectionMethod: p.instagramConnectionMethod ?? null,
        twitterSubType: p.twitterSubType ?? null, isTiktokBusinessAccount: p.isTiktokBusinessAccount ?? null,
        mastodonServerId: ex.mastodonServerId ?? null, serverUrl: type === 'BLUESKY' ? st.serverUrl : null,
        state: 'CONNECTED' as const, stateReason: null, deleteOn: null, disconnectedCheckTryAt: null, lastRefreshedAt: new Date(), profileRefreshedAt: new Date(),
        ...tokenColumns(connected.token),
      };
      let account;
      // Same account when the login matches, or when the publishing identity does: Instagram reached through
      // Instagram Login instead of a Facebook Page (or back) is still the same Instagram account.
      const sameAccount = current && (current.providerPageId === p.providerPageId || current.externalId === p.externalId || channels.some(c => c.id === current.externalId));
      if (current && sameAccount) {
        // A reconnect. Keep the id (posts, analytics and conversations stay attached) and the chosen channel if it still exists.
        const methodChanged = (current.instagramConnectionMethod ?? null) !== base.instagramConnectionMethod;
        const keepChannel = current.channelId && channels.some(c => c.id === current.channelId) ? current.channelId
          : channels.some(c => c.id === current.externalId) ? current.externalId : null;
        account = await tx.socialAccount.update({ where: { id: current.id }, data: {
          ...base, channelId: methodChanged ? keepChannel : keepChannel ?? current.channelId,
          // messaging was switched on through the old login; the new one has to grant it again
          ...(methodChanged ? { messagingStatus: 'DISABLED' as const, messagingLastError: null, messagingStatusUpdatedAt: new Date() } : {}),
        } });
        events.push(...(await emit(tx, st.organizationId, 'social-account.updated', S.socialAccount(account))));
      } else {
        if (current) {
          const gone = await tx.socialAccount.update({ where: { id: current.id }, data: { deletedAt: new Date(), state: 'DISCONNECTED' } });
          events.push(...(await emit(tx, st.organizationId, 'social-account.deleted', S.socialAccount(gone))));
        }
        account = await tx.socialAccount.create({ data: { ...base, type, teamId: st.teamId } });
        events.push(...(await emit(tx, st.organizationId, 'social-account.created', S.socialAccount(account))));
      }
      await audit(tx, systemActor(st.organizationId), 'socialAccount.connect', 'SocialAccount', account.id, `Connected ${ad.displayName} ${p.username ?? p.displayName ?? ''}`.trim());
      return { account, events };
    });
    void flushDeliveries(result.events);
    // A reconnect that kept the chosen channel re-selects it: the upsert above wrote the signed-in user's
    // identity and token over the channel's (name, external id, Page token). Otherwise, exactly one
    // channel for a network that needs one → select it now (saves a step for most people).
    const kept = result.account.channelId && channels.some(c => c.id === result.account.channelId) ? result.account.channelId : null;
    if (kept) await selectChannel(prisma, result.account.id, kept).catch(err => logger.warn({ err }, 'channel reselect failed'));
    else if (ad.capabilities.channels === 'required' && channels.length === 1) await selectChannel(prisma, result.account.id, channels[0].id).catch(err => logger.warn({ err }, 'auto channel select failed'));
    return { redirect: back({ success: 'true', type, socialAccountId: result.account.id, ...(ad.capabilities.channels === 'required' && channels.length !== 1 ? { needsChannel: 'true' } : {}) }) };
  } catch (err) {
    logger.warn({ err, type }, 'connect failed');
    return { redirect: back({ success: 'false', type, error: isNetworkError(err) ? err.message : 'Connecting failed. Try again.' }) };
  }
}

/** Choose the page/org/board/location/channel the account posts as. */
export async function selectChannel(db: Db, accountId: string, channelId: string) {
  const a = await db.socialAccount.findUniqueOrThrow({ where: { id: accountId }, include: { mastodonServer: true } });
  const ad = adapter(a.type as NetworkType);
  const channels = (a.channels ?? []) as unknown as Channel[];
  const ch = channels.find(c => c.id === channelId);
  if (!ch) throw badRequest('That channel is not one of this account\'s channels. Refresh channels and try again.', [{ code: 'invalid', message: 'Unknown channel', path: ['channelId'] }]);
  const res = ad.selectChannel ? await ad.selectChannel(networkContext(a.type as NetworkType), { ...runtimeOf(a), channelId }, ch).catch(networkFailure) : {};
  return db.socialAccount.update({
    where: { id: a.id },
    data: {
      channelId, externalId: res.externalId ?? ch.id,
      ...(res.profile?.username !== undefined ? { username: res.profile.username } : { username: ch.username ?? ch.name ?? a.username }),
      ...(res.profile?.displayName !== undefined ? { displayName: res.profile.displayName } : { displayName: ch.name ?? a.displayName }),
      ...(res.profile?.avatarUrl !== undefined ? { avatarUrl: res.profile.avatarUrl } : ch.avatarUrl ? { avatarUrl: ch.avatarUrl } : {}),
      ...(res.token ? tokenColumns({ ...runtimeOf(a).token, ...res.token, secrets: { ...(runtimeOf(a).token.secrets ?? {}), ...(res.token.secrets ?? {}) } }) : {}),
    },
  });
}

async function softDelete(actor: Actor | ReturnType<typeof systemActor>, accountId: string) {
  const a = await prisma.socialAccount.findUniqueOrThrow({ where: { id: accountId }, include: { mastodonServer: true } });
  const ad = adapter(a.type as NetworkType);
  if (ad.revoke) await ad.revoke(networkContext(a.type as NetworkType), runtimeOf(a)).catch(() => undefined);
  const out = await prisma.$transaction(async tx => {
    const d = await tx.socialAccount.update({ where: { id: a.id }, data: { deletedAt: new Date(), state: 'DISCONNECTED', accessTokenEnc: null, refreshTokenEnc: null, secretsEnc: null } });
    // Scheduled posts for this account can no longer publish there.
    await tx.postSocialAccount.updateMany({ where: { socialAccountId: a.id, targetStatus: 'PENDING' }, data: { targetStatus: 'ERROR', error: { code: 'NOT_FOUND', errorMessage: 'The social account was disconnected.', isTransient: false, retryability: 'non_retryable', userFacingMessage: 'The social account was disconnected before publishing. Reconnect it and retry.' } } });
    await audit(tx, actor, 'socialAccount.disconnect', 'SocialAccount', a.id, `Disconnected ${ad.displayName} ${a.username ?? ''}`.trim());
    return { d, ids: await emit(tx, actor.organizationId, 'social-account.deleted', S.socialAccount(d)) };
  });
  void flushDeliveries(out.ids);
  return out.d;
}
export const disconnectAccount = softDelete;

const optionKeys = ['disableAutoLogin', 'tiktokForceLogin', 'forceBrowserOAuth', 'instagramConnectionMethod', 'withBusinessScope', 'withMessagingScope', 'appPassword', 'identifier'];
const pickOptions = (b: Record<string, unknown>) => Object.fromEntries(Object.entries(b).filter(([k]) => optionKeys.includes(k) || k.startsWith('with')));

define({
  'socialAccount.connect': async ({ actor, body }) => {
    await teamOf(actor, body.teamId);
    return startConnect({ type: body.type, teamId: body.teamId, organizationId: actor.organizationId, redirectUrl: body.redirectUrl, serverUrl: body.serverUrl, options: pickOptions(body) });
  },

  'socialAccount.disconnect': async ({ actor, body }) => S.socialAccount(await softDelete(actor, (await accountOf(actor, body.teamId, body.type)).id)),

  'socialAccount.setChannel': async ({ actor, body }) => {
    const a = await accountOf(actor, body.teamId, body.type);
    const updated = await selectChannel(prisma, a.id, body.channelId);
    const ids = await emit(prisma, actor.organizationId, 'social-account.updated', S.socialAccount(updated));
    void flushDeliveries(ids);
    return S.socialAccount(updated);
  },

  'socialAccount.unsetChannel': async ({ actor, body }) => {
    const a = await accountOf(actor, body.teamId, body.type);
    const updated = await prisma.socialAccount.update({ where: { id: a.id }, data: { channelId: null, externalId: a.providerPageId } });
    return S.socialAccount(updated);
  },

  'socialAccount.refreshChannels': async ({ actor, body }) => {
    const a = await accountOf(actor, body.teamId, body.type);
    const ad = adapter(a.type as NetworkType);
    if (!ad.listChannels) throw badRequest(`${ad.displayName} accounts have no channels.`);
    const rt = await loadAccount(a.id).catch(networkFailure);
    const channels = await ad.listChannels(networkContext(a.type as NetworkType), rt).catch(networkFailure);
    const keep = a.channelId && channels.some(c => c.id === a.channelId) ? a.channelId : null;
    return S.socialAccount(await prisma.socialAccount.update({ where: { id: a.id }, data: { channels: channels as object[], channelId: keep } }));
  },

  'socialAccount.createPortalLink': async ({ actor, body }) => {
    await teamOf(actor, body.teamId);
    const org = await prisma.organization.findUniqueOrThrow({ where: { id: actor.organizationId } });
    const token = randomToken(24);
    await prisma.portalLink.create({ data: {
      organizationId: org.id, teamId: body.teamId, tokenHash: sha256(token), allowedTypes: body.socialAccountTypes, redirectUrl: body.redirectUrl ?? null,
      logoUrl: body.logoUrl ?? org.portalLogoUrl, brandName: body.brandName ?? org.portalBrandName ?? org.name, accentColor: body.accentColor ?? org.portalAccentColor,
      language: body.language ?? null, expiresAt: new Date(Date.now() + (Number(body.expiresInHours ?? 24) * 3600_000)),
    } });
    return { url: appUrl(`/connect/${token}`) };
  },

  'socialAccount.connectionCheck': async ({ actor, body }) => {
    const a = await accountOf(actor, body.teamId, body.type);
    const ok = await checkOne(a.id);
    return { ...S.socialAccount(await prisma.socialAccount.findUniqueOrThrow({ where: { id: a.id } })), connected: ok };
  },

  'socialAccount.profileRefresh': async ({ actor, body }) => {
    const a = await accountOf(actor, body.teamId, body.type);
    const ad = adapter(a.type as NetworkType);
    const rt = await loadAccount(a.id).catch(networkFailure);
    const p = await ad.refreshProfile(networkContext(a.type as NetworkType), rt).catch(networkFailure);
    const data: Record<string, unknown> = { profileRefreshedAt: new Date() };
    for (const k of ['username', 'displayName', 'avatarUrl', 'bio', 'userUsername', 'userDisplayName', 'userEmail'] as const) if (p[k] !== undefined) data[k] = p[k];
    if (p.channels) data.channels = p.channels;
    return S.socialAccount(await prisma.socialAccount.update({ where: { id: a.id }, data }));
  },

  'socialAccount.getByType': async ({ actor, query }) => S.socialAccount(await accountOf(actor, query.teamId, query.type)),

  'socialAccount.copy': async ({ actor, body }) => {
    requirePermission(actor, 'teams.manage');
    await teamOf(actor, body.fromTeamId);
    await teamOf(actor, body.toTeamId);
    const src = await prisma.socialAccount.findMany({ where: { teamId: body.fromTeamId, type: { in: body.socialAccountTypes }, deletedAt: null } });
    const created = await prisma.$transaction(async tx => {
      const out = []; const ids: string[] = [];
      for (const a of src) {
        const clash = await tx.socialAccount.findFirst({ where: { teamId: body.toTeamId, type: a.type, deletedAt: null } });
        if (clash) continue;
        const { id: _id, createdAt: _c, updatedAt: _u, teamId: _t, ...rest } = a;
        const c = await tx.socialAccount.create({ data: { ...(rest as any), channels: a.channels ?? undefined, teamId: body.toTeamId, ...(body.resetChannel ? { channelId: null, externalId: a.providerPageId } : {}) } });
        out.push(c);
        ids.push(...(await emit(tx, actor.organizationId, 'social-account.created', S.socialAccount(c))));
      }
      await audit(tx, actor, 'socialAccount.copy', 'Team', body.toTeamId, `Copied ${out.length} account(s) to another team`);
      return { out, ids };
    });
    void flushDeliveries(created.ids);
    return created.out.map(S.socialAccount);
  },

  'socialAccount.getAccountsToDelete': async ({ actor, query }) => {
    const page = Math.max(1, Number(query.page ?? 1)); const pageSize = Math.min(100, Math.max(1, Number(query.pageSize ?? 20)));
    const where = { deletedAt: null, deleteOn: { not: null }, team: { organizationId: actor.organizationId } };
    const [rows, total] = await Promise.all([prisma.socialAccount.findMany({ where, orderBy: { deleteOn: 'asc' }, skip: (page - 1) * pageSize, take: pageSize }), prisma.socialAccount.count({ where })]);
    return { items: rows.map(S.socialAccount), total, page, pageSize };
  },

  // ── hosted connect portal (public) ──
  'portal.info': async ({ params }) => {
    const l = await portalLink(params.token);
    const [org, team, accounts] = await Promise.all([
      prisma.organization.findUniqueOrThrow({ where: { id: l.organizationId } }),
      prisma.team.findUniqueOrThrow({ where: { id: l.teamId } }),
      prisma.socialAccount.findMany({ where: { teamId: l.teamId, deletedAt: null, type: { in: l.allowedTypes } } }),
    ]);
    return {
      organizationName: org.name ?? 'Organization', brandName: l.brandName, logoUrl: l.logoUrl, accentColor: l.accentColor, teamName: team.name,
      allowedTypes: l.allowedTypes.filter(t => isConfigured(t as NetworkType)),
      connected: accounts.map(a => ({ type: a.type, username: a.username, displayName: a.displayName, avatarUrl: a.avatarUrl, needsChannel: adapter(a.type as NetworkType).capabilities.channels === 'required' && !a.channelId, channels: a.channels ?? [] })),
      redirectUrl: l.redirectUrl, expiresAt: l.expiresAt.toISOString(),
    };
  },

  'portal.connect': async ({ params, body }) => {
    const l = await portalLink(params.token);
    if (!l.allowedTypes.includes(body.type)) throw badRequest('This network is not offered on this link.');
    return startConnect({ type: body.type, teamId: l.teamId, organizationId: l.organizationId, redirectUrl: l.redirectUrl, serverUrl: body.serverUrl, portalLinkId: l.id, portalToken: params.token });
  },

  'portal.disconnect': async ({ params, body }) => {
    const l = await portalLink(params.token);
    const a = await prisma.socialAccount.findFirst({ where: { teamId: l.teamId, type: body.type, deletedAt: null } });
    if (!a || !l.allowedTypes.includes(a.type)) throw notFound('Social account');
    await softDelete(systemActor(l.organizationId), a.id);
    return { success: true };
  },
});

async function portalLink(token: string) {
  const l = await prisma.portalLink.findUnique({ where: { tokenHash: sha256(token) } });
  if (!l || l.expiresAt < new Date()) throw notFound('Connection link (it may have expired)');
  const team = await prisma.team.findUnique({ where: { id: l.teamId } });
  if (!team || team.deletedAt) throw notFound('Connection link');
  return l;
}

/** Ask the network whether the grant still works; mark NEEDS_RECONNECT and schedule deletion if not. */
export async function checkOne(accountId: string): Promise<boolean> {
  const a = await prisma.socialAccount.findUniqueOrThrow({ where: { id: accountId }, include: { mastodonServer: true, team: { include: { organization: true } } } });
  const ad = adapter(a.type as NetworkType);
  let ok: boolean;
  try {
    const rt = await loadAccount(a.id);
    ok = await ad.checkConnection(networkContext(a.type as NetworkType), rt);
  } catch (err) {
    if (isNetworkError(err) && (err.code === 'TOKEN_INVALID' || err.code === 'PERMISSION')) ok = false;
    else { logger.warn({ err, accountId }, 'connection check inconclusive'); return a.state === 'CONNECTED'; }
  }
  const org = a.team.organization;
  if (ok) {
    if (a.state !== 'CONNECTED' || a.deleteOn) await prisma.socialAccount.update({ where: { id: a.id }, data: { state: 'CONNECTED', stateReason: null, deleteOn: null, lastCheckedAt: new Date() } });
    else await prisma.socialAccount.update({ where: { id: a.id }, data: { lastCheckedAt: new Date() } });
    return true;
  }
  const deleteOn = new Date(Date.now() + org.deleteAccountAfter * 3600_000);
  const updated = await prisma.socialAccount.update({ where: { id: a.id }, data: { state: 'NEEDS_RECONNECT', stateReason: a.stateReason ?? 'The network no longer accepts this connection.', disconnectedCheckTryAt: new Date(), lastCheckedAt: new Date(), deleteOn: a.deleteOn ?? deleteOn } });
  if (a.state === 'CONNECTED') {
    const ids = await emit(prisma, org.id, 'social-account.updated', S.socialAccount(updated));
    void flushDeliveries(ids);
  }
  return false;
}

/** Raw routes (not in the OpenAPI document): the OAuth callback every network redirects to. */
export async function accountRawRoutes(app: FastifyInstance) {
  const cb = async (req: any, reply: any) => {
    const type = String(req.params.type).toUpperCase() as NetworkType;
    if (!S.NETWORK_TYPES.includes(type)) return reply.status(404).send({ statusCode: 404, message: 'Unknown network.' });
    const query = { ...(req.query ?? {}), ...(typeof req.body === 'object' && req.body ? req.body : {}) } as Record<string, string>;
    const out = await finishConnect(type, query);
    if (!out.redirect) return reply.type('text/html').send(`<!doctype html><meta charset="utf-8"><title>Siar</title><body style="font-family:system-ui;padding:40px;color:#111827"><h1 style="font-size:20px">Connection link expired</h1><p>${out.error}</p></body>`);
    return reply.redirect(out.redirect, 302);
  };
  app.get('/api/v1/social-account/callback/:type', cb);
  app.post('/api/v1/social-account/callback/:type', cb);
}
