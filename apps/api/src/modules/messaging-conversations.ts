import { isNetworkError, type MediaRef, type NetworkType } from '@siar/networks';
import type { Conversation, FetchedComment, SocialAccount } from '../generated/prisma/client.js';
import { requirePermission, type Actor } from '../platform/auth.js';
import { prisma } from '../platform/db.js';
import { AppError, badRequest, conflict, notFound } from '../platform/errors.js';
import { listOf } from '../platform/http.js';
import { loadAccount, mediaRef, networkContext } from '../platform/networks.js';
import { define } from '../platform/routes.js';
import { limitsFor } from '../domain/plans.js';
import { accountKey, consumeAccountMonth } from '../domain/quota.js';
import * as S from '../domain/serialize.js';
import { networkFailure } from './accounts.js';
import {
  assertCanMessage, assertWindow, before, conversation, conversationOf, encodeCursor, gate, isMessagingType, message, messagingOf,
  orgIdOfTeam, pageArgs, publish, releaseAccountMonth, teamIn, urlMedia,
} from './messaging-shared.js';

/**
 * The DM inbox (Instagram / Facebook): enable messaging on an account, list conversations and
 * messages, send / react / mark read / private-reply, archive and reopen. Inbound traffic arrives
 * through the Meta webhook (messaging-webhook.ts).
 */

const PRIVATE_REPLY_WINDOW_MS = 7 * 24 * 3600_000;

const preview = (text: string | null | undefined, attachments: unknown[] = []) =>
  text ? text.slice(0, 200) : attachments.length ? '[attachment]' : null;

// ───────────────────────────── messaging switch ─────────────────────────────

async function setMessaging(actor: Actor, body: { teamId: string; type: string }, on: boolean) {
  requirePermission(actor, 'content');
  if (on) await gate(actor, 'dms');
  else await gate(actor);
  await teamIn(actor, body.teamId);
  const a = await prisma.socialAccount.findFirst({ where: { teamId: body.teamId, type: body.type as NetworkType, deletedAt: null } });
  if (!a) throw notFound(`${body.type} social account for this team`);
  const m = messagingOf(a.type);
  const shape = (x: SocialAccount) => ({ socialAccountId: x.id, type: x.type, messagingStatus: x.messagingStatus, messagingLastError: x.messagingLastError });
  const orgId = actor.organizationId;
  if (on) {
    if (a.state !== 'CONNECTED') throw new AppError(409, `This ${a.type} account needs to be reconnected before messaging can be enabled.`);
    try {
      await m.enable(networkContext(a.type as NetworkType), await loadAccount(a.id));
    } catch (err) {
      await prisma.socialAccount.update({ where: { id: a.id }, data: { messagingLastError: (err as Error).message?.slice(0, 1000) ?? 'Enabling messaging failed.', messagingStatusUpdatedAt: new Date() } });
      networkFailure(err);
    }
    const u = await prisma.socialAccount.update({ where: { id: a.id }, data: { messagingStatus: 'ENABLED', messagingLastError: null, messagingStatusUpdatedAt: new Date() } });
    await publish(orgId, [['social-account.updated', S.socialAccount(u)]]);
    return shape(u);
  }
  // Disable: DISABLE_PENDING until the network confirms the unsubscribe; a failure leaves it pending.
  await prisma.socialAccount.update({ where: { id: a.id }, data: { messagingStatus: 'DISABLE_PENDING', messagingStatusUpdatedAt: new Date() } });
  let u: SocialAccount;
  try {
    await m.disable(networkContext(a.type as NetworkType), await loadAccount(a.id));
    u = await prisma.socialAccount.update({ where: { id: a.id }, data: { messagingStatus: 'DISABLED', messagingLastError: null, messagingStatusUpdatedAt: new Date() } });
  } catch (err) {
    u = await prisma.socialAccount.update({ where: { id: a.id }, data: { messagingLastError: (err as Error).message?.slice(0, 1000) ?? 'Disabling messaging failed.' } });
  }
  await publish(orgId, [['social-account.updated', S.socialAccount(u)]]);
  return shape(u);
}

// ───────────────────────────── sending (shared with automations) ─────────────────────────────

export interface OutboundContent {
  text?: string | null;
  media?: MediaRef[];
  attachments?: unknown[];
  quickReplies?: unknown[];
  buttons?: unknown[];
  carousel?: unknown | null;
}

