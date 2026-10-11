import type { Body } from './generated.js';

export type PostBody = Body<'post.create'>;
export type NetworkType = PostBody['socialAccountTypes'][number];

export const NETWORKS: readonly NetworkType[] = [
  'TIKTOK', 'YOUTUBE', 'INSTAGRAM', 'FACEBOOK', 'TWITTER', 'THREADS', 'LINKEDIN', 'PINTEREST',
  'REDDIT', 'MASTODON', 'DISCORD', 'SLACK', 'BLUESKY', 'GOOGLE_BUSINESS', 'SNAPCHAT',
];

const ALIASES: Record<string, NetworkType> = { X: 'TWITTER', GOOGLEBUSINESS: 'GOOGLE_BUSINESS', GBP: 'GOOGLE_BUSINESS', GMB: 'GOOGLE_BUSINESS' };

/** Normalises "twitter, bluesky" / ["x","BLUESKY"] to network enum values; throws on unknown names. */
export function parseNetworks(input: string | readonly string[]): NetworkType[] {
  const raw = (typeof input === 'string' ? input.split(',') : input.flatMap(s => s.split(','))).map(s => s.trim()).filter(Boolean);
  const out: NetworkType[] = [];
  for (const r of raw) {
    const key = r.toUpperCase().replace(/[\s-]/g, '_');
    const n = (NETWORKS as readonly string[]).includes(key) ? key as NetworkType : ALIASES[key.replace(/_/g, '')];
    if (!n) throw new TypeError(`Unknown network "${r}". Use one of: ${NETWORKS.join(', ')}`);
    if (!out.includes(n)) out.push(n);
  }
  return out;
}

export interface ComposePostInput {
  teamId: string;
  networks: string | readonly string[];
  /** Text used for every network (per-network `data` overrides it). */
  text?: string;
  /** Upload ids attached to every network. */
  uploadIds?: string[];
  /** ISO time to publish at. Omit with `now: true` to publish immediately. */
  at?: string | Date;
  now?: boolean;
  draft?: boolean;
  title?: string;
  referenceKey?: string;
  /** Per-network data, merged over the generated `{ text, uploadIds }` (e.g. { YOUTUBE: { type: 'SHORT', title } }). */
  data?: Record<string, Record<string, unknown> | null | undefined>;
  /** First comment posted under the post on every network that supports one. String or per-network map. */
  firstComment?: string | Record<string, string>;
}

/**
 * Builds a `post.create` body from flat options: the same text/media on every network, plus any
 * per-network data. Shared by the CLI and the MCP server.
 */
export function composePost(input: ComposePostInput): PostBody {
  const networks = parseNetworks(input.networks);
  if (!networks.length) throw new TypeError('At least one network is required.');
  if (!input.draft && !input.now && !input.at) throw new TypeError('Give a publish time (at) or now: true, or make it a draft.');
  if (input.now && input.at) throw new TypeError('Use either at or now, not both.');
  const when = input.at ? new Date(input.at) : new Date();
  if (Number.isNaN(when.getTime())) throw new TypeError(`Invalid date "${String(input.at)}". Use ISO 8601, e.g. 2026-10-12T09:00:00Z.`);

  const extra = input.data ?? {};
  for (const k of Object.keys(extra)) if (!networks.includes(k as NetworkType)) throw new TypeError(`data.${k} is not one of the selected networks (${networks.join(', ')}).`);
  const data: Record<string, Record<string, unknown>> = {};
  for (const n of networks) {
    data[n] = {
      ...(input.text !== undefined ? { text: input.text } : {}),
      ...(input.uploadIds?.length ? { uploadIds: input.uploadIds } : {}),
      ...(extra[n] ?? {}),
    };
  }

  let firstComment: Record<string, string> | undefined;
  if (typeof input.firstComment === 'string' && input.firstComment) firstComment = Object.fromEntries(networks.map(n => [n, input.firstComment as string]));
  else if (input.firstComment && typeof input.firstComment === 'object') firstComment = input.firstComment;

  const text = input.text ?? Object.values(data).map(d => d.text).find((t): t is string => typeof t === 'string') ?? '';
  const title = input.title ?? (text.replace(/\s+/g, ' ').trim().slice(0, 80) || 'Untitled post');

  return {
    teamId: input.teamId,
    title,
    postDate: when.toISOString(),
    status: input.draft ? 'DRAFT' : 'SCHEDULED',
    socialAccountTypes: networks,
    data: data as PostBody['data'],
    ...(input.referenceKey ? { referenceKey: input.referenceKey } : {}),
    ...(firstComment ? { firstComment: firstComment as PostBody['firstComment'] } : {}),
  } as PostBody;
}
