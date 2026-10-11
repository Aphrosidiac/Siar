import type { NetworkContext } from '../types.js';
import { codeForStatus, NetworkError, type ErrorCode } from './errors.js';

export interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  /** JSON body (sets content-type). */
  json?: unknown;
  /** application/x-www-form-urlencoded body. */
  form?: Record<string, string | number | boolean | undefined | null>;
  /** Raw body (multipart FormData, Buffer …). */
  body?: BodyInit;
  query?: Record<string, string | number | boolean | undefined | null>;
  bearer?: string | null;
  timeoutMs?: number;
  /** Map a failed response to a NetworkError. Return undefined to use the default mapping. */
  mapError?: (status: number, body: any, res: Response) => NetworkError | undefined;
}

export const withQuery = (url: string, query?: RequestOptions['query']) => {
  if (!query) return url;
  const u = new URL(url);
  for (const [k, v] of Object.entries(query)) if (v !== undefined && v !== null) u.searchParams.set(k, String(v));
  return u.toString();
};

export const formBody = (form: NonNullable<RequestOptions['form']>) => {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(form)) if (v !== undefined && v !== null) p.set(k, String(v));
  return p;
};

/** Seconds or HTTP-date in Retry-After / x-rate-limit-reset (epoch seconds). */
export function resetFrom(res: Response): Date | null {
  const ra = res.headers.get('retry-after');
  if (ra) return /^\d+$/.test(ra) ? new Date(Date.now() + Number(ra) * 1000) : new Date(ra);
  const reset = res.headers.get('x-rate-limit-reset') ?? res.headers.get('x-ratelimit-reset');
  if (reset && /^\d+$/.test(reset)) return new Date(Number(reset) > 1e12 ? Number(reset) : Number(reset) * 1000);
  return null;
}

/** The most useful human message out of a typical error body. */
export function messageOf(body: any, fallback: string): string {
  if (!body) return fallback;
  if (typeof body === 'string') return body.slice(0, 500) || fallback;
  return (
    body.error_description ?? body.error?.message ?? body.error?.error_user_msg ?? body.message ?? body.detail ?? body.title ??
    (typeof body.error === 'string' ? body.error : undefined) ?? body.errors?.[0]?.message ?? body.errors?.[0]?.detail ?? fallback
  );
}

/**
 * One HTTP call to a network. Returns parsed JSON (or text / null for empty bodies).
 * Non-2xx responses throw NetworkError carrying the network's message verbatim.
 */
export async function request<T = any>(ctx: NetworkContext, url: string, opts: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { accept: 'application/json', ...(opts.headers ?? {}) };
  let body: BodyInit | undefined = opts.body;
  if (opts.json !== undefined) { body = JSON.stringify(opts.json); headers['content-type'] = 'application/json'; }
  if (opts.form) { body = formBody(opts.form); headers['content-type'] = 'application/x-www-form-urlencoded'; }
  if (opts.bearer) headers.authorization = `Bearer ${opts.bearer}`;
  let res: Response;
  try {
    res = await ctx.fetch(withQuery(url, opts.query), { method: opts.method ?? (body ? 'POST' : 'GET'), headers, body, timeoutMs: opts.timeoutMs });
  } catch (err) {
    throw new NetworkError('NETWORK_UNAVAILABLE', `Could not reach ${new URL(url).host}: ${(err as Error).message}`, { meta: { url: redactUrl(url) } });
  }
  const text = await res.text();
  let parsed: any = null;
  if (text) { try { parsed = JSON.parse(text); } catch { parsed = text; } }
  if (!res.ok) {
    const mapped = opts.mapError?.(res.status, parsed, res);
    if (mapped) throw mapped;
    throw httpError(res, parsed);
  }
  return parsed as T;
}

export function httpError(res: Response, body: any, code?: ErrorCode) {
  const c = code ?? codeForStatus(res.status);
  return new NetworkError(c, messageOf(body, `${res.status} ${res.statusText}`), {
    httpStatus: res.status, meta: { body: typeof body === 'string' ? body.slice(0, 1000) : body }, rateLimitResetAt: c === 'RATE_LIMITED' ? resetFrom(res) : null,
  });
}

const redactUrl = (url: string) => url.replace(/(access_token|token|key|secret)=[^&]+/gi, '$1=…');

/** Wait helper for upload/processing loops inside one adapter call (keep short; long waits use poll()). */
export const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