export interface SendOptions {
  source: 'API' | 'DM';
  /** Count against the monthly per-account DM quota (manual sends do; automation sends count as a run). */
  consumeQuota: boolean;
  replyToMessageId?: string | null;
  tag?: string | null;
  platformData?: Record<string, unknown>;
}

function hasContent(c: OutboundContent) {
  return !!(c.text?.trim() || c.media?.length || (c.carousel && (c.carousel as any).cards?.length));
}

/**
 * Send one message into a conversation: quota consumed with the PENDING row (atomic), the network
 * called outside the transaction, the row settled to SENT/FAILED. If the network's echo webhook
 * landed first (same externalMessageId), the echo row wins and `conflict: true` is returned.
 */
export async function sendToConversation(conv: Conversation, content: OutboundContent, opts: SendOptions) {
  const account = await prisma.socialAccount.findUniqueOrThrow({ where: { id: conv.socialAccountId } });
  assertCanMessage(account);
  if (!hasContent(content)) throw badRequest('A message needs text, attachments or a carousel.', [{ code: 'required', message: 'content is empty', path: ['content'] }]);
  assertWindow(conv, opts.tag);
  const m = messagingOf(account.type);
  const orgId = await orgIdOfTeam(conv.teamId);
  const key = accountKey(account.type, account.providerPageId, account.id);

  let replyTo: { externalMessageId: string | null; messageId: string; isSelfReply: boolean } | null = null;
  if (opts.replyToMessageId) {
    const r = await prisma.conversationMessage.findFirst({ where: { id: opts.replyToMessageId, conversationId: conv.id } });
    if (!r) throw badRequest('replyToMessageId is not a message of this conversation.', [{ code: 'not_found', message: 'Message not found', path: ['replyToMessageId'] }]);
    replyTo = { externalMessageId: r.externalMessageId, messageId: r.id, isSelfReply: r.direction === 'OUTBOUND' };
  }

  const pdata = { ...(opts.platformData ?? {}), ...(content.quickReplies?.length ? { quickReplies: content.quickReplies } : {}), ...(content.buttons?.length ? { buttons: content.buttons } : {}), ...(content.carousel ? { carousel: content.carousel } : {}), ...(opts.tag ? { tag: opts.tag } : {}) };
  const pending = await prisma.$transaction(async tx => {
    if (opts.consumeQuota) {
      const org = await tx.organization.findUniqueOrThrow({ where: { id: orgId } });
      await consumeAccountMonth(tx, key, 'dms', 1, limitsFor(org).dmsPerAccount, 'Monthly direct message');
    }
    return tx.conversationMessage.create({
      data: {
        conversationId: conv.id, teamId: conv.teamId, socialAccountId: conv.socialAccountId, platform: conv.platform, direction: 'OUTBOUND', status: 'PENDING',
        source: opts.source, text: content.text ?? null, attachments: (content.attachments ?? []) as object[], replyTo: replyTo ?? undefined, platformData: pdata as object,
      },
    });
  });

  let externalMessageId: string;
  try {
    // carousel/tag are passed alongside the MessagingAdapter.send input (see the report: interface gap).
    const input = { recipientId: conv.externalParticipantId, text: content.text ?? null, media: content.media ?? [], quickReplies: content.quickReplies, buttons: content.buttons, replyToExternalId: replyTo?.externalMessageId ?? null, carousel: content.carousel ?? undefined, tag: opts.tag ?? undefined };
    ({ externalMessageId } = await m.send(networkContext(account.type as NetworkType), await loadAccount(account.id), input));
  } catch (err) {
    if (opts.consumeQuota) await releaseAccountMonth(prisma, key, 'dms');
    const failed = await prisma.conversationMessage.update({ where: { id: pending.id }, data: { status: 'FAILED', failedAt: new Date(), error: ((err as Error).message ?? 'Sending failed.').slice(0, 1000) } });
    await publish(orgId, [['conversation.message.created', message(failed)]]);
    throw err;
  }

  const now = new Date();
  let sent; let isConflict = false;
  try {
    sent = await prisma.conversationMessage.update({ where: { id: pending.id }, data: { status: 'SENT', externalMessageId, sentAt: now } });
  } catch (err) {
    if ((err as any)?.code !== 'P2002') throw err;
    // The echo webhook already stored this message: keep that row, drop ours.
    await prisma.conversationMessage.delete({ where: { id: pending.id } });
    sent = await prisma.conversationMessage.update({ where: { socialAccountId_externalMessageId: { socialAccountId: conv.socialAccountId, externalMessageId } }, data: { source: opts.source, status: 'SENT', replyTo: replyTo ?? undefined, platformData: pdata as object } });
    isConflict = true;
  }
  const c = await prisma.conversation.update({ where: { id: conv.id }, data: { lastMessageAt: now, lastActivityAt: now, lastMessagePreview: preview(content.text, content.attachments ?? content.media) }, include: { socialAccount: true } });
  await publish(orgId, [['conversation.message.created', message(sent)], ['conversation.updated', conversation(c)]]);
  return { conversation: conversation(c), message: message(sent), conflict: isConflict };
}

