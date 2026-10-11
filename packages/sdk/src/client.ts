import { SiarError, type SiarIssue } from './errors.js';
import {
  OPERATIONS, createResources,
  type CallArgs, type OperationId, type PaginatedOperationId, type PathParams, type Query, type RequestOptions, type Result, type SiarResources,
} from './generated.js';
import { Uploads } from './uploads.js';
import { Webhooks } from './webhooks.js';

export const DEFAULT_BASE_URL = 'https://api.siar.dev';
export const SDK_VERSION = '0.1.0';

export interface SiarOptions {
  /** API key (sent as `x-api-key`). Defaults to `process.env.SIAR_API_KEY`. */
  apiKey?: string;
  /** API origin. Defaults to `process.env.SIAR_API_URL`, then https://api.siar.dev. */
  baseUrl?: string;
  /** Custom fetch (tests, proxies, older runtimes). Defaults to the global fetch. */
  fetch?: typeof fetch;
  /** Per-attempt timeout in milliseconds. Default 60 000. */
  timeoutMs?: number;
  /** Retries after the first attempt on 429 / 5xx / network errors (idempotent methods only). Default 2. */
  maxRetries?: number;
  /** Base delay of the exponential backoff in milliseconds. Default 500. */
  retryDelayMs?: number;
  /** Longest single wait between retries. A Retry-After longer than this fails fast. Default 30 000. */
  maxRetryDelayMs?: number;
  /** Headers added to every API request. */
  headers?: Record<string, string>;
}

/** Item type of a paginated operation's `items` array. */
export type PageItem<K extends OperationId> =
  Result<K> extends { items: (infer I)[] } ? I : Result<K> extends (infer I)[] ? I : unknown;

export interface PaginateOptions<K extends OperationId> extends RequestOptions {
  /** Path parameters, for paged operations under a resource (e.g. webhook.deliveries). */
  path?: PathParams<K>;
  /** Page size (sent as `limit`). Default 100. */
  pageSize?: number;
  /** Stop after this many items. */
  maxItems?: number;
}

const IDEMPOTENT = new Set(['GET', 'HEAD', 'PUT', 'DELETE', 'OPTIONS']);
const env = (name: string): string | undefined =>
  typeof process !== 'undefined' && process.env ? process.env[name] || undefined : undefined;

export const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

/** Serialises a query object: arrays repeat the key, dates become ISO strings, null/undefined are dropped. */
export function toQueryString(query: object | undefined): string {
  if (!query) return '';
  const sp = new URLSearchParams();
  const add = (k: string, v: unknown) => {
    if (v === undefined || v === null) return;
    if (v instanceof Date) sp.append(k, v.toISOString());
    else if (typeof v === 'object') sp.append(k, JSON.stringify(v));
    else sp.append(k, String(v));
  };
  for (const [k, v] of Object.entries(query)) {
    if (Array.isArray(v)) v.forEach(x => add(k, x));
    else add(k, v);
  }
  const s = sp.toString();
  return s ? `?${s}` : '';
}

/** Parses Retry-After (delta seconds or HTTP date) into seconds. */
export function parseRetryAfter(value: string | null | undefined): number | undefined {
  if (!value) return undefined;
  const n = Number(value);
  if (Number.isFinite(n)) return Math.max(0, n);
  const t = Date.parse(value);
  return Number.isNaN(t) ? undefined : Math.max(0, (t - Date.now()) / 1000);
}

const isRetryableStatus = (s: number) => s === 408 || s === 429 || (s >= 500 && s !== 501);

/** Shared core: request building, auth, timeouts, retries and error mapping. */
export class SiarCore {
  readonly baseUrl: string;
  /** The configured API key (kept off `apiKey`, which is the API-key resource group). */
  readonly key: string | undefined;
  readonly timeoutMs: number;
  readonly maxRetries: number;
  readonly retryDelayMs: number;
  readonly maxRetryDelayMs: number;
  protected readonly headers: Record<string, string>;
  protected readonly fetchImpl: typeof fetch;

  constructor(opts: SiarOptions = {}) {
    this.key = opts.apiKey ?? env('SIAR_API_KEY');
    this.baseUrl = (opts.baseUrl ?? env('SIAR_API_URL') ?? DEFAULT_BASE_URL).replace(/\/+$/, '');
    this.timeoutMs = opts.timeoutMs ?? 60_000;
    this.maxRetries = opts.maxRetries ?? 2;
    this.retryDelayMs = opts.retryDelayMs ?? 500;
    this.maxRetryDelayMs = opts.maxRetryDelayMs ?? 30_000;
    this.headers = opts.headers ?? {};
    const f = opts.fetch ?? (globalThis as { fetch?: typeof fetch }).fetch;
    if (!f) throw new Error('No fetch implementation found. Pass { fetch } to new Siar().');
    this.fetchImpl = f;
  }

