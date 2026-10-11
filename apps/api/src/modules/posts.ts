import type { NetworkType } from '@siar/networks';
import { prisma, type Db } from '../platform/db.js';
import { audit } from '../platform/audit.js';
import { badRequest, conflict, notFound, validation, type Issue } from '../platform/errors.js';
import { listOf, pageOf } from '../platform/http.js';
import { adapter, isConfigured, networkContext, runtimeOf } from '../platform/networks.js';
import { enqueue, JOBS } from '../platform/queue.js';
import { define } from '../platform/routes.js';
import type { Actor } from '../platform/auth.js';
import * as S from '../domain/serialize.js';
import { COMMENT_LENGTH, limitsFor, RESOURCE_LIMITS } from '../domain/plans.js';
import { accountKey, consumeDaily, consumeOrg, releaseDaily } from '../domain/quota.js';
import { kickTargets, recomputePost } from '../engine/publisher.js';
import { teamOf } from './teams.js';
import { networkFailure } from './accounts.js';
import type { CreatedVia, PostStatus } from '../generated/prisma/enums.js';

export const postInclude = { uploads: { include: { upload: true } }, socialAccounts: { include: { socialAccount: true } } } as const;

/** firstComment.<TYPE> is a string on the wire; tolerate { text } too. */
export const fcText = (v: unknown): string | null => (typeof v === 'string' ? v : v && typeof (v as any).text === 'string' ? (v as any).text : null) || null;

/** Every upload id a network entry references, wherever the public API lets one appear. */
export function uploadIdsOf(entry: Record<string, any> | undefined | null): string[] {
  if (!entry) return [];
  const ids = new Set<string>();
  for (const id of entry.uploadIds ?? []) ids.add(id);
  for (const m of entry.mediaItems ?? []) if (m?.uploadId) ids.add(m.uploadId);
  for (const c of entry.carouselItems ?? []) { if (c?.uploadId) ids.add(c.uploadId); for (const id of c?.uploadIds ?? []) ids.add(id); }
  for (const t of entry.thread ?? []) for (const id of t?.uploadIds ?? []) ids.add(id);
  return [...ids];
}
/** The media of the post body itself, in order (what validate() and publish() receive). */
export function primaryUploadIds(entry: Record<string, any>): string[] {
  if (entry.mediaItems?.length) return entry.mediaItems.map((m: any) => m.uploadId);
  if (entry.carouselItems?.length) return entry.carouselItems.map((c: any) => c.uploadId ?? c.uploadIds?.[0]).filter(Boolean);
  return entry.uploadIds ?? [];
}

const verboseOf = async (orgId: string) => (await prisma.organization.findUnique({ where: { id: orgId }, select: { showVerboseErrors: true } }))?.showVerboseErrors ?? false;

export async function postOf(actor: Actor, id: string) {
  const p = await prisma.post.findFirst({ where: { id, organizationId: actor.organizationId }, include: postInclude });
  if (!p) throw notFound('Post');
  return p;
}

interface Draft { teamId: string; title: string; referenceKey?: string | null; postDate: Date; status: 'DRAFT' | 'SCHEDULED'; types: NetworkType[]; data: Record<string, any>; firstComment?: Record<string, any> | null }

/**
 * Validate a post the way publishing will see it: accounts connected (with a channel where the
 * network needs one), uploads present, each network's own rules, first comment lengths.
 * Returns the accounts and uploads it resolved.
 */