/** Upsert the conversation with one participant (unique per account + participant). */
export async function upsertConversation(account: SocialAccount, participant: { id: string; username?: string | null; displayName?: string | null; avatarUrl?: string | null; externalConversationId?: string | null }, at: Date) {
  const existing = await prisma.conversation.findUnique({ where: { socialAccountId_externalParticipantId: { socialAccountId: account.id, externalParticipantId: participant.id } } });
  if (existing) {
    const patch: Record<string, unknown> = {};
    if (participant.username && participant.username !== existing.participantUsername) patch.participantUsername = participant.username;
    if (participant.displayName && participant.displayName !== existing.participantDisplayName) patch.participantDisplayName = participant.displayName;
    if (participant.avatarUrl && participant.avatarUrl !== existing.participantAvatarUrl) patch.participantAvatarUrl = participant.avatarUrl;
    if (participant.externalConversationId && !existing.externalConversationId) patch.externalConversationId = participant.externalConversationId;
    return { row: Object.keys(patch).length ? await prisma.conversation.update({ where: { id: existing.id }, data: patch }) : existing, created: false };
  }
  try {
    const row = await prisma.conversation.create({
      data: {
        teamId: account.teamId, socialAccountId: account.id, platform: account.type, externalParticipantId: participant.id, externalConversationId: participant.externalConversationId ?? null,
        participantUsername: participant.username ?? null, participantDisplayName: participant.displayName ?? null, participantAvatarUrl: participant.avatarUrl ?? null, lastActivityAt: at,
      },
    });
    return { row, created: true };
  } catch (err) {
    if ((err as any)?.code !== 'P2002') throw err;
    return { row: await prisma.conversation.findUniqueOrThrow({ where: { socialAccountId_externalParticipantId: { socialAccountId: account.id, externalParticipantId: participant.id } } }), created: false };
  }
}

/** The Siar post / imported post and permalink behind a comment, for privateReplyContext. */
async function postContext(c: FetchedComment) {
  let permalink: string | null = null; let thumb: string | null = null;
  if (c.externalPostId) {
    const pp = await prisma.profilePost.findUnique({ where: { socialAccountId_externalId: { socialAccountId: c.socialAccountId, externalId: c.externalPostId } } });
    permalink = pp?.permalink ?? null; thumb = pp?.smallThumbnail ?? pp?.thumbnail ?? null;
  }
  return { postId: c.postId ?? null, externalPostId: c.externalPostId ?? null, postPermalink: permalink, postThumbnailUrl: thumb };
}

/**
 * Reply privately (in DMs) to a comment. Meta allows exactly one private reply per comment, within
 * 7 days of the comment. Serialised per comment with an advisory lock so two callers cannot both send.
 */