  /** Backoff before retry number `attempt` (0-based): exponential with jitter, or the server's Retry-After. */
  retryDelay(attempt: number, retryAfterSeconds?: number): number {
    if (retryAfterSeconds !== undefined) return Math.round(retryAfterSeconds * 1000);
    const exp = Math.min(this.maxRetryDelayMs, this.retryDelayMs * 2 ** attempt);
    return Math.round(exp / 2 + Math.random() * (exp / 2));
  }

  /**
   * Calls any operation by operationId. The generated methods (siar.post.create …) are thin
   * wrappers around this; use it directly for dynamic dispatch.
   */
  async request<K extends OperationId>(operationId: K, args: CallArgs = {}, options: RequestOptions = {}): Promise<Result<K>> {
    const def = OPERATIONS[operationId];
    if (!def) throw new TypeError(`Unknown operationId "${operationId}"`);
    const pathArgs = (args.path ?? {}) as Record<string, unknown>;
    const path = def.path.replace(/\{(\w+)\}/g, (_, name: string) => {
      const v = pathArgs[name];
      if (v === undefined || v === null || v === '') throw new TypeError(`${operationId}: missing path parameter "${name}"`);
      return encodeURIComponent(String(v));
    });
    const url = this.baseUrl + path + toQueryString(args.query as object | undefined);

    const headers: Record<string, string> = { accept: 'application/json', ...this.headers, ...options.headers };
    if (this.key) headers['x-api-key'] = this.key;
    let body: BodyInit | undefined;
    if (def.body === 'multipart' && args.body !== undefined) body = toFormData(args.body);
    else if (args.body !== undefined && def.body !== null) {
      headers['content-type'] = 'application/json';
      body = JSON.stringify(args.body);
    }

    const canRetry = IDEMPOTENT.has(def.method) || options.retry === true;
    const maxRetries = canRetry ? options.maxRetries ?? this.maxRetries : 0;
    return this.send(url, { method: def.method, headers, body }, { ...options, maxRetries, operationId }) as Promise<Result<K>>;
  }

  /** Low-level send with timeout + retry + error mapping. Returns the parsed body. */
  async send(url: string, init: RequestInit, opts: RequestOptions & { operationId?: string; maxRetries?: number; raw?: boolean }): Promise<unknown> {
    const maxRetries = opts.maxRetries ?? 0;
    for (let attempt = 0; ; attempt++) {
      let err: SiarError;
      try {
        const { status, headers, data } = await this.attempt(url, init, opts);
        if (status >= 200 && status < 300) return opts.raw ? { status, headers, data } : data;
        err = apiError(status, headers, data, opts.operationId);
        if (!isRetryableStatus(status)) throw err;
      } catch (e) {
        if (!(e instanceof SiarError)) throw e;
        err = e;
        if (err.statusCode !== 0 || err.code === 'aborted') throw err;
      }
      if (attempt >= maxRetries) throw err;
      const wait = this.retryDelay(attempt, err.retryAfter);
      if (wait > this.maxRetryDelayMs) throw err;
      await sleep(wait);
      if (opts.signal?.aborted) throw err;
    }
  }

  private async attempt(url: string, init: RequestInit, opts: RequestOptions & { operationId?: string }) {
    const ctrl = new AbortController();
    const timeoutMs = opts.timeoutMs ?? this.timeoutMs;
    let timedOut = false;
    const timer = setTimeout(() => { timedOut = true; ctrl.abort(); }, timeoutMs);
    const onAbort = () => ctrl.abort();
    if (opts.signal) {
      if (opts.signal.aborted) ctrl.abort();
      else opts.signal.addEventListener('abort', onAbort, { once: true });
    }
    try {
      const res = await this.fetchImpl(url, { ...init, signal: ctrl.signal });
      const text = await res.text();
      let data: unknown = undefined;
      if (text) {
        const ct = res.headers.get('content-type') ?? '';
        if (ct.includes('json')) {
          try { data = JSON.parse(text); } catch { data = text; }
        } else data = text;
      }
      return { status: res.status, headers: res.headers, data };
    } catch (e) {
      const code = timedOut ? 'timeout' : opts.signal?.aborted ? 'aborted' : 'network';
      const cause = (e as { cause?: { code?: string; message?: string } })?.cause;
      const message = code === 'timeout' ? `Request timed out after ${timeoutMs} ms`
        : code === 'aborted' ? 'Request aborted'
        : `Request failed: ${(e as Error)?.message ?? String(e)}${cause ? ` (${cause.code ?? cause.message})` : ''}`;
      throw new SiarError({ statusCode: 0, message, code, operationId: opts.operationId, cause: e });
    } finally {
      clearTimeout(timer);
      opts.signal?.removeEventListener('abort', onAbort);
    }
  }
}

