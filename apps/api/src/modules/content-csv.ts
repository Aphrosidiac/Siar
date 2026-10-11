import { randomUUID } from 'node:crypto';
import Papa from 'papaparse';
import type { NetworkType } from '@siar/networks';
import { config } from '../platform/config.js';
import { prisma } from '../platform/db.js';
import { audit } from '../platform/audit.js';
import { AppError, badRequest, notFound } from '../platform/errors.js';
import { listOf, pageOf } from '../platform/http.js';
import { logger } from '../platform/logger.js';
import { fetchPublic } from '../platform/media.js';
import { enqueue, JOBS } from '../platform/queue.js';
import { define } from '../platform/routes.js';
import * as storage from '../platform/storage.js';
import type { Actor } from '../platform/auth.js';
import { registerJob } from '../engine/jobs.js';
import { createPost } from './posts.js';
import { createUpload } from './uploads.js';
import { teamOf } from './teams.js';
import { csvImport, csvRow, jobActor } from './content-shared.js';

/**
 * Bulk post import from CSV (reference template: docs/reference/2026-10-11/bulk-post-import-template-mapped.csv).
 * Columns: teamId,title,text,postDate,status,socialAccountTypes, then <network><Field> columns.
 * '#' separates list cells (socialAccountTypes, *MediaUrls, tags…). Generic `text` applies to every
 * network without its own text column. Each row becomes one post through createPost(…, 'CSV'), so
 * every rule (validation, quotas, scheduling) is the same as the API; each row's outcome is kept.
 */

type Kind = 'str' | 'bool' | 'num' | 'int' | 'list' | 'json' | 'date';
interface Col { col: string; field: string; kind?: Kind; group?: string }
interface Net { type: NetworkType; prefix: string; cols: Col[]; firstComment: boolean }

