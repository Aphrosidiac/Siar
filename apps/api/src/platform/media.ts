import { spawn } from 'node:child_process';
import { lookup } from 'node:dns/promises';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { isIP } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';
import { badRequest } from './errors.js';

/**
 * Media probing and processing: ffprobe/ffmpeg for video, sharp for images. Also the SSRF-safe
 * fetch behind upload-from-URL (docs/PLAN.md §3 rule 7).
 */

export interface Probe { type: 'image' | 'video' | 'document'; mime: string; ext: string; width: number | null; height: number | null; duration: number | null; videoCodec?: string | null; audioCodec?: string | null; container?: string | null }

const EXT: Record<string, string> = {
  'image/jpeg': 'jpg', 'image/png': 'png', 'image/gif': 'gif', 'image/webp': 'webp', 'image/avif': 'avif', 'image/heic': 'heic', 'image/heif': 'heif',
  'video/mp4': 'mp4', 'video/quicktime': 'mov', 'video/webm': 'webm', 'video/x-matroska': 'mkv', 'video/x-msvideo': 'avi', 'video/x-m4v': 'm4v',
  'application/pdf': 'pdf',
};
export const extFor = (mime: string, fallbackName?: string) => EXT[mime] ?? fallbackName?.split('.').pop()?.toLowerCase().slice(0, 8) ?? 'bin';

/** Sniff the real type from magic bytes — never trust the client's content-type. */
export function sniff(buf: Buffer): string | null {
  const h = buf.subarray(0, 16);
  if (h[0] === 0xff && h[1] === 0xd8 && h[2] === 0xff) return 'image/jpeg';
  if (h.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png';
  if (h.subarray(0, 6).toString('ascii') === 'GIF87a' || h.subarray(0, 6).toString('ascii') === 'GIF89a') return 'image/gif';
  if (h.subarray(0, 4).toString('ascii') === 'RIFF' && h.subarray(8, 12).toString('ascii') === 'WEBP') return 'image/webp';
  if (h.subarray(0, 4).toString('ascii') === '%PDF') return 'application/pdf';
  if (h.subarray(4, 8).toString('ascii') === 'ftyp') {
    const brand = h.subarray(8, 12).toString('ascii');
    if (/^(avif|avis)/.test(brand)) return 'image/avif';
    if (/^(heic|heix|mif1|msf1|hevc)/.test(brand)) return 'image/heic';
    if (brand === 'qt  ') return 'video/quicktime';
    return 'video/mp4';
  }
  if (h.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]))) return 'video/webm';
  return null;
}

function run(cmd: string, args: string[], timeoutMs = 600_000): Promise<{ stdout: string; stderr: string; code: number }> {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = ''; let stderr = '';
    const t = setTimeout(() => p.kill('SIGKILL'), timeoutMs);
    p.stdout.on('data', d => (stdout += d));
    p.stderr.on('data', d => (stderr += d.toString().slice(-4000)));
    p.on('error', reject);
    p.on('close', code => { clearTimeout(t); resolve({ stdout, stderr, code: code ?? 1 }); });
  });
}

export async function withTemp<T>(fn: (dir: string) => Promise<T>): Promise<T> {
  const dir = await mkdtemp(join(tmpdir(), 'siar-'));
  try { return await fn(dir); } finally { await rm(dir, { recursive: true, force: true }); }
}

export async function probe(buf: Buffer, declaredMime?: string, name?: string): Promise<Probe> {
  const mime = sniff(buf) ?? declaredMime ?? 'application/octet-stream';
  if (mime.startsWith('image/')) {
    const m = await sharp(buf, { animated: true }).metadata().catch(() => null);
    if (!m) throw badRequest('The image could not be read. Upload a JPEG, PNG, GIF, WebP or HEIC file.');
    return { type: 'image', mime, ext: extFor(mime, name), width: m.width ?? null, height: m.pageHeight ?? m.height ?? null, duration: null };
  }
  if (mime.startsWith('video/')) {
    return withTemp(async dir => {
      const f = join(dir, `in.${extFor(mime, name)}`);
      await writeFile(f, buf);
      return probeFile(f, mime, name);
    });
  }
  if (mime === 'application/pdf') return { type: 'document', mime, ext: 'pdf', width: null, height: null, duration: null };
  throw badRequest(`Unsupported file type (${declaredMime ?? 'unknown'}). Upload an image, a video or a PDF.`);
}

export async function probeFile(file: string, mime: string, name?: string): Promise<Probe> {
  const r = await run('ffprobe', ['-v', 'error', '-print_format', 'json', '-show_format', '-show_streams', file], 60_000);
  if (r.code !== 0) throw badRequest('The video could not be read. Upload an MP4, MOV or WebM file.');
  const j = JSON.parse(r.stdout);
  const v = j.streams?.find((s: any) => s.codec_type === 'video');
  const a = j.streams?.find((s: any) => s.codec_type === 'audio');
  if (!v) throw badRequest('The file has no video stream.');
  const rot = Number(v.tags?.rotate ?? v.side_data_list?.find((d: any) => d.rotation !== undefined)?.rotation ?? 0);
  const swap = Math.abs(rot) === 90 || Math.abs(rot) === 270;
  return {
    type: 'video', mime, ext: extFor(mime, name),
    width: swap ? v.height : v.width, height: swap ? v.width : v.height,
    duration: Number(j.format?.duration ?? v.duration ?? 0) || null,
    videoCodec: v.codec_name, audioCodec: a?.codec_name ?? null, container: j.format?.format_name ?? null,
  };
}

