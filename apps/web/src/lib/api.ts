/**
 * The one fetch client. Session cookie (credentials: include), `x-siar: 1` on every request (the API
 * refuses mutating browser requests without it), `x-organization-id` from the selected org.
 * Errors come back as ApiError carrying the API envelope `{ statusCode, message, issues? }`.
 */
export interface Issue { code?: string; message: string; path: (string | number)[] }

export class ApiError extends Error {
  status: number;
  issues: Issue[];
  body: any;
  constructor(status: number, message: string, issues: Issue[] = [], body: any = null) {
    super(message);
    this.status = status;
    this.issues = issues;
    this.body = body;
  }
  get notImplemented() { return this.status === 501; }
  get forbidden() { return this.status === 403; }
}

export const isApiError = (e: unknown): e is ApiError => e instanceof ApiError;
export const isNotImplemented = (e: unknown) => e instanceof ApiError && e.status === 501;
export const errorMessage = (e: unknown) => (e instanceof Error ? e.message : typeof e === 'string' ? e : 'Something went wrong.');

let organizationId: string | null = null;
export const setOrganizationId = (id: string | null) => { organizationId = id; };
export const getOrganizationId = () => organizationId;

type QueryValue = string | number | boolean | null | undefined | (string | number)[];
export interface RequestOptions {
  query?: Record<string, QueryValue>;
  body?: unknown;
  form?: FormData;
  signal?: AbortSignal;
  /** Do not bounce to /login on 401 (used by the session probe and public pages). */
  noAuthRedirect?: boolean;
}

let onUnauthenticated: (() => void) | null = null;
export const setUnauthenticatedHandler = (fn: () => void) => { onUnauthenticated = fn; };

export function buildUrl(path: string, query?: Record<string, QueryValue>) {
  const base = path.startsWith('/api/') ? path : `/api/v1${path.startsWith('/') ? '' : '/'}${path}`;
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(query ?? {})) {
    if (v === undefined || v === null || v === '') continue;
    if (Array.isArray(v)) { for (const x of v) qs.append(k, String(x)); }
    else qs.append(k, String(v));
  }
  const s = qs.toString();
  return s ? `${base}?${s}` : base;
}

export async function request<T = any>(method: string, path: string, opts: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { 'x-siar': '1', accept: 'application/json' };
  if (organizationId) headers['x-organization-id'] = organizationId;
  let body: BodyInit | undefined;
  if (opts.form) body = opts.form;
  else if (opts.body !== undefined) { headers['content-type'] = 'application/json'; body = JSON.stringify(opts.body); }
  let res: Response;
  try {
    res = await fetch(buildUrl(path, opts.query), { method, headers, body, credentials: 'include', signal: opts.signal });
  } catch (e) {
    if ((e as Error).name === 'AbortError') throw e;
    throw new ApiError(0, 'Cannot reach the Siar API. Check your connection and try again.');
  }
  const text = await res.text();
  let json: any = null;
  if (text) { try { json = JSON.parse(text); } catch { json = null; } }
  if (!res.ok) {
    if (res.status === 401 && !opts.noAuthRedirect && onUnauthenticated) onUnauthenticated();
    const message = json?.message || (res.status === 501 ? 'Not available on this server yet.' : `Request failed (${res.status}).`);
    throw new ApiError(res.status, message, Array.isArray(json?.issues) ? json.issues : [], json);
  }
  return json as T;
}

export const api = {
  get: <T = any>(path: string, query?: RequestOptions['query'], opts: Omit<RequestOptions, 'query'> = {}) => request<T>('GET', path, { ...opts, query }),
  post: <T = any>(path: string, body?: unknown, opts: RequestOptions = {}) => request<T>('POST', path, { ...opts, body: body ?? {} }),
  put: <T = any>(path: string, body?: unknown, opts: RequestOptions = {}) => request<T>('PUT', path, { ...opts, body: body ?? {} }),
  patch: <T = any>(path: string, body?: unknown, opts: RequestOptions = {}) => request<T>('PATCH', path, { ...opts, body: body ?? {} }),
  del: <T = any>(path: string, body?: unknown, opts: RequestOptions = {}) => request<T>('DELETE', path, { ...opts, ...(body !== undefined ? { body } : {}) }),
  upload: <T = any>(path: string, form: FormData, opts: RequestOptions = {}) => request<T>('POST', path, { ...opts, form }),
};

/** Map API issues onto field keys: ['data','INSTAGRAM','text'] → 'data.INSTAGRAM.text'. */
export function issuesByPath(issues: Issue[]) {
  const out: Record<string, string> = {};
  for (const i of issues) {
    const k = (i.path ?? []).join('.');
    if (!(k in out)) out[k] = i.message;
  }
  return out;
}