function apiError(status: number, headers: Headers, data: unknown, operationId?: string): SiarError {
  const obj = data && typeof data === 'object' ? data as { message?: unknown; issues?: unknown; retryAfter?: unknown } : undefined;
  const message = typeof obj?.message === 'string' ? obj.message
    : typeof data === 'string' && data.trim() ? data.trim().slice(0, 500)
    : `HTTP ${status}`;
  const issues = Array.isArray(obj?.issues) ? obj.issues as SiarIssue[] : [];
  const retryAfter = parseRetryAfter(headers.get('retry-after'))
    ?? (typeof obj?.retryAfter === 'number' ? obj.retryAfter : undefined);
  return new SiarError({ statusCode: status, message, issues, operationId, body: data, headers, retryAfter });
}

function toFormData(body: unknown): FormData {
  if (body instanceof FormData) return body;
  const fd = new FormData();
  for (const [k, v] of Object.entries(body as Record<string, unknown>)) {
    if (v === undefined || v === null) continue;
    if (v instanceof Blob) fd.append(k, v, (v as File).name ?? k);
    else fd.append(k, typeof v === 'object' ? JSON.stringify(v) : String(v));
  }
  return fd;
}

// The class gets one property per resource group (post, team, socialAccount, misc …) at runtime;
// declaration merging gives it the types.
export interface Siar extends SiarResources {}

/**
 * The Siar API client.
 *
 * ```ts
 * const siar = new Siar({ apiKey: process.env.SIAR_API_KEY });
 * const post = await siar.post.create({ teamId, title: 'Hello', postDate: new Date().toISOString(),
 *   status: 'SCHEDULED', socialAccountTypes: ['BLUESKY'], data: { BLUESKY: { text: 'Hello' } } });
 * ```
 */
export class Siar extends SiarCore {
  /** File and URL upload helpers (simple vs multipart chosen by size). */
  readonly uploads: Uploads;
  /** Webhook signature verification. Static too: `Siar.webhooks`. */
  readonly webhooks: Webhooks;
  static readonly webhooks = new Webhooks();

  constructor(opts: SiarOptions = {}) {
    super(opts);
    Object.assign(this, createResources((id, args, options) => this.request(id, args, options)));
    this.uploads = new Uploads(this);
    this.webhooks = Siar.webhooks;
  }

  /**
   * Iterates every item of an offset/limit list, fetching pages as needed.
   *
   * ```ts
   * for await (const post of siar.paginate('post.getList', { teamId, status: 'POSTED' })) …
   * ```
   */
  async *paginate<K extends PaginatedOperationId>(
    operationId: K,
    query?: Omit<Query<K>, 'offset' | 'limit'> & { offset?: number | null; limit?: number | null },
    options: PaginateOptions<K> = {},
  ): AsyncGenerator<PageItem<K>, void, undefined> {
    const { path, pageSize, maxItems, ...reqOpts } = options;
    const q = { ...(query as Record<string, unknown> | undefined) };
    const limit = pageSize ?? (typeof q.limit === 'number' ? q.limit : 100);
    let offset = typeof q.offset === 'number' ? q.offset : 0;
    let seen = 0;
    if (maxItems !== undefined && maxItems <= 0) return;
    for (;;) {
      const page: unknown = await this.request(operationId, { path: path as object | undefined, query: { ...q, offset, limit } }, reqOpts);
      const items: unknown[] = Array.isArray(page) ? page : Array.isArray((page as { items?: unknown })?.items) ? (page as { items: unknown[] }).items : [];
      const total = !Array.isArray(page) && typeof (page as { total?: unknown })?.total === 'number' ? (page as { total: number }).total : undefined;
      for (const item of items) {
        yield item as PageItem<K>;
        if (maxItems !== undefined && ++seen >= maxItems) return;
      }
      offset += items.length;
      if (items.length === 0) return;
      if (total !== undefined ? offset >= total : items.length < limit) return;
    }
  }
}