const c = (col: string, field: string, kind: Kind = 'str', group?: string): Col => ({ col, field, kind, group });
const NETWORKS: Net[] = [
  { type: 'FACEBOOK', prefix: 'facebook', firstComment: true, cols: [c('Type', 'type'), c('Text', 'text'), c('Link', 'link'), c('Thumbnail', 'thumbnail'), c('MediaTitle', 'mediaTitle'), c('NativeScheduleTime', 'nativeScheduleTime', 'date'), c('TextFormatPresetId', 'textFormatPresetId')] },
  { type: 'INSTAGRAM', prefix: 'instagram', firstComment: true, cols: [c('Type', 'type'), c('Text', 'text'), c('ThumbnailOffset', 'thumbnailOffset', 'num'), c('Thumbnail', 'thumbnail'), c('ShareToFeed', 'shareToFeed', 'bool'), c('Collaborators', 'collaborators', 'list'), c('AutoFitImage', 'autoFitImage', 'bool'), c('AutoCropImage', 'autoCropImage', 'bool'), c('Tagged', 'tagged', 'json'), c('CarouselItems', 'carouselItems', 'json'), c('LocationId', 'locationId'), c('TrialParamsGraduationStrategy', 'graduationStrategy', 'str', 'trialParams'), c('MusicSoundId', 'musicSoundId', 'str', 'musicSoundInfo'), c('MusicSoundVolume', 'musicSoundVolume', 'num', 'musicSoundInfo'), c('VideoOriginalSoundVolume', 'videoOriginalSoundVolume', 'num', 'musicSoundInfo')] },
  { type: 'TIKTOK', prefix: 'tiktok', firstComment: true, cols: [c('Type', 'type'), c('Text', 'text'), c('Thumbnail', 'thumbnail'), c('Privacy', 'privacy'), c('IsBrandContent', 'isBrandContent', 'bool'), c('IsOrganicBrandContent', 'isOrganicBrandContent', 'bool'), c('DisableComments', 'disableComments', 'bool'), c('DisableDuet', 'disableDuet', 'bool'), c('DisableStitch', 'disableStitch', 'bool'), c('ThumbnailOffset', 'thumbnailOffset', 'num'), c('IsAiGenerated', 'isAiGenerated', 'bool'), c('AutoAddMusic', 'autoAddMusic', 'bool'), c('AutoScale', 'autoScale', 'bool'), c('UploadToDraft', 'uploadToDraft', 'bool'), c('PhotoCoverIndex', 'photoCoverIndex', 'int'), c('MusicSoundId', 'musicSoundId', 'str', 'musicSoundInfo'), c('MusicSoundVolume', 'musicSoundVolume', 'num', 'musicSoundInfo'), c('MusicSoundStart', 'musicSoundStart', 'num', 'musicSoundInfo'), c('MusicSoundEnd', 'musicSoundEnd', 'num', 'musicSoundInfo'), c('VideoOriginalSoundVolume', 'videoOriginalSoundVolume', 'num', 'musicSoundInfo')] },
  { type: 'YOUTUBE', prefix: 'youtube', firstComment: true, cols: [c('Type', 'type'), c('Title', 'text'), c('Description', 'description'), c('Thumbnail', 'thumbnail'), c('Privacy', 'privacy'), c('MadeForKids', 'madeForKids', 'bool'), c('ContainsSyntheticMedia', 'containsSyntheticMedia', 'bool'), c('HasPaidProductPlacement', 'hasPaidProductPlacement', 'bool')] },
  { type: 'LINKEDIN', prefix: 'linkedin', firstComment: true, cols: [c('Text', 'text'), c('Link', 'link'), c('Thumbnail', 'thumbnail'), c('MediaTitle', 'mediaTitle'), c('Privacy', 'privacy'), c('HideFromFeed', 'hideFromFeed', 'bool'), c('DisableReshare', 'disableReshare', 'bool')] },
  { type: 'PINTEREST', prefix: 'pinterest', firstComment: false, cols: [c('BoardName', 'boardName'), c('Title', 'text'), c('Description', 'description'), c('Link', 'link'), c('Thumbnail', 'thumbnail'), c('AltText', 'altText'), c('Note', 'note'), c('DominantColor', 'dominantColor')] },
  { type: 'REDDIT', prefix: 'reddit', firstComment: true, cols: [c('Subreddit', 'sr'), c('Text', 'text'), c('Description', 'description'), c('Link', 'link'), c('Nsfw', 'nsfw', 'bool'), c('FlairId', 'flairId')] },
  { type: 'MASTODON', prefix: 'mastodon', firstComment: true, cols: [c('Text', 'text'), c('Thumbnail', 'thumbnail'), c('Privacy', 'privacy'), c('Spoiler', 'spoiler')] },
  { type: 'THREADS', prefix: 'threads', firstComment: true, cols: [c('Text', 'text')] },
  { type: 'BLUESKY', prefix: 'bluesky', firstComment: true, cols: [c('Text', 'text'), c('Tags', 'tags', 'list'), c('Labels', 'labels', 'list'), c('QuoteUri', 'quoteUri'), c('ExternalUrl', 'externalUrl'), c('ExternalTitle', 'externalTitle'), c('ExternalDescription', 'externalDescription'), c('Thumbnail', 'thumbnail'), c('VideoAlt', 'videoAlt')] },
  { type: 'GOOGLE_BUSINESS', prefix: 'googleBusiness', firstComment: false, cols: [c('Text', 'text'), c('TopicType', 'topicType'), c('LanguageCode', 'languageCode'), c('CallToActionType', 'callToActionType'), c('CallToActionUrl', 'callToActionUrl'), c('EventTitle', 'eventTitle'), c('EventStartDate', 'eventStartDate', 'date'), c('EventEndDate', 'eventEndDate', 'date'), c('OfferCouponCode', 'offerCouponCode'), c('OfferRedeemOnlineUrl', 'offerRedeemOnlineUrl'), c('OfferTermsConditions', 'offerTermsConditions'), c('AlertType', 'alertType')] },
  { type: 'TWITTER', prefix: 'twitter', firstComment: true, cols: [c('Text', 'text'), c('ReplySettings', 'replySettings')] },
  { type: 'DISCORD', prefix: 'discord', firstComment: true, cols: [c('ChannelId', 'channelId'), c('Text', 'text'), c('Username', 'username'), c('AvatarUrl', 'avatarUrl')] },
  { type: 'SLACK', prefix: 'slack', firstComment: true, cols: [c('ChannelId', 'channelId'), c('Text', 'text'), c('Username', 'username'), c('AvatarUrl', 'avatarUrl')] },
];
const BASE = ['teamId', 'title', 'text', 'postDate', 'status', 'socialAccountTypes'];

