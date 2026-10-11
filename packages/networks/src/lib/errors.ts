/**
 * Every failure an adapter reports is a NetworkError. The network's own words are kept in
 * `errorMessage` (we surface them verbatim, as the public API promises); `code` is our
 * normalised category, which drives retries and reconnect prompts.
 */
export type ErrorCode =
  | 'TOKEN_INVALID'      // grant revoked/expired and refresh failed → account NEEDS_RECONNECT
  | 'PERMISSION'         // missing scope / not allowed for this account type
  | 'RATE_LIMITED'       // try later (see rateLimitResetAt)
  | 'MEDIA_INVALID'      // the network rejected the media
  | 'CONTENT_REJECTED'   // policy, duplicate content, length the network enforces
  | 'DUPLICATE'          // network says this exact content was already posted
  | 'NOT_FOUND'          // post/comment/channel no longer exists
  | 'VALIDATION'         // bad request shape for this network
  | 'NETWORK_UNAVAILABLE'// 5xx / timeout at the network
  | 'NOT_SUPPORTED'      // capability not available for this account/network
  | 'NOT_CONFIGURED'     // our app credentials for this network are missing
  | 'UNKNOWN';

export type Retryability = 'retryable' | 'non_retryable' | 'unknown';

const TRANSIENT: Partial<Record<ErrorCode, true>> = { RATE_LIMITED: true, NETWORK_UNAVAILABLE: true };

export class NetworkError extends Error {
  readonly code: ErrorCode;
  readonly httpStatus: number | null;
  readonly isTransient: boolean;
  readonly retryability: Retryability;
  readonly userFacingMessage: string;
  readonly meta: unknown;
  readonly rateLimitResetAt: Date | null;

  constructor(code: ErrorCode, errorMessage: string, opts: { httpStatus?: number | null; userFacingMessage?: string; meta?: unknown; rateLimitResetAt?: Date | null; retryability?: Retryability } = {}) {
    super(errorMessage);
    this.name = 'NetworkError';
    this.code = code;
    this.httpStatus = opts.httpStatus ?? null;
    this.isTransient = !!TRANSIENT[code];
    this.retryability = opts.retryability ?? (this.isTransient ? 'retryable' : code === 'UNKNOWN' ? 'unknown' : 'non_retryable');
    this.userFacingMessage = opts.userFacingMessage ?? errorMessage;
    this.meta = opts.meta ?? null;
    this.rateLimitResetAt = opts.rateLimitResetAt ?? null;
  }

  /** The `errorsVerbose[<TYPE>]` shape of the public API. */
  toVerbose() {
    return { code: this.code, errorMessage: this.message, isTransient: this.isTransient, retryability: this.retryability, httpStatus: this.httpStatus, meta: this.meta, userFacingMessage: this.userFacingMessage };
  }
}

export const isNetworkError = (e: unknown): e is NetworkError => e instanceof NetworkError || (!!e && (e as Error).name === 'NetworkError');

/** Default HTTP status → category. Adapters refine with the network's own error codes. */
export function codeForStatus(status: number): ErrorCode {
  if (status === 401) return 'TOKEN_INVALID';
  if (status === 403) return 'PERMISSION';
  if (status === 404) return 'NOT_FOUND';
  if (status === 409) return 'DUPLICATE';
  if (status === 413 || status === 415) return 'MEDIA_INVALID';
  if (status === 422 || status === 400) return 'VALIDATION';
  if (status === 429) return 'RATE_LIMITED';
  if (status >= 500) return 'NETWORK_UNAVAILABLE';
  return 'UNKNOWN';
}