export async function checkDraft(actor: Actor, d: Draft) {
  const issues: Issue[] = [];
  const keys = Object.keys(d.data ?? {});
  for (const k of keys) if (!d.types.includes(k as NetworkType)) issues.push({ code: 'mismatch', message: `data.${k} is set but ${k} is not in socialAccountTypes.`, path: ['data', k] });
  for (const t of d.types) if (!d.data?.[t]) issues.push({ code: 'required', message: `data.${t} is required because ${t} is in socialAccountTypes.`, path: ['data', t] });
  if (new Set(d.types).size !== d.types.length) issues.push({ code: 'duplicate', message: 'socialAccountTypes has duplicates.', path: ['socialAccountTypes'] });
  if (issues.length) throw validation(issues, `Validation failed: ${issues[0].message}`);

  const accounts = await prisma.socialAccount.findMany({ where: { teamId: d.teamId, type: { in: d.types }, deletedAt: null }, include: { mastodonServer: true } });
  const allIds = [...new Set(d.types.flatMap(t => uploadIdsOf(d.data[t])).concat(Object.values(d.firstComment ?? {}).flatMap((c: any) => (c && typeof c === 'object' ? c.uploadIds ?? [] : []))))];
  const uploads = allIds.length ? await prisma.upload.findMany({ where: { id: { in: allIds }, organizationId: actor.organizationId, deletedAt: null } }) : [];
  const byId = new Map(uploads.map(u => [u.id, u]));
  for (const id of allIds) if (!byId.has(id)) issues.push({ code: 'not_found', message: `Upload ${id} does not exist or was deleted.`, path: ['uploadIds'] });

  for (const t of d.types) {
    const a = accounts.find(x => x.type === t);
    const ad = adapter(t);
    if (!isConfigured(t)) { issues.push({ code: 'unavailable', message: `${ad.displayName} is not available on this server yet.`, path: ['socialAccountTypes'] }); continue; }
    if (!a) { issues.push({ code: 'not_connected', message: `No ${ad.displayName} account is connected to this team.`, path: ['socialAccountTypes'] }); continue; }
    if (ad.capabilities.channels === 'required' && !a.channelId) issues.push({ code: 'channel_required', message: `Choose which ${ad.displayName} ${t === 'DISCORD' || t === 'SLACK' ? 'channel' : t === 'PINTEREST' ? 'board' : t === 'GOOGLE_BUSINESS' ? 'location' : 'page'} to post to (social-account/set-channel).`, path: ['data', t] });
    const entry = d.data[t];
    const media = primaryUploadIds(entry).map(id => byId.get(id)).filter(Boolean).map(u => ({ type: u!.type, mime: u!.mime ?? '', fileSize: u!.fileSize ?? 0, width: u!.width, height: u!.height, duration: u!.videoLength }));
    for (const i of ad.validate(entry, media)) issues.push({ ...i, path: ['data', t, ...i.path] });
    const fc = fcText(d.firstComment?.[t]);
    if (fc) {
      const max = COMMENT_LENGTH[t];
      if (!ad.capabilities.firstComment || !max) issues.push({ code: 'unsupported', message: `${ad.displayName} does not support a first comment.`, path: ['firstComment', t] });
      else if ([...fc].length > max) issues.push({ code: 'too_long', message: `First comment is limited to ${max} characters on ${ad.displayName}.`, path: ['firstComment', t] });
    }
  }
  if (issues.length) throw validation(issues, `Validation failed: ${issues[0].message}`);
  return { accounts, uploads };
}

/** Quotas for a post leaving DRAFT: 1 monthly post, 1 daily post per account on its postDate (UTC). */
async function consumeForSchedule(tx: Db, organizationId: string, accounts: { id: string; type: string; providerPageId: string | null }[], postDate: Date, firstComments: number) {
  const org = await tx.organization.findUniqueOrThrow({ where: { id: organizationId } });
  const l = limitsFor(org);
  await consumeOrg(tx, org.id, 'posts', 1, l.posts);
  if (firstComments) await consumeOrg(tx, org.id, 'comments', firstComments, l.comments);
  for (const a of accounts) await consumeDaily(tx, accountKey(a.type, a.providerPageId, a.id), 'posts', 1, l.dailyPosts[a.type as NetworkType], postDate, adapter(a.type as NetworkType).displayName + ' post');
}