/** Video is portable when it is H.264 (+AAC or silent) in MP4 — every network accepts that. */
export const isPortableVideo = (p: Probe) => p.type === 'video' && p.videoCodec === 'h264' && (!p.audioCodec || p.audioCodec === 'aac') && /mp4|mov/.test(p.container ?? '');

/** Transcode to H.264/AAC MP4 (yuv420p, faststart). `compress` also caps size to 1080p at a sane bitrate. */
export async function transcode(buf: Buffer, ext: string, compress: boolean): Promise<Buffer> {
  return withTemp(async dir => {
    const inF = join(dir, `in.${ext}`); const outF = join(dir, 'out.mp4');
    await writeFile(inF, buf);
    const scale = compress ? ['-vf', "scale='min(1920,iw)':'min(1920,ih)':force_original_aspect_ratio=decrease:force_divisible_by=2"] : ['-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2'];
    const r = await run('ffmpeg', ['-y', '-i', inF, ...scale, '-c:v', 'libx264', '-preset', 'veryfast', '-crf', compress ? '23' : '20', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', outF]);
    if (r.code !== 0) throw badRequest(`The video could not be converted: ${r.stderr.split('\n').filter(Boolean).pop() ?? 'ffmpeg failed'}`);
    return readFile(outF);
  });
}

/** A JPEG frame from the video at `atSeconds` (default 1s, or the middle of very short clips). */
export async function videoFrame(buf: Buffer, ext: string, atSeconds?: number, width = 640): Promise<Buffer | null> {
  return withTemp(async dir => {
    const inF = join(dir, `in.${ext}`); const outF = join(dir, 'f.jpg');
    await writeFile(inF, buf);
    const r = await run('ffmpeg', ['-y', '-ss', String(atSeconds ?? 1), '-i', inF, '-frames:v', '1', '-vf', `scale=${width}:-2`, '-q:v', '4', outF], 120_000);
    if (r.code !== 0) {
      const r2 = await run('ffmpeg', ['-y', '-i', inF, '-frames:v', '1', '-vf', `scale=${width}:-2`, '-q:v', '4', outF], 120_000);
      if (r2.code !== 0) return null;
    }
    return readFile(outF);
  });
}

export const imageThumb = (buf: Buffer, width: number) => sharp(buf, { animated: false }).rotate().resize({ width, withoutEnlargement: true }).jpeg({ quality: 80 }).toBuffer();

// ───────────────────────────── SSRF-safe fetch ─────────────────────────────

const PRIVATE_V4 = [/^0\./, /^10\./, /^127\./, /^169\.254\./, /^172\.(1[6-9]|2\d|3[01])\./, /^192\.168\./, /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./, /^198\.1[89]\./, /^22[4-9]\./, /^2[3-5]\d\./];
const isPrivate = (ip: string) => (isIP(ip) === 4 ? PRIVATE_V4.some(r => r.test(ip)) : /^(::1|::|fc|fd|fe80|::ffff:(10|127|192\.168|169\.254))/i.test(ip));

/**
 * Fetch a public URL on behalf of a customer. Resolves the host first and refuses private,
 * loopback and link-local addresses (and re-checks on every redirect), caps size and time.
 * Google Drive share links are turned into direct downloads.
 */
export async function fetchPublic(raw: string, maxBytes: number, allowLocal = false): Promise<{ buf: Buffer; contentType: string | null; name: string }> {
  let url = driveDirect(raw);
  for (let hop = 0; hop < 5; hop++) {
    let u: URL;
    try { u = new URL(url); } catch { throw badRequest('url is not a valid URL.', [{ code: 'invalid', message: 'Invalid URL', path: ['url'] }]); }
    if (!/^https?:$/.test(u.protocol)) throw badRequest('Only http(s) URLs can be fetched.');
    if (!allowLocal) {
      const addrs = isIP(u.hostname) ? [{ address: u.hostname }] : await lookup(u.hostname, { all: true }).catch(() => []);
      if (!addrs.length) throw badRequest(`Could not resolve ${u.hostname}.`);
      if (addrs.some(a => isPrivate(a.address))) throw badRequest('That URL points to a private network address and cannot be fetched.');
    }
    const res = await fetch(u, { redirect: 'manual', signal: AbortSignal.timeout(120_000), headers: { 'user-agent': 'SiarMediaFetcher/1.0 (+https://siaran.my)' } });
    if (res.status >= 300 && res.status < 400 && res.headers.get('location')) { url = new URL(res.headers.get('location')!, u).toString(); continue; }
    if (!res.ok) throw badRequest(`Fetching the URL failed with HTTP ${res.status}.`);
    const len = Number(res.headers.get('content-length') ?? 0);
    if (len > maxBytes) throw badRequest(`The file is larger than the ${Math.round(maxBytes / 1048576)} MB limit.`);
    const chunks: Buffer[] = []; let total = 0;
    for await (const c of res.body as any as AsyncIterable<Uint8Array>) {
      total += c.byteLength;
      if (total > maxBytes) throw badRequest(`The file is larger than the ${Math.round(maxBytes / 1048576)} MB limit.`);
      chunks.push(Buffer.from(c));
    }
    const cd = res.headers.get('content-disposition')?.match(/filename\*?=(?:UTF-8'')?"?([^";]+)/i)?.[1];
    return { buf: Buffer.concat(chunks), contentType: res.headers.get('content-type')?.split(';')[0] ?? null, name: decodeURIComponent(cd ?? u.pathname.split('/').pop() ?? 'file') };
  }
  throw badRequest('Too many redirects.');
}

function driveDirect(url: string) {
  const m = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)([\w-]+)/);
  return m ? `https://drive.google.com/uc?export=download&id=${m[1]}` : url;
}
