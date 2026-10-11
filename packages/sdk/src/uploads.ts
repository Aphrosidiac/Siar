import type { SiarCore } from './client.js';
import { SiarError } from './errors.js';
import type { Body, RequestOptions, Result } from './generated.js';

/** A file path, a Blob/File, or raw bytes (Buffer is a Uint8Array). */
export type UploadInput = string | Blob | Uint8Array | ArrayBuffer;
export type Upload = Result<'upload.create'>;

export interface UploadOptions extends RequestOptions {
  /** Team the upload belongs to. */
  teamId?: string | null;
  /** File name sent to the API. Defaults to the path's basename, File.name or "upload". */
  fileName?: string;
  /** MIME type. Defaults to Blob.type, then a guess from the file extension. */
  mimeType?: string;
  /** Files larger than this go through the multipart flow. Default 20 MiB. */
  multipartThresholdBytes?: number;
  /** Parallel part uploads in the multipart flow. Default 4. */
  concurrency?: number;
  /** Progress callback (bytes sent so far). */
  onProgress?: (p: { uploadedBytes: number; totalBytes: number }) => void;
}

export const DEFAULT_MULTIPART_THRESHOLD = 20 * 1024 * 1024;

const MIME: Record<string, string> = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp',
  mp4: 'video/mp4', m4v: 'video/mp4', mov: 'video/quicktime', qt: 'video/quicktime', pdf: 'application/pdf',
};
export const guessMimeType = (name: string) => MIME[name.split('.').pop()?.toLowerCase() ?? ''] ?? 'application/octet-stream';

interface Source {
  size: number;
  name: string;
  type?: string;
  read(start: number, end: number): Promise<Blob>;
  close(): Promise<void>;
}

const bytesToBlob = (b: Uint8Array, type?: string) => new Blob([b as BlobPart], type ? { type } : undefined);