const parseDate = (v: unknown, path = 'postDate') => {
  const d = new Date(String(v));
  if (Number.isNaN(d.getTime())) throw badRequest(`${path} must be an ISO 8601 date-time.`, [{ code: 'invalid_date', message: 'Invalid date', path: [path] }]);
  return d;
};

export async function createPost(actor: Actor, body: any, via: CreatedVia = 'API') {
  await teamOf(actor, body.teamId);
  const d: Draft = { teamId: body.teamId, title: body.title, referenceKey: body.referenceKey ?? null, postDate: parseDate(body.postDate), status: body.status, types: body.socialAccountTypes, data: body.data, firstComment: body.firstComment ?? null };
  if (d.referenceKey && (await prisma.post.findFirst({ where: { organizationId: actor.organizationId, referenceKey: d.referenceKey } }))) throw conflict(`A post with referenceKey "${d.referenceKey}" already exists.`);
  const { accounts, uploads } = await checkDraft(actor, d);
  const firstComments = Object.values(d.firstComment ?? {}).filter(c => fcText(c)).length;
  const post = await prisma.$transaction(async tx => {
    if (d.status === 'SCHEDULED') await consumeForSchedule(tx, actor.organizationId, accounts, d.postDate, firstComments);
    const p = await tx.post.create({
      data: {
        teamId: d.teamId, organizationId: actor.organizationId, title: d.title, referenceKey: d.referenceKey, postDate: d.postDate, status: d.status,
        data: d.data, firstComment: d.firstComment ?? undefined, createdVia: via, createdById: actor.userId ?? null, countedAt: d.status === 'SCHEDULED' ? new Date() : null,
        uploads: { create: uploads.map(u => ({ uploadId: u.id })) },
        socialAccounts: { create: accounts.map(a => ({ socialAccountId: a.id, type: a.type })) },
      },
      include: postInclude,
    });
    await tx.upload.updateMany({ where: { id: { in: uploads.map(u => u.id) } }, data: { pinned: true, lastUsedAt: new Date() } });
    await audit(tx, actor, 'post.create', 'Post', p.id, `${d.status === 'DRAFT' ? 'Drafted' : 'Scheduled'} "${p.title}" for ${d.types.join(', ')}`);
    return p;
  });
  if (post.status === 'SCHEDULED') await kickTargets(post.id, post.postDate!);
  return post;
}