/** The template's columns, in order (same order as the reference template). */
export const CSV_COLUMNS: string[] = [...BASE, ...NETWORKS.flatMap(n => [...n.cols.map(x => n.prefix + x.col), `${n.prefix}MediaUrls`, ...(n.firstComment ? [`${n.prefix}FirstComment`] : [])])];

const EXAMPLE: Record<string, string> = {
  teamId: 'YOUR_TEAM_ID', title: 'Your post title', text: 'Your post text (used by every network without its own text column)', postDate: '2026-04-01T10:00:00.000Z', status: 'SCHEDULED', socialAccountTypes: 'MASTODON#BLUESKY',
  mastodonText: 'Mastodon-specific text', mastodonPrivacy: 'PUBLIC', mastodonMediaUrls: 'https://cdn.your-site.com/a.jpg#https://cdn.your-site.com/b.jpg', mastodonFirstComment: 'Optional first comment posted right after the post goes live',
};
export const templateCsv = () => Papa.unparse({ fields: CSV_COLUMNS, data: [CSV_COLUMNS.map(k => EXAMPLE[k] ?? '')] }) + '\r\n';

const split = (v: string) => v.split('#').map(s => s.trim()).filter(Boolean);
function cell(kind: Kind, raw: string, col: string): unknown {
  const v = raw.trim();
  switch (kind) {
    case 'bool': if (/^(true|yes|1)$/i.test(v)) return true; if (/^(false|no|0)$/i.test(v)) return false; throw badRequest(`${col} must be true or false.`);
    case 'num': case 'int': { const x = Number(v); if (!Number.isFinite(x) || (kind === 'int' && !Number.isInteger(x))) throw badRequest(`${col} must be a number.`); return x; }
    case 'list': return split(v);
    case 'json': try { return JSON.parse(v); } catch { throw badRequest(`${col} must be JSON (e.g. [{"uploadId":"…"}]).`); }
    case 'date': { const d = new Date(v); if (Number.isNaN(d.getTime())) throw badRequest(`${col} must be an ISO 8601 date-time.`); return d.toISOString(); }
    default: return v;
  }
}

/** One CSV row → a post.create body (media still as URLs: { MASTODON: [url…] }). */
export function rowToBody(row: Record<string, string>) {
  const get = (k: string) => (row[k] ?? '').trim();
  const types = split(get('socialAccountTypes')).map(t => t.toUpperCase().replace(/[\s-]+/g, '_')) as NetworkType[];
  if (!get('teamId')) throw badRequest('teamId is empty.');
  if (!types.length) throw badRequest('socialAccountTypes is empty (separate several with #, e.g. MASTODON#BLUESKY).');
  const data: Record<string, any> = {}; const firstComment: Record<string, string> = {}; const media: Record<string, string[]> = {};
  for (const t of types) {
    const n = NETWORKS.find(x => x.type === t);
    if (!n) throw badRequest(`${t} cannot be imported from CSV.`);
    const entry: Record<string, any> = {};
    for (const x of n.cols) {
      const raw = get(n.prefix + x.col);
      if (!raw) continue;
      const v = cell(x.kind ?? 'str', raw, n.prefix + x.col);
      if (x.group) entry[x.group] = { ...(entry[x.group] ?? {}), [x.field]: v };
      else entry[x.field] = v;
    }
    const hasOwnText = n.cols.some(x => x.field === 'text' && get(n.prefix + x.col));
    if (!hasOwnText && get('text')) entry.text = get('text');
    const urls = split(get(`${n.prefix}MediaUrls`));
    if (urls.length) media[t] = urls;
    if (n.firstComment && get(`${n.prefix}FirstComment`)) firstComment[t] = get(`${n.prefix}FirstComment`);
    data[t] = entry;
  }
  const status = (get('status') || 'SCHEDULED').toUpperCase();
  if (!['DRAFT', 'SCHEDULED'].includes(status)) throw badRequest('status must be DRAFT or SCHEDULED.');
  const body = {
    teamId: get('teamId'), title: get('title') || get('text').slice(0, 80) || 'CSV import', postDate: get('postDate') || new Date().toISOString(), status,
    socialAccountTypes: types, data, ...(Object.keys(firstComment).length ? { firstComment } : {}),
  };
  return { body, media };
}

const errText = (err: unknown) => {
  if (err instanceof AppError) return [err.message, ...(err.issues ?? []).slice(1).map(i => `${i.path.join('.')}: ${i.message}`)].join(' · ').slice(0, 2000);
  return ((err as Error)?.message ?? String(err)).slice(0, 2000);
};

