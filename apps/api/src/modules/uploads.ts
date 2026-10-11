import type { FastifyInstance } from 'fastify';
import { randomUUID } from 'node:crypto';
import { apiUrl, config } from '../platform/config.js';
import { hmac, safeEqual, sha256 } from '../platform/crypto.js';
import { prisma } from '../platform/db.js';
import { badRequest, notFound } from '../platform/errors.js';
import { listOf } from '../platform/http.js';
import { define } from '../platform/routes.js';
import { enqueue, JOBS } from '../platform/queue.js';
import * as storage from '../platform/storage.js';
import { fetchPublic, imageThumb, isPortableVideo, probe, videoFrame, extFor, type Probe } from '../platform/media.js';
import type { Actor } from '../platform/auth.js';
import * as S from '../domain/serialize.js';
import { consumeOrg, releaseOrg } from '../domain/quota.js';
import { limitsFor } from '../domain/plans.js';
import { teamOf } from './teams.js';

const MAX = () => config.MAX_UPLOAD_MB * 1024 * 1024;
const keyFor = (orgId: string, ext: string) => `uploads/${orgId}/${new Date().toISOString().slice(0, 7)}/${randomUUID()}.${ext}`;

/**
 * Store a file as an Upload: sniff + probe, keep the original, derive a thumbnail and an icon.
 * Videos that are not H.264/AAC MP4 (or are huge, with compression on) are converted in the
 * background — the upload is PROCESSING until then and publishing waits for it.
 */
export async function createUpload(actor: Pick<Actor, 'organizationId'>, teamId: string | null, buf: Buffer, declaredMime: string | undefined, name: string, externalLink?: string | null) {
  if (buf.length === 0) throw badRequest('The file is empty.');
  if (buf.length > MAX()) throw badRequest(`The file is larger than the ${config.MAX_UPLOAD_MB} MB limit. Use the large upload flow.`);
  const org = await prisma.organization.findUniqueOrThrow({ where: { id: actor.organizationId } });
  const p: Probe = await probe(buf, declaredMime, name);
  await consumeOrg(prisma, org.id, 'uploads', 1, limitsFor(org).uploads);
  try {
    const path = keyFor(org.id, p.ext);
    await storage.put(path, buf, p.mime);
    const thumbs = await derive(buf, p, path);
    const needsWork = p.type === 'video' && (!isPortableVideo(p) || (org.uploadsCompressionEnabled && buf.length > 512 * 1024 * 1024));
    const u = await prisma.upload.create({
      data: {
        organizationId: org.id, teamId, path, iconPath: thumbs.icon, thumbnailPath: thumbs.thumb, externalLink: externalLink ?? null,
        type: p.type, width: p.width, height: p.height, fileSize: buf.length, videoLength: p.duration, mime: p.mime, ext: p.ext,
        originalName: name.slice(0, 200), sha256: sha256(buf), status: needsWork ? 'PROCESSING' : 'READY',
      },
      include: { posts: true },
    });
    if (needsWork) await enqueue(JOBS.processUpload, { uploadId: u.id }, { singletonKey: `upl:${u.id}` });
    return u;
  } catch (err) {
    await releaseOrg(prisma, org.id, 'uploads', 1);
    throw err;
  }
}

async function derive(buf: Buffer, p: Probe, path: string) {
  try {
    const frame = p.type === 'image' ? buf : p.type === 'video' ? await videoFrame(buf, p.ext, p.duration && p.duration < 2 ? p.duration / 2 : 1) : null;
    if (!frame) return { thumb: null, icon: null };
    const [t, i] = await Promise.all([imageThumb(frame, 640), imageThumb(frame, 128)]);
    const thumb = path.replace(/\.[^.]+$/, '.thumb.jpg'); const icon = path.replace(/\.[^.]+$/, '.icon.jpg');
    await Promise.all([storage.put(thumb, t, 'image/jpeg'), storage.put(icon, i, 'image/jpeg')]);
    return { thumb, icon };
  } catch { return { thumb: null, icon: null }; }
}

export async function uploadOf(actor: Actor, id: string) {
  const u = await prisma.upload.findFirst({ where: { id, organizationId: actor.organizationId, deletedAt: null }, include: { posts: true } });
  if (!u) throw notFound('Upload');
  return u;
}

async function softDeleteUploads(actor: Actor, ids: string[]) {
  const rows = await prisma.upload.findMany({ where: { id: { in: ids }, organizationId: actor.organizationId, deletedAt: null }, include: { posts: { include: { post: true } } } });
  const blocked = rows.filter(u => u.posts.some(pu => !pu.deletedAt && ['DRAFT', 'SCHEDULED', 'PROCESSING', 'RETRYING'].includes(pu.post.status)));
  if (blocked.length) throw badRequest(`${blocked.length} upload(s) are attached to a draft or scheduled post. Remove them from the post first.`, blocked.map(b => ({ code: 'in_use', message: 'Used by a pending post', path: ['ids', ids.indexOf(b.id)] })));
  await prisma.upload.updateMany({ where: { id: { in: rows.map(r => r.id) } }, data: { deletedAt: new Date() } });
  return rows.length;
}