export async function sendPrivateReply(comment: FetchedComment, content: { text: string; attachments?: unknown[]; carousel?: unknown | null }, opts: { source: 'API' | 'DM' | 'PRIVATE_REPLY'; consumeQuota: boolean; platformData?: Record<string, unknown> }) {
  if (!isMessagingType(comment.platform)) throw badRequest(`Private replies are only available for Instagram and Facebook comments.`);
  const account = await prisma.socialAccount.findUniqueOrThrow({ where: { id: comment.socialAccountId } });
  assertCanMessage(account);
  const at = comment.publishedAt ?? comment.createdAt;
  if (Date.now() - at.getTime() > PRIVATE_REPLY_WINDOW_MS) throw new AppError(403, `Meta only allows a private reply within 7 days of the comment. This comment was posted at ${at.toISOString()}.`);
  const m = messagingOf(account.type);
  const orgId = await orgIdOfTeam(comment.teamId);
  const key = accountKey(account.type, account.providerPageId, account.id);

  const ctxData = {
    fetchedCommentId: comment.id, externalCommentId: comment.externalId, text: comment.text ?? null, authorName: comment.authorName ?? null,
    authorAvatarUrl: comment.authorAvatarUrl ?? null, publishedAt: comment.publishedAt?.toISOString() ?? null, ...(await postContext(comment)),
  };
  // Until the network names the recipient's messaging id, the conversation keys on the comment author.
  const participantId = comment.authorExternalId ?? `comment:${comment.externalId}`;
  const { row: conv0, created } = await upsertConversation(account, { id: participantId, username: comment.authorName }, new Date());

  // Reserve the one private reply for this comment (the PENDING row) and the quota in one locked transaction.
  const pending = await prisma.$transaction(async tx => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${'private-reply:' + comment.id}))`;
    const prior = await tx.conversationMessage.findFirst({ where: { socialAccountId: account.id, source: 'PRIVATE_REPLY', status: { not: 'FAILED' }, privateReplyContext: { path: ['fetchedCommentId'], equals: comment.id } } });
    if (prior) throw conflict('This comment already has a private reply. Meta allows one private reply per comment.');
    if (opts.consumeQuota) {
      const org = await tx.organization.findUniqueOrThrow({ where: { id: orgId } });
      await consumeAccountMonth(tx, key, 'dms', 1, limitsFor(org).dmsPerAccount, 'Monthly direct message');
    }
    return tx.conversationMessage.create({
      data: {
        conversationId: conv0.id, teamId: comment.teamId, socialAccountId: account.id, platform: account.type, direction: 'OUTBOUND', status: 'PENDING',
        source: 'PRIVATE_REPLY', text: content.text, attachments: (content.attachments ?? []) as object[], privateReplyContext: ctxData, platformData: { ...(opts.platformData ?? {}), ...(content.carousel ? { carousel: content.carousel } : {}) } as object,
      },
    });
  }).catch(async err => {
    if (created) await prisma.conversation.delete({ where: { id: conv0.id } }).catch(() => undefined);
    throw err;
  });
  if (created) await publish(orgId, [['conversation.created', conversation({ ...conv0, socialAccount: account })]]);

  let res: { externalMessageId: string; recipientId?: string | null };
  try {
    res = await m.privateReply(networkContext(account.type as NetworkType), await loadAccount(account.id), { commentExternalId: comment.externalId, text: content.text });
  } catch (err) {
    if (opts.consumeQuota) await releaseAccountMonth(prisma, key, 'dms');
    const failed = await prisma.conversationMessage.update({ where: { id: pending.id }, data: { status: 'FAILED', failedAt: new Date(), error: ((err as Error).message ?? 'Sending failed.').slice(0, 1000) } });
    await publish(orgId, [['conversation.message.created', message(failed)]]);
    throw err;
  }

  // The network may report the recipient's messaging id (IGSID/PSID); move the message there.
  let conv = conv0;
  if (res.recipientId && res.recipientId !== conv0.externalParticipantId) {
    const { row, created: c2 } = await upsertConversation(account, { id: res.recipientId, username: comment.authorName }, new Date());
    conv = row;
    await prisma.conversationMessage.update({ where: { id: pending.id }, data: { conversationId: row.id } });
    if (created) await prisma.conversation.delete({ where: { id: conv0.id } }).catch(() => undefined);
    if (c2) await publish(orgId, [['conversation.created', conversation({ ...row, socialAccount: account })]]);
  }
  const now = new Date();
  let sent; let isConflict = false;
  try {
    sent = await prisma.conversationMessage.update({ where: { id: pending.id }, data: { status: 'SENT', externalMessageId: res.externalMessageId, sentAt: now } });
  } catch (err) {
    if ((err as any)?.code !== 'P2002') throw err;
    await prisma.conversationMessage.delete({ where: { id: pending.id } });
    sent = await prisma.conversationMessage.update({ where: { socialAccountId_externalMessageId: { socialAccountId: account.id, externalMessageId: res.externalMessageId } }, data: { source: 'PRIVATE_REPLY', status: 'SENT', privateReplyContext: ctxData } });
    isConflict = true;
  }
  const c = await prisma.conversation.update({ where: { id: conv.id }, data: { lastMessageAt: now, lastActivityAt: now, lastMessagePreview: preview(content.text) }, include: { socialAccount: true } });
  await publish(orgId, [['conversation.message.created', message(sent)], ['conversation.updated', conversation(c)]]);
  return { conversation: conversation(c), message: message(sent), conflict: isConflict };
}

/** Archive/open: Meta has no API for inbox folders, so the state lives in Siar and says so. */
export async function setConversationStatus(conv: Conversation, status: 'OPEN' | 'ARCHIVED') {
  const pd = (conv.platformData ?? {}) as Record<string, unknown>;
  const sync = { action: status === 'ARCHIVED' ? 'ARCHIVE' : 'OPEN', status: 'UNSUPPORTED', reason: 'Meta has no API to archive conversations; the status is kept in Siar only.', error: null, syncedAt: new Date().toISOString() };
  const c = await prisma.conversation.update({ where: { id: conv.id }, data: { status, platformData: { ...pd, providerStateSync: sync } }, include: { socialAccount: true } });
  if (conv.status !== status) await publish(await orgIdOfTeam(conv.teamId), [['conversation.updated', conversation(c)]]);
  return conversation(c);
}

// ───────────────────────────── handlers ─────────────────────────────

const sourceOf = (actor: Actor): 'API' | 'DM' => (actor.kind === 'API_KEY' ? 'API' : 'DM');

define({
  'socialAccount.enableMessaging': ({ actor, body }) => setMessaging(actor, body, true),
  'socialAccount.disableMessaging': ({ actor, body }) => setMessaging(actor, body, false),

  'conversation.getList': async ({ actor, query }) => {
    await gate(actor);
    await teamIn(actor, query.teamId);
    const p = pageArgs(query);
    const where: any = { teamId: query.teamId, ...(query.platform ? { platform: query.platform } : { platform: { in: ['INSTAGRAM', 'FACEBOOK'] } }), ...(query.socialAccountId ? { socialAccountId: query.socialAccountId } : {}), ...(query.status ? { status: query.status } : {}) };
    const [rows, total] = await Promise.all([
      prisma.conversation.findMany({ where: { ...where, ...before('lastActivityAt', p.cursor) }, include: { socialAccount: true }, orderBy: [{ lastActivityAt: 'desc' }, { id: 'desc' }], skip: p.skip, take: p.take + 1 }),
      prisma.conversation.count({ where }),
    ]);
    const more = rows.length > p.take;
    const items = rows.slice(0, p.take);
    const last = items[items.length - 1];
    return { ...listOf(items.map(conversation), total), nextCursor: more && last ? encodeCursor(last.lastActivityAt, last.id) : null };
  },

  'conversation.get': async ({ actor, params }) => {
    await gate(actor);
    return conversation(await conversationOf(actor, params.id));
  },

  'conversation.update': async ({ actor, params, body }) => {
    await gate(actor);
    return setConversationStatus(await conversationOf(actor, params.id), body.status);
  },
  'conversation.archive': async ({ actor, params }) => { await gate(actor); return setConversationStatus(await conversationOf(actor, params.id), 'ARCHIVED'); },
  'conversation.open': async ({ actor, params }) => { await gate(actor); return setConversationStatus(await conversationOf(actor, params.id), 'OPEN'); },

  'conversation.getMessages': async ({ actor, params, query }) => {
    await gate(actor);
    const conv = await conversationOf(actor, params.id);
    const p = pageArgs(query);
    const where = { conversationId: conv.id };
    const [rows, total] = await Promise.all([
      prisma.conversationMessage.findMany({ where: { ...where, ...before('createdAt', p.cursor) }, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], skip: p.skip, take: p.take + 1 }),
      prisma.conversationMessage.count({ where }),
    ]);
    const more = rows.length > p.take;
    const items = rows.slice(0, p.take);
    const last = items[items.length - 1];
    return { ...listOf(items.map(message), total), nextCursor: more && last ? encodeCursor(last.createdAt, last.id) : null };
  },

  'conversation.sendMessage': async ({ actor, params, body }) => {
    requirePermission(actor, 'content');
    await gate(actor, 'dms');
    const conv = await conversationOf(actor, params.id);
    const c = body.content ?? {};
    const media = (c.attachments ?? []).map((a: any, i: number) => {
      if (!a.url) throw badRequest('Each attachment needs a url.', [{ code: 'required', message: 'url is required', path: ['content', 'attachments', i, 'url'] }]);
      return urlMedia(a, i);
    });
    // `tag` is a Siar extension for Meta message tags (HUMAN_AGENT …) outside the 24-hour window.
    return sendToConversation(conv, { text: c.text, media, attachments: c.attachments, quickReplies: c.quickReplies, buttons: c.buttons, carousel: c.carousel }, { source: sourceOf(actor), consumeQuota: true, replyToMessageId: body.replyToMessageId, tag: body.tag ?? null })
      .catch(err => (isNetworkError(err) ? networkFailure(err) : Promise.reject(err)));
  },

  'conversation.reactMessage': async ({ actor, params, body }) => {
    requirePermission(actor, 'content');
    await gate(actor, 'dms');
    const conv = await conversationOf(actor, params.id);
    const msg = await prisma.conversationMessage.findFirst({ where: { id: params.messageId, conversationId: conv.id } });
    if (!msg) throw notFound('Message');
    if (!msg.externalMessageId) throw new AppError(409, 'This message has not reached the network yet, so it cannot be reacted to.');
    const account = await prisma.socialAccount.findUniqueOrThrow({ where: { id: conv.socialAccountId } });
    assertCanMessage(account);
    assertWindow(conv);
    const unreact = body.action === 'UNREACT';
    const reaction = body.reaction ?? 'love';
    await messagingOf(account.type).react(networkContext(account.type as NetworkType), await loadAccount(account.id), { recipientId: conv.externalParticipantId, externalMessageId: msg.externalMessageId, reaction, unreact }).catch(networkFailure);
    const me = account.externalId ?? account.id;
    const reactions = (Array.isArray(msg.reactions) ? msg.reactions : []).filter((r: any) => r?.senderId !== me) as object[];
    if (!unreact) reactions.push({ senderId: me, reaction, emoji: null, reactedAt: new Date().toISOString() });
    const u = await prisma.conversationMessage.update({ where: { id: msg.id }, data: { reactions } });
    const c = await prisma.conversation.findUniqueOrThrow({ where: { id: conv.id }, include: { socialAccount: true } });
    await publish(actor.organizationId, [['conversation.message.updated', message(u)]]);
    return { conversation: conversation(c), message: message(u), conflict: false };
  },

  'conversation.markRead': async ({ actor, params, body }) => {
    await gate(actor);
    const conv = await conversationOf(actor, params.id);
    const readAt = body?.readAt ? new Date(body.readAt) : new Date();
    const unread = await prisma.conversationMessage.count({ where: { conversationId: conv.id, direction: 'INBOUND', createdAt: { gt: readAt } } });
    const c = await prisma.conversation.update({ where: { id: conv.id }, data: { lastReadAt: readAt, unreadCount: unread }, include: { socialAccount: true } });
    // Tell the network the page has seen the thread (best effort; only possible inside the window).
    const m = isMessagingType(conv.platform) ? conv.socialAccount.messagingStatus === 'ENABLED' && conv.socialAccount.state === 'CONNECTED' : false;
    if (m && unread === 0 && Date.now() - (lastInbound(conv) ?? 0) < 24 * 3600_000) {
      try { await messagingOf(conv.platform).markSeen(networkContext(conv.platform as NetworkType), await loadAccount(conv.socialAccountId), conv.externalParticipantId); } catch { /* best effort */ }
    }
    await publish(actor.organizationId, [['conversation.read.updated', conversation(c)]]);
    return conversation(c);
  },

  'conversation.privateReply': async ({ actor, body }) => {
    requirePermission(actor, 'content');
    await gate(actor, 'dms');
    await teamIn(actor, body.teamId);
    const comment = await prisma.fetchedComment.findFirst({ where: { id: body.fetchedCommentId, teamId: body.teamId, deletedAt: null } });
    if (!comment) throw notFound('Comment');
    return sendPrivateReply(comment, { text: body.content.text, attachments: body.content.attachments, carousel: body.content.carousel }, { source: 'PRIVATE_REPLY', consumeQuota: true })
      .catch(err => (isNetworkError(err) ? networkFailure(err) : Promise.reject(err)));
  },
});

const lastInbound = (c: Conversation) => { const v = (c.platformData as any)?.lastInboundAt; return v ? new Date(v).getTime() : null; };

/** Rich-message attachments are uploads of the caller's organization. */
export async function uploadMedia(orgId: string, attachments: { uploadId: string }[] = []) {
  if (!attachments.length) return [];
  const rows = await prisma.upload.findMany({ where: { id: { in: attachments.map(a => a.uploadId) }, organizationId: orgId, deletedAt: null } });
  return attachments.map((a, i) => {
    const u = rows.find(r => r.id === a.uploadId);
    if (!u || !u.path) throw badRequest(`Upload ${a.uploadId} does not exist or was deleted.`, [{ code: 'not_found', message: 'Upload not found', path: ['message', 'attachments', i, 'uploadId'] }]);
    if (u.status !== 'READY') throw new AppError(409, `Upload ${a.uploadId} is still being processed.`);
    return mediaRef(u);
  });
}
