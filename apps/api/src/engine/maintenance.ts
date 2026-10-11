import { isNetworkError, type NetworkType } from '@siar/networks';
import { prisma } from '../platform/db.js';
import { emit, flushDeliveries } from '../platform/events.js';
import { flushOutbox } from '../platform/mail.js';
import { logger } from '../platform/logger.js';
import { adapter, refreshAccount } from '../platform/networks.js';
import { JOBS } from '../platform/queue.js';
import * as storage from '../platform/storage.js';
import { isPortableVideo, probe, transcode, imageThumb, videoFrame } from '../platform/media.js';
import { checkOne } from '../modules/accounts.js';
import { systemActor, audit } from '../platform/audit.js';
import * as S from '../domain/serialize.js';
import { RESOURCE_LIMITS } from '../domain/plans.js';
import { dispatchDue, pollTarget, publishTarget, staleClaims } from './publisher.js';
import { registerJob } from './jobs.js';
import { deliver, retryDue } from './webhooks.js';

registerJob(JOBS.publishTarget, d => publishTarget(d.postId, d.socialAccountId));
registerJob(JOBS.pollTarget, d => pollTarget(d.postId, d.socialAccountId));
registerJob(JOBS.dispatchDue, () => dispatchDue());
registerJob(JOBS.staleClaims, () => staleClaims());
registerJob(JOBS.deliverWebhook, d => deliver(d.deliveryId));
registerJob(JOBS.webhookRetry, () => retryDue());
registerJob(JOBS.mailFlush, () => flushOutbox());

/** Refresh tokens that expire within the hour (most networks: 1–2 h access tokens). */
registerJob(JOBS.refreshTokens, async () => {
  const soon = new Date(Date.now() + 60 * 60_000);
  const rows = await prisma.socialAccount.findMany({ where: { deletedAt: null, state: 'CONNECTED', tokenExpiresAt: { not: null, lte: soon } }, select: { id: true, type: true }, take: 200 });
  let ok = 0;
  for (const r of rows) {
    if (!adapter(r.type as NetworkType).refresh) continue;
    try { await refreshAccount(r.id); ok++; } catch (err) { if (!isNetworkError(err)) logger.warn({ err, id: r.id }, 'refresh failed'); }
  }
  return { checked: rows.length, refreshed: ok };
});

/** Ask each network whether connections still work (org can opt out). */
registerJob(JOBS.connectionChecks, async () => {
  const rows = await prisma.socialAccount.findMany({
    where: { deletedAt: null, team: { deletedAt: null, organization: { disconnectCheckEnabled: true, deletedAt: null } }, OR: [{ lastCheckedAt: null }, { lastCheckedAt: { lt: new Date(Date.now() - 6 * 3600_000) } }] },
    select: { id: true }, take: 500, orderBy: { lastCheckedAt: { sort: 'asc', nulls: 'first' } },
  });
  let bad = 0;
  for (const r of rows) if (!(await checkOne(r.id).catch(() => true))) bad++;
  return { checked: rows.length, disconnected: bad };
});

/** Delete accounts that stayed disconnected past the organization's grace period. */
registerJob(JOBS.purgeAccounts, async () => {
  const rows = await prisma.socialAccount.findMany({ where: { deletedAt: null, deleteOn: { lte: new Date() }, state: { not: 'CONNECTED' } }, include: { team: true } });
  for (const a of rows) {
    const out = await prisma.$transaction(async tx => {
      const d = await tx.socialAccount.update({ where: { id: a.id }, data: { deletedAt: new Date(), state: 'DISCONNECTED', accessTokenEnc: null, refreshTokenEnc: null, secretsEnc: null } });
      await audit(tx, systemActor(a.team.organizationId), 'socialAccount.purge', 'SocialAccount', a.id, `Removed disconnected ${a.type} account ${a.username ?? ''}`.trim());
      return emit(tx, a.team.organizationId, 'social-account.deleted', S.socialAccount(d));
    });
    void flushDeliveries(out);
  }
  return rows.length;
});

/**
 * Media retention: our copy is removed 14 days after its last use (upload, or the last post using
 * it reaching a final state). Attached to a draft/scheduled post = pinned, never removed.
 * Soft-deleted uploads keep their files 2 more days.
 */
registerJob(JOBS.retention, async () => {
  const cutoff = new Date(Date.now() - RESOURCE_LIMITS.mediaRetentionDays * 86400_000);
  const delCutoff = new Date(Date.now() - RESOURCE_LIMITS.softDeletedMediaDays * 86400_000);
  const rows = await prisma.upload.findMany({ where: { purgedAt: null, pinned: false, OR: [{ deletedAt: null, lastUsedAt: { lt: cutoff } }, { deletedAt: { lt: delCutoff } }] }, take: 1000 });
  for (const u of rows) {
    for (const k of [u.path, u.thumbnailPath, u.iconPath]) if (k) await storage.remove(k);
    await prisma.upload.update({ where: { id: u.id }, data: { purgedAt: new Date(), deletedAt: u.deletedAt ?? new Date() } });
  }
  await prisma.uploadSession.deleteMany({ where: { expiresAt: { lt: new Date(Date.now() - 86400_000) } } });
  await prisma.oAuthState.deleteMany({ where: { expiresAt: { lt: new Date(Date.now() - 86400_000) } } });
  return rows.length;
});

/** Convert a video every network accepts (H.264/AAC MP4), then mark the upload READY. */
registerJob(JOBS.processUpload, async d => {
  const u = await prisma.upload.findUnique({ where: { id: d.uploadId }, include: { organization: true } });
  if (!u || u.status !== 'PROCESSING' || !u.path) return 'skipped';
  try {
    const buf = await storage.get(u.path);
    const out = await transcode(buf, u.ext ?? 'mp4', !!u.organization?.uploadsCompressionEnabled);
    const p = await probe(out, 'video/mp4');
    if (!isPortableVideo(p)) throw new Error('conversion produced an unexpected format');
    const newPath = u.path.replace(/\.[^.]+$/, '.mp4');
    await storage.put(newPath, out, 'video/mp4');
    if (newPath !== u.path) await storage.remove(u.path);
    let thumb = u.thumbnailPath;
    if (!thumb) { const f = await videoFrame(out, 'mp4'); if (f) { thumb = newPath.replace(/\.mp4$/, '.thumb.jpg'); await storage.put(thumb, await imageThumb(f, 640), 'image/jpeg'); } }
    await prisma.upload.update({ where: { id: u.id }, data: { path: newPath, mime: 'video/mp4', ext: 'mp4', fileSize: out.length, width: p.width, height: p.height, videoLength: p.duration, status: 'READY', thumbnailPath: thumb } });
    return 'converted';
  } catch (err) {
    logger.error({ err, uploadId: u.id }, 'video conversion failed');
    await prisma.upload.update({ where: { id: u.id }, data: { status: 'FAILED' } });
    return 'failed';
  }
});