/** Process the file row by row; resumable (rows already recorded are skipped). */
export async function runCsvImport(importId: string) {
  const claimed = await prisma.csvImport.updateMany({ where: { id: importId, status: { in: ['PENDING', 'PROCESSING', 'RATE_LIMITED'] }, deletedAt: null }, data: { status: 'PROCESSING', startedAt: new Date() } });
  if (!claimed.count) return 'skipped';
  const imp = await prisma.csvImport.findUniqueOrThrow({ where: { id: importId } });
  const actor = jobActor(imp.organizationId, 'CSV import');
  try {
    const parsed = Papa.parse<Record<string, string>>((await storage.get(imp.storagePath!)).toString('utf8').replace(/^﻿/, ''), { header: true, skipEmptyLines: 'greedy' });
    const done = new Set((await prisma.csvImportRow.findMany({ where: { importId }, select: { rowNumber: true } })).map(r => r.rowNumber));
    let ok = await prisma.csvImportRow.count({ where: { importId, status: 'SUCCESS' } });
    let failed = await prisma.csvImportRow.count({ where: { importId, status: 'FAILED' } });
    for (let i = 0; i < parsed.data.length; i++) {
      const rowNumber = i + 2; // the header is row 1
      if (done.has(rowNumber)) continue;
      const raw = parsed.data[i];
      let normalized: unknown = null;
      try {
        const { body, media } = rowToBody(raw);
        await teamOf(actor, body.teamId);
        for (const [t, urls] of Object.entries(media)) {
          const ids: string[] = [];
          for (const url of urls) {
            const f = await fetchPublic(url, config.MAX_UPLOAD_MB * 1024 * 1024, config.NETWORK_MODE === 'mock' && config.NODE_ENV !== 'production');
            ids.push((await createUpload(actor, body.teamId, f.buf, f.contentType ?? undefined, f.name, url)).id);
          }
          body.data[t].uploadIds = ids;
        }
        normalized = body;
        const post = await createPost(actor, body, 'CSV');
        await prisma.csvImportRow.create({ data: { importId, rowNumber, status: 'SUCCESS', postId: post.id, rawRow: raw, normalizedPayload: body as object } });
        ok++;
      } catch (err) {
        if (!(err instanceof AppError)) logger.warn({ err, importId, rowNumber }, 'csv row failed');
        await prisma.csvImportRow.create({ data: { importId, rowNumber, status: 'FAILED', rawRow: raw, normalizedPayload: (normalized ?? undefined) as object | undefined, error: errText(err) } });
        failed++;
      }
      await prisma.csvImport.update({ where: { id: importId }, data: { processedRows: ok + failed, successRows: ok, failedRows: failed } });
    }
    await prisma.csvImport.update({ where: { id: importId }, data: { status: failed ? (ok ? 'COMPLETED_WITH_ERRORS' : 'FAILED') : 'COMPLETED', processedRows: ok + failed, successRows: ok, failedRows: failed, completedAt: new Date(), error: failed && !ok ? 'Every row failed. See the row results.' : null } });
    return 'COMPLETED';
  } catch (err) {
    logger.error({ err, importId }, 'csv import crashed');
    await prisma.csvImport.update({ where: { id: importId }, data: { status: 'FAILED', error: errText(err), completedAt: new Date() } });
    return 'FAILED';
  }
}
registerJob(JOBS.importCsv, d => runCsvImport(d.importId));

async function csvOf(actor: Actor, id: string) {
  const i = await prisma.csvImport.findFirst({ where: { id, organizationId: actor.organizationId, deletedAt: null } });
  if (!i) throw notFound('CSV import');
  return i;
}

const MAX_CSV_BYTES = 10 * 1024 * 1024;
const MAX_ROWS = 2000;