// Large uploads on the local driver go through a signed PUT to the API itself.
const LOCAL_SECRET = config.SESSION_SECRET + ':upload';
const signLocal = (path: string, extra = '') => hmac(LOCAL_SECRET, `${path}:${extra}`).slice(0, 40);

async function sessionFor(actor: Actor, path: string, uploadId?: string) {
  const s = await prisma.uploadSession.findFirst({ where: { organizationId: actor.organizationId, storageKey: path, ...(uploadId ? { OR: [{ s3UploadId: uploadId }, { id: uploadId }] } : {}), status: 'OPEN' } });
  if (!s || s.expiresAt < new Date()) throw notFound('Upload session (it may have expired)');
  return s;
}

async function finalizeFromStorage(actor: Actor, s: { id: string; teamId: string | null; fileName: string; mime: string; storageKey: string }) {
  const size = await storage.size(s.storageKey);
  if (!size) throw badRequest('Nothing was uploaded to this path yet.');
  if (size > 5 * 1024 * 1024 * 1024) throw badRequest('Files over 5 GB are not supported.');
  const buf = await storage.get(s.storageKey);
  const u = await createUpload(actor, s.teamId, buf, s.mime, s.fileName);
  await storage.remove(s.storageKey);
  await prisma.uploadSession.update({ where: { id: s.id }, data: { status: 'DONE', uploadId: u.id } });
  return u;
}

define({
  'upload.create': async ({ actor, req }) => {
    const parts = req.parts();
    let teamId: string | null = null; let file: { buf: Buffer; mime: string; name: string } | null = null;
    for await (const part of parts) {
      if (part.type === 'file') {
        if (part.fieldname !== 'file') { await part.toBuffer(); continue; }
        const buf = await part.toBuffer();
        if ((part.file as any).truncated) throw badRequest(`The file is larger than the ${config.MAX_UPLOAD_MB} MB limit. Use /upload/init for large files.`);
        file = { buf, mime: part.mimetype, name: part.filename };
      } else if (part.fieldname === 'teamId' && part.value) teamId = String(part.value);
    }
    if (!file) throw badRequest('Send the file in a multipart field named "file".', [{ code: 'required', message: 'file is required', path: ['file'] }]);
    if (teamId) await teamOf(actor, teamId);
    return S.upload(await createUpload(actor, teamId, file.buf, file.mime, file.name));
  },

  'upload.createFromUrl': async ({ actor, body }) => {
    if (body.teamId) await teamOf(actor, body.teamId);
    const r = await fetchPublic(body.url, MAX(), config.NETWORK_MODE === 'mock' && config.NODE_ENV !== 'production');
    return S.upload(await createUpload(actor, body.teamId ?? null, r.buf, r.contentType ?? undefined, r.name, body.url));
  },

  'upload.getList': async ({ actor, query }) => {
    const take = Math.min(100, Number(query.limit ?? 10)); const skip = Number(query.offset ?? 0);
    const types = query.types ? String(query.types).split(',') : query.type ? [query.type] : undefined;
    const where: any = {
      organizationId: actor.organizationId, deletedAt: null,
      ...(query.teamId ? { teamId: query.teamId } : {}),
      ...(types ? { type: { in: types } } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.ids ? { id: { in: String(query.ids).split(',') } } : {}),
      ...(query.urls ? { externalLink: { in: String(query.urls).split(',') } } : {}),
    };
    const rows = await prisma.upload.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take, include: { posts: query.includePosts === true || query.includePosts === 'true' } });
    return rows.map(S.upload);
  },

  'upload.get': async ({ actor, params }) => S.upload(await uploadOf(actor, params.id)),

  'upload.delete': async ({ actor, params }) => {
    const u = await uploadOf(actor, params.id);
    await softDeleteUploads(actor, [u.id]);
    return S.upload({ ...u, deletedAt: new Date() });
  },

  'upload.deleteMany': async ({ actor, body }) => ({ success: true, deleted: await softDeleteUploads(actor, body.ids) }),

  'upload.initLargeUpload': async ({ actor, body }) => {
    if (body.teamId) await teamOf(actor, body.teamId);
    const mime = String(body.mimeType);
    const path = `incoming/${actor.organizationId}/${randomUUID()}.${extFor(mime, body.fileName)}`;
    await prisma.uploadSession.create({ data: { organizationId: actor.organizationId, teamId: body.teamId ?? null, fileName: body.fileName, mime, fileSize: body.fileSize ?? null, storageKey: path, expiresAt: new Date(Date.now() + 6 * 3600_000) } });
    const url = storage.multipart.supported() ? await storage.multipart.signPut(path, mime) : apiUrl(`/api/v1/upload/_put?path=${encodeURIComponent(path)}&sig=${signLocal(path)}`);
    return { url, path, method: 'PUT', headers: { 'content-type': mime } };
  },

  'upload.finalizeLargeUpload': async ({ actor, body }) => S.upload(await finalizeFromStorage(actor, await sessionFor(actor, body.path))),

  'upload.initMultipartUpload': async ({ actor, body }) => {
    if (body.teamId) await teamOf(actor, body.teamId);
    const mime = String(body.mimeType);
    const path = `incoming/${actor.organizationId}/${randomUUID()}.${extFor(mime, body.fileName)}`;
    const uploadId = storage.multipart.supported() ? await storage.multipart.init(path, mime) : `local_${randomUUID()}`;
    const partSize = 16 * 1024 * 1024;
    await prisma.uploadSession.create({ data: { organizationId: actor.organizationId, teamId: body.teamId ?? null, fileName: body.fileName, mime, fileSize: body.fileSize, storageKey: path, s3UploadId: uploadId, expiresAt: new Date(Date.now() + 24 * 3600_000) } });
    return { uploadId, path, partSize, partCount: Math.max(1, Math.ceil(Number(body.fileSize) / partSize)) };
  },

  'upload.signMultipartParts': async ({ actor, body }) => {
    const s = await sessionFor(actor, body.path, body.uploadId);
    const parts = await Promise.all((body.partNumbers as number[]).map(async n => ({
      partNumber: n,
      url: storage.multipart.supported() ? await storage.multipart.signPart(s.storageKey, s.s3UploadId!, n) : apiUrl(`/api/v1/upload/_put?path=${encodeURIComponent(`${s.storageKey}.part${n}`)}&sig=${signLocal(`${s.storageKey}.part${n}`)}`),
    })));
    return { parts };
  },

  'upload.completeMultipartUpload': async ({ actor, body }) => {
    const s = await sessionFor(actor, body.path, body.uploadId);
    const parts = [...(body.parts as { partNumber?: number; PartNumber?: number; etag?: string; ETag?: string }[])].map(p => ({ partNumber: Number(p.partNumber ?? p.PartNumber), etag: String(p.etag ?? p.ETag ?? '') })).sort((a, b) => a.partNumber - b.partNumber);
    if (storage.multipart.supported()) await storage.multipart.complete(s.storageKey, s.s3UploadId!, parts);
    else {
      const bufs = await Promise.all(parts.map(p => storage.get(`${s.storageKey}.part${p.partNumber}`)));
      await storage.put(s.storageKey, Buffer.concat(bufs), s.mime);
      await Promise.all(parts.map(p => storage.remove(`${s.storageKey}.part${p.partNumber}`)));
    }
    return S.upload(await finalizeFromStorage(actor, s));
  },

  'upload.abortMultipartUpload': async ({ actor, body }) => {
    const s = await sessionFor(actor, body.path, body.uploadId);
    if (storage.multipart.supported()) await storage.multipart.abort(s.storageKey, s.s3UploadId!);
    await prisma.uploadSession.update({ where: { id: s.id }, data: { status: 'ABORTED' } });
    return { success: true };
  },
});