async function open(input: UploadInput): Promise<Source> {
  if (typeof input === 'string') {
    if (/^https?:\/\//i.test(input)) throw new TypeError('uploads.fromFile() takes a local file; use uploads.fromUrl() for URLs.');
    const fs = await import('node:fs/promises');
    const { basename } = await import('node:path');
    const fh = await fs.open(input, 'r');
    const { size } = await fh.stat();
    return {
      size, name: basename(input),
      async read(start, end) {
        const buf = new Uint8Array(end - start);
        let off = 0;
        while (off < buf.length) {
          const { bytesRead } = await fh.read(buf, off, buf.length - off, start + off);
          if (!bytesRead) break;
          off += bytesRead;
        }
        return bytesToBlob(off === buf.length ? buf : buf.subarray(0, off));
      },
      close: () => fh.close(),
    };
  }
  if (input instanceof Blob) {
    return {
      size: input.size, name: (input as File).name || 'upload', type: input.type || undefined,
      read: async (s, e) => input.slice(s, e), close: async () => {},
    };
  }
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  return { size: bytes.byteLength, name: 'upload', read: async (s, e) => bytesToBlob(bytes.subarray(s, e)), close: async () => {} };
}

/** Upload helpers: `siar.uploads.fromFile(…)`, `siar.uploads.fromUrl(…)`. */
export class Uploads {
  constructor(private readonly core: SiarCore) {}

  /**
   * Uploads a local file, Blob or Buffer. Files up to `multipartThresholdBytes` (20 MiB) go in one
   * multipart/form-data request; larger ones use init → sign → PUT parts → complete, with parts
   * sent in parallel and retried, and the session aborted if anything fails.
   */
  async fromFile(input: UploadInput, options: UploadOptions = {}): Promise<Upload> {
    const src = await open(input);
    try {
      const name = options.fileName ?? src.name;
      const mimeType = options.mimeType ?? src.type ?? guessMimeType(name);
      const threshold = options.multipartThresholdBytes ?? DEFAULT_MULTIPART_THRESHOLD;
      if (src.size <= threshold) return await this.simple(src, name, mimeType, options);
      return await this.multipart(src, name, mimeType, options);
    } finally {
      await src.close();
    }
  }

  /** Imports a public URL (the API fetches it). */
  fromUrl(url: string, options: { teamId?: string | null } & RequestOptions = {}): Promise<Upload> {
    const { teamId, ...req } = options;
    return this.core.request('upload.createFromUrl', { body: { url, ...(teamId ? { teamId } : {}) } }, req) as Promise<Upload>;
  }

  private async simple(src: Source, name: string, mimeType: string, o: UploadOptions): Promise<Upload> {
    const blob = await src.read(0, src.size);
    const fd = new FormData();
    if (o.teamId) fd.append('teamId', o.teamId);
    fd.append('file', new Blob([blob], { type: mimeType }), name);
    const res = await this.core.request('upload.create', { body: fd }, pickReq(o));
    o.onProgress?.({ uploadedBytes: src.size, totalBytes: src.size });
    return res;
  }

  private async multipart(src: Source, fileName: string, mimeType: string, o: UploadOptions): Promise<Upload> {
    const req = pickReq(o);
    const teamId = o.teamId ?? undefined;
    const initBody = { fileName, mimeType, fileSize: src.size, ...(teamId ? { teamId } : {}) } as Body<'upload.initMultipartUpload'>;
    const init = await this.core.request('upload.initMultipartUpload', { body: initBody }, { ...req, retry: false });
    const { uploadId, path } = init;
    const partSize = Number(init.partSize);
    if (!(partSize > 0)) throw new SiarError({ statusCode: 0, code: 'network', message: 'upload.initMultipartUpload returned no partSize' });
    const count = Math.max(1, Math.ceil(src.size / partSize));
    const ids = { path, uploadId, ...(teamId ? { teamId } : {}) };

    try {
      const urls = new Map<number, string>();
      for (const p of (init as { parts?: { partNumber: number; url: string }[] }).parts ?? []) urls.set(p.partNumber, p.url);
      const missing = Array.from({ length: count }, (_, i) => i + 1).filter(n => !urls.has(n));
      for (let i = 0; i < missing.length; i += 100) {
        const signed = await this.core.request('upload.signMultipartParts', { body: { ...ids, partNumbers: missing.slice(i, i + 100) } }, { ...req, retry: true });
        for (const p of signed.parts) urls.set(p.partNumber, p.url);
      }

      const etags: { partNumber: number; etag: string }[] = [];
      let uploaded = 0;
      let next = 1;
      let failed = false;
      const worker = async () => {
        while (!failed && next <= count) {
          const n = next++;
          const url = urls.get(n);
          if (!url) throw new SiarError({ statusCode: 0, code: 'network', message: `No signed URL for part ${n}` });
          const start = (n - 1) * partSize;
          const end = Math.min(src.size, start + partSize);
          const data = await src.read(start, end);
          const res = await this.core.send(url, { method: 'PUT', headers: { 'content-type': 'application/octet-stream' }, body: data }, {
            signal: o.signal, timeoutMs: o.timeoutMs, maxRetries: o.maxRetries ?? this.core.maxRetries, raw: true, operationId: 'upload.putPart',
          }) as { headers: Headers };
          const etag = res.headers.get('etag');
          if (!etag) throw new SiarError({ statusCode: 0, code: 'network', message: `Part ${n} upload returned no ETag (is the ETag header exposed?)` });
          etags.push({ partNumber: n, etag });
          uploaded += end - start;
          o.onProgress?.({ uploadedBytes: uploaded, totalBytes: src.size });
        }
      };
      const guarded = () => worker().catch(e => { failed = true; throw e; });
      await Promise.all(Array.from({ length: Math.min(count, Math.max(1, o.concurrency ?? 4)) }, guarded));
      etags.sort((a, b) => a.partNumber - b.partNumber);
      return await this.core.request('upload.completeMultipartUpload', { body: { ...ids, parts: etags } }, { ...req, retry: false });
    } catch (err) {
      await this.core.request('upload.abortMultipartUpload', { body: ids }, { retry: true }).catch(() => {});
      throw err;
    }
  }
}

const pickReq = (o: UploadOptions): RequestOptions => ({ signal: o.signal, timeoutMs: o.timeoutMs, maxRetries: o.maxRetries, headers: o.headers });