define({
  'postCSV.create': async ({ actor, req }) => {
    let file: { buf: Buffer; name: string } | null = null; let teamId: string | null = null;
    for await (const part of req.parts()) {
      if (part.type === 'file') {
        const buf = await part.toBuffer();
        if (part.fieldname === 'file') file = { buf, name: part.filename || 'import.csv' };
      } else if (part.fieldname === 'teamId' && part.value) teamId = String(part.value);
    }
    if (!file) throw badRequest('Send the CSV in a multipart field named "file".', [{ code: 'required', message: 'file is required', path: ['file'] }]);
    if (file.buf.length > MAX_CSV_BYTES) throw badRequest('The CSV is larger than 10 MB. Split it into smaller files.');
    const text = file.buf.toString('utf8').replace(/^﻿/, '');
    const parsed = Papa.parse<Record<string, string>>(text, { header: true, skipEmptyLines: 'greedy' });
    const fields = parsed.meta.fields ?? [];
    const missing = ['teamId', 'socialAccountTypes'].filter(f => !fields.includes(f));
    if (missing.length) throw badRequest(`The CSV is missing the ${missing.join(' and ')} column${missing.length > 1 ? 's' : ''}. Start from GET /api/v1/post-csv-import/template.csv.`, missing.map(m => ({ code: 'required', message: `${m} column is required`, path: ['file', m] })));
    const unknown = fields.filter(f => f && !CSV_COLUMNS.includes(f));
    if (unknown.length) throw badRequest(`Unknown column${unknown.length > 1 ? 's' : ''}: ${unknown.slice(0, 5).join(', ')}. Use the template's column names.`, unknown.slice(0, 20).map(u => ({ code: 'unknown_column', message: `Unknown column ${u}`, path: ['file', u] })));
    if (!parsed.data.length) throw badRequest('The CSV has no rows.');
    if (parsed.data.length > MAX_ROWS) throw badRequest(`The CSV has ${parsed.data.length} rows; the limit is ${MAX_ROWS} per file.`);
    // The import is filed under the given team, else the first row's team (rows may target any team of the organization).
    const firstTeam = teamId ?? parsed.data.map(r => (r.teamId ?? '').trim()).find(Boolean) ?? '';
    const team = await prisma.team.findFirst({ where: { id: firstTeam, organizationId: actor.organizationId, deletedAt: null } })
      ?? (teamId ? await teamOf(actor, teamId) : await prisma.team.findFirst({ where: { organizationId: actor.organizationId, deletedAt: null }, orderBy: { createdAt: 'asc' } }));
    if (!team) throw badRequest('Create a team first: every row needs a teamId of your organization.');
    const storagePath = `csv/${actor.organizationId}/${randomUUID()}.csv`;
    await storage.put(storagePath, Buffer.from(text, 'utf8'), 'text/csv');
    const imp = await prisma.$transaction(async tx => {
      const row = await tx.csvImport.create({ data: { teamId: team.id, organizationId: actor.organizationId, fileName: file!.name.slice(0, 200), storagePath, totalRows: parsed.data.length } });
      await audit(tx, actor, 'postCSV.create', 'CsvImport', row.id, `Uploaded ${file!.name} (${parsed.data.length} rows)`);
      return row;
    });
    await enqueue(JOBS.importCsv, { importId: imp.id }, { singletonKey: `csv:${imp.id}`, retryLimit: 0 });
    return csvImport(imp);
  },

  'postCSV.getList': async ({ actor, query }) => {
    const pg = pageOf(query);
    const where = { organizationId: actor.organizationId, deletedAt: null };
    const [rows, total] = await Promise.all([prisma.csvImport.findMany({ where, orderBy: { createdAt: 'desc' }, ...pg }), prisma.csvImport.count({ where })]);
    return listOf(rows.map(csvImport), total);
  },

  'postCSV.getById': async ({ actor, params }) => csvImport(await csvOf(actor, params.importId)),

  'postCSV.getStatus': async ({ actor, params }) => {
    const i = await csvOf(actor, params.importId);
    return { id: i.id, status: i.status, totalRows: i.totalRows, processedRows: i.processedRows, successRows: i.successRows, failedRows: i.failedRows, error: i.error, startedAt: i.startedAt?.toISOString() ?? null, completedAt: i.completedAt?.toISOString() ?? null, updatedAt: i.updatedAt.toISOString() };
  },

  'postCSV.getRows': async ({ actor, params, query }) => {
    const i = await csvOf(actor, params.importId);
    const pg = pageOf(query);
    const where = { importId: i.id, ...(query.status ? { status: String(query.status) } : {}) };
    const [rows, total] = await Promise.all([prisma.csvImportRow.findMany({ where, orderBy: { rowNumber: 'asc' }, ...pg }), prisma.csvImportRow.count({ where })]);
    return listOf(rows.map(csvRow), total);
  },
}, { multipart: true });