define({
  'post.create': async ({ actor, body }) => S.post(await createPost(actor, body, actor.kind === 'USER' ? 'DASHBOARD' : 'API'), { verbose: await verboseOf(actor.organizationId) }),

  'post.get': async ({ actor, params }) => S.post(await postOf(actor, params.id), { verbose: await verboseOf(actor.organizationId) }),

  'post.getByReferenceKey': async ({ actor, params }) => {
    const p = await prisma.post.findFirst({ where: { organizationId: actor.organizationId, referenceKey: params.referenceKey }, include: postInclude });
    if (!p) throw notFound('Post');
    return S.post(p, { verbose: await verboseOf(actor.organizationId) });
  },

  'post.getList': async ({ actor, query }) => {
    await teamOf(actor, query.teamId);
    const p = pageOf(query);
    const platforms = query.platforms ? (Array.isArray(query.platforms) ? query.platforms : String(query.platforms).split(',')) : null;
    const statuses = query.status ? (Array.isArray(query.status) ? query.status : String(query.status).split(',')) : null;
    const where: any = {
      teamId: query.teamId, organizationId: actor.organizationId,
      ...(statuses ? { status: { in: statuses } } : { status: { not: 'DELETED' } }),
      ...(platforms ? { socialAccounts: { some: { type: { in: platforms } } } } : {}),
      ...(query.q ? { title: { contains: String(query.q), mode: 'insensitive' } } : {}),
      ...(query.postDateFrom || query.postDateTo ? { postDate: { ...(query.postDateFrom ? { gte: parseDate(query.postDateFrom, 'postDateFrom') } : {}), ...(query.postDateTo ? { lte: parseDate(query.postDateTo, 'postDateTo') } : {}) } } : {}),
    };
    const orderField = ['postDate', 'createdAt', 'updatedAt', 'postedDate'].includes(String(query.orderBy)) ? String(query.orderBy) : 'postDate';
    const [rows, total] = await Promise.all([
      prisma.post.findMany({ where, include: postInclude, orderBy: [{ [orderField]: query.order === 'ASC' || query.order === 'asc' ? 'asc' : 'desc' }, { id: 'desc' }], ...p }),
      prisma.post.count({ where }),
    ]);
    const verbose = await verboseOf(actor.organizationId);
    return listOf(rows.map(r => S.post(r, { verbose })), total);
  },

  'post.update': async ({ actor, params, body }) => {
    const p = await postOf(actor, params.id);
    if (!['DRAFT', 'SCHEDULED', 'ERROR'].includes(p.status)) throw badRequest(`A ${p.status.toLowerCase()} post cannot be edited here. Use the network's edit endpoint under /misc for published posts.`);
    if (p.status === 'ERROR' && p.socialAccounts.some(t => t.targetStatus === 'POSTED')) throw badRequest('Part of this post is already published. Retry it instead of editing.');
    const merged: Draft = {
      teamId: p.teamId,
      title: body.title ?? p.title,
      referenceKey: 'referenceKey' in body ? body.referenceKey : p.referenceKey,
      postDate: body.postDate ? parseDate(body.postDate) : p.postDate!,
      status: body.status ?? (p.status === 'ERROR' ? 'SCHEDULED' : (p.status as 'DRAFT' | 'SCHEDULED')),
      types: body.socialAccountTypes ?? p.socialAccounts.map(t => t.type as NetworkType),
      data: body.data ?? (p.data as Record<string, any>),
      firstComment: 'firstComment' in body ? body.firstComment : (p.firstComment as Record<string, any> | null),
    };
    if (merged.referenceKey && merged.referenceKey !== p.referenceKey && (await prisma.post.findFirst({ where: { organizationId: actor.organizationId, referenceKey: merged.referenceKey, id: { not: p.id } } }))) throw conflict(`A post with referenceKey "${merged.referenceKey}" already exists.`);
    const { accounts, uploads } = await checkDraft(actor, merged);
    const firstComments = Object.values(merged.firstComment ?? {}).filter(c => fcText(c)).length;
    const updated = await prisma.$transaction(async tx => {
      // Re-lock the post row so a publish claim and an edit cannot interleave.
      const locked = await tx.$queryRaw<{ status: PostStatus }[]>`SELECT status FROM "Post" WHERE id = ${p.id} FOR UPDATE`;
      if (!locked.length || !['DRAFT', 'SCHEDULED', 'ERROR'].includes(locked[0].status)) throw badRequest('The post started publishing and can no longer be edited.');
      const wasCounted = !!p.countedAt;
      if (merged.status === 'SCHEDULED' && !wasCounted) await consumeForSchedule(tx, actor.organizationId, accounts, merged.postDate, firstComments);
      else if (wasCounted && merged.status === 'SCHEDULED') {
        // Moving day or adding networks moves the daily caps with it (monthly stays counted once).
        const org = await tx.organization.findUniqueOrThrow({ where: { id: actor.organizationId } });
        const l = limitsFor(org);
        const before = p.socialAccounts.map(t => ({ id: t.socialAccountId, type: t.type, providerPageId: t.socialAccount.providerPageId }));
        const dayChanged = merged.postDate.toISOString().slice(0, 10) !== p.postDate!.toISOString().slice(0, 10);
        for (const a of before) if (dayChanged || !accounts.some(x => x.id === a.id)) await releaseDaily(tx, accountKey(a.type, a.providerPageId, a.id), 'posts', 1, p.postDate!);
        for (const a of accounts) if (dayChanged || !before.some(x => x.id === a.id)) await consumeDaily(tx, accountKey(a.type, a.providerPageId, a.id), 'posts', 1, l.dailyPosts[a.type as NetworkType], merged.postDate, adapter(a.type as NetworkType).displayName + ' post');
      }
      await tx.postSocialAccount.deleteMany({ where: { postId: p.id, socialAccountId: { notIn: accounts.map(a => a.id) } } });
      for (const a of accounts) {
        await tx.postSocialAccount.upsert({
          where: { postId_socialAccountId: { postId: p.id, socialAccountId: a.id } },
          update: { targetStatus: 'PENDING', error: undefined, attemptId: null, pendingRef: null, nextPollAt: null },
          create: { postId: p.id, socialAccountId: a.id, type: a.type },
        });
      }
      await tx.postUpload.deleteMany({ where: { postId: p.id, uploadId: { notIn: uploads.map(u => u.id) } } });
      for (const u of uploads) await tx.postUpload.upsert({ where: { postId_uploadId: { postId: p.id, uploadId: u.id } }, update: { deletedAt: null }, create: { postId: p.id, uploadId: u.id } });
      await tx.upload.updateMany({ where: { id: { in: uploads.map(u => u.id) } }, data: { pinned: true, lastUsedAt: new Date() } });
      const up = await tx.post.update({
        where: { id: p.id },
        data: { title: merged.title, referenceKey: merged.referenceKey, postDate: merged.postDate, status: merged.status, data: merged.data, firstComment: merged.firstComment ?? undefined, error: null, countedAt: p.countedAt ?? (merged.status === 'SCHEDULED' ? new Date() : null) },
        include: postInclude,
      });
      await tx.postSocialAccount.updateMany({ where: { postId: p.id }, data: { error: undefined } });
      await audit(tx, actor, 'post.update', 'Post', p.id, `Updated "${up.title}"`);
      return up;
    });
    if (updated.status === 'SCHEDULED') await kickTargets(updated.id, updated.postDate!);
    return S.post(await prisma.post.findUniqueOrThrow({ where: { id: updated.id }, include: postInclude }), { verbose: await verboseOf(actor.organizationId) });
  },

  'post.delete': async ({ actor, params }) => {
    const p = await postOf(actor, params.id);
    if (p.status === 'DELETED') return S.post(p);
    if (p.status === 'PROCESSING') throw badRequest('This post is publishing right now. Wait for it to finish, then delete it.');
    // Published targets are deleted on the network where the network allows it.
    const failures: string[] = [];
    for (const t of p.socialAccounts.filter(t => t.targetStatus === 'POSTED' && t.externalPostId)) {
      const ad = adapter(t.type as NetworkType);
      if (!ad.deletePost) continue;
      try {
        const a = await prisma.socialAccount.findUniqueOrThrow({ where: { id: t.socialAccountId }, include: { mastodonServer: true } });
        await ad.deletePost(networkContext(t.type as NetworkType), runtimeOf(a), t.externalPostId!);
        await prisma.postSocialAccount.update({ where: { postId_socialAccountId: { postId: p.id, socialAccountId: t.socialAccountId } }, data: { targetStatus: 'DELETED', deletedAt: new Date() } });
      } catch (err) { failures.push(`${ad.displayName}: ${(err as Error).message}`); }
    }
    const d = await prisma.$transaction(async tx => {
      const d = await tx.post.update({ where: { id: p.id }, data: { status: 'DELETED', deletedAt: new Date(), error: failures.length ? `Could not delete on: ${failures.join('; ')}` : null }, include: postInclude });
      await tx.postSocialAccount.updateMany({ where: { postId: p.id, targetStatus: { in: ['PENDING', 'ERROR'] } }, data: { targetStatus: 'DELETED', deletedAt: new Date() } });
      await tx.upload.updateMany({ where: { posts: { some: { postId: p.id } } }, data: { pinned: false, lastUsedAt: new Date() } });
      await audit(tx, actor, 'post.delete', 'Post', p.id, `Deleted "${p.title}"`);
      return d;
    });
    return S.post(d);
  },

  'post.retry': async ({ actor, params }) => {
    const p = await postOf(actor, params.id);
    if (p.status !== 'ERROR') throw badRequest(`Only posts in ERROR can be retried (this one is ${p.status}).`);
    if (p.retryCount >= RESOURCE_LIMITS.maxRetries) throw badRequest(`This post was already retried ${RESOURCE_LIMITS.maxRetries} times. Create a new post.`);
    const failed = p.socialAccounts.filter(t => t.targetStatus === 'ERROR');
    if (!failed.length) throw badRequest('Nothing to retry.');
    await prisma.$transaction(async tx => {
      await tx.postSocialAccount.updateMany({ where: { postId: p.id, targetStatus: 'ERROR' }, data: { targetStatus: 'PENDING', attemptId: null, pendingRef: null, nextPollAt: null } });
      await tx.post.update({ where: { id: p.id }, data: { status: 'RETRYING', retryCount: { increment: 1 }, error: null } });
      await audit(tx, actor, 'post.retry', 'Post', p.id, `Retried "${p.title}" on ${failed.map(t => t.type).join(', ')}`);
    });
    await kickTargets(p.id, new Date());
    return S.post(await prisma.post.findUniqueOrThrow({ where: { id: p.id }, include: postInclude }), { verbose: await verboseOf(actor.organizationId) });
  },

  'post.getReconnectSocialAccountCandidates': async ({ actor, query }) => {
    await teamOf(actor, query.teamId);
    const p = pageOf(query);
    const where = candidatesWhere(query.teamId, query.type);
    const [rows, total] = await Promise.all([prisma.post.findMany({ where, include: postInclude, orderBy: { postDate: 'asc' }, ...p }), prisma.post.count({ where })]);
    return listOf(rows.map(r => S.post(r)), total);
  },

  'post.reconnectSocialAccount': async ({ actor, body }) => {
    await teamOf(actor, body.teamId);
    const current = await prisma.socialAccount.findFirst({ where: { teamId: body.teamId, type: body.type, deletedAt: null } });
    if (!current) throw notFound(`${body.type} social account for this team`);
    const posts = await prisma.post.findMany({ where: { ...candidatesWhere(body.teamId, body.type), ...(body.postIds?.length ? { id: { in: body.postIds } } : {}) }, include: { socialAccounts: true } });
    let moved = 0;
    await prisma.$transaction(async tx => {
      for (const p of posts) {
        const old = p.socialAccounts.find(t => t.type === body.type);
        if (!old || old.socialAccountId === current.id) continue;
        await tx.postSocialAccount.delete({ where: { postId_socialAccountId: { postId: p.id, socialAccountId: old.socialAccountId } } });
        await tx.postSocialAccount.create({ data: { postId: p.id, socialAccountId: current.id, type: current.type } });
        if (p.status === 'ERROR') await tx.post.update({ where: { id: p.id }, data: { status: 'SCHEDULED' } });
        moved++;
      }
      await audit(tx, actor, 'post.reconnect', 'SocialAccount', current.id, `Moved ${moved} post(s) to the reconnected ${body.type} account`);
    });
    for (const p of posts) await recomputePost(p.id);
    return { success: true, count: moved };
  },
});

/** Posts still waiting to publish whose target account for `type` was disconnected/replaced. */
const candidatesWhere = (teamId: string, type: string) => ({
  teamId, status: { in: ['DRAFT', 'SCHEDULED', 'ERROR'] as PostStatus[] },
  socialAccounts: { some: { type: type as NetworkType, targetStatus: { in: ['PENDING', 'ERROR'] as any }, socialAccount: { deletedAt: { not: null } } } },
});

// Re-exported for CSV import and MCP.
export { networkFailure };