/** Raw routes: signed media serving (/media/…) and the local-driver PUT target for large uploads. */
export async function uploadRawRoutes(app: FastifyInstance) {
  app.addContentTypeParser('application/octet-stream', { parseAs: 'buffer', bodyLimit: 5 * 1024 * 1024 * 1024 }, (_req, body, done) => done(null, body));
  app.put('/api/v1/upload/_put', { bodyLimit: 5 * 1024 * 1024 * 1024 }, async (req: any, reply) => {
    const path = String(req.query.path ?? ''); const sig = String(req.query.sig ?? '');
    if (!path.startsWith('incoming/') || !safeEqual(signLocal(path), sig)) return reply.status(403).send({ statusCode: 403, message: 'Invalid upload signature.' });
    const body: Buffer = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body ?? '');
    await storage.put(path, body);
    return reply.header('etag', `"${sha256(body).slice(0, 32)}"`).send({ success: true });
  });

  // Signed, short-lived public URLs for media — what pull-based networks fetch.
  app.get('/media/*', async (req: any, reply) => {
    const key = decodeURIComponent(String(req.params['*'] ?? ''));
    if (!storage.verifySignature(key, String(req.query.exp ?? ''), String(req.query.sig ?? ''))) return reply.status(403).send({ statusCode: 403, message: 'This media link expired.' });
    const u = await prisma.upload.findFirst({ where: { OR: [{ path: key }, { thumbnailPath: key }, { iconPath: key }] }, select: { mime: true, path: true } });
    const mime = key.endsWith('.jpg') && u?.path !== key ? 'image/jpeg' : u?.mime ?? 'application/octet-stream';
    const size = await storage.size(key);
    if (size === null) return reply.status(404).send({ statusCode: 404, message: 'Media not found.' });
    reply.header('content-type', mime).header('accept-ranges', 'bytes').header('cache-control', 'private, max-age=3600');
    const range = String(req.headers.range ?? '').match(/bytes=(\d*)-(\d*)/);
    if (range) {
      const start = range[1] ? Number(range[1]) : size - Number(range[2]);
      const end = range[1] && range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
      if (start >= size || start < 0) return reply.status(416).header('content-range', `bytes */${size}`).send();
      reply.status(206).header('content-range', `bytes ${start}-${end}/${size}`).header('content-length', end - start + 1);
      return reply.send(await storage.getRange(key, start, end + 1));
    }
    reply.header('content-length', size);
    return reply.send(await storage.stream(key));
  });
}
