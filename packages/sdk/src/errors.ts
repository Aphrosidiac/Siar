/** One field-level problem reported by the API (validation errors, per-network rules). */
export interface SiarIssue {
  code?: string;
  message: string;
  path?: (string | number)[];
  [key: string]: unknown;
}

/**
 * Every failed request throws a SiarError. `statusCode` is the HTTP status, or 0 when no response
 * arrived (network failure, timeout, abort — see `code`). `message` and `issues` are the API's own.
 */
export class SiarError extends Error {
  override readonly name: string = 'SiarError';
  readonly statusCode: number;
  readonly issues: SiarIssue[];
  /** 'timeout' | 'network' | 'aborted' when statusCode is 0; otherwise undefined. */
  readonly code?: 'timeout' | 'network' | 'aborted';
  /** operationId of the failed request, when known. */
  readonly operationId?: string;
  /** The parsed (or raw text) error body. */
  readonly body?: unknown;
  readonly headers?: Headers;
  /** Seconds the server asked us to wait (429 / 503), when it said. */
  readonly retryAfter?: number;

  constructor(init: {
    statusCode: number; message: string; issues?: SiarIssue[]; code?: SiarError['code'];
    operationId?: string; body?: unknown; headers?: Headers; retryAfter?: number; cause?: unknown;
  }) {
    super(init.message, init.cause !== undefined ? { cause: init.cause } : undefined);
    this.statusCode = init.statusCode;
    this.issues = init.issues ?? [];
    this.code = init.code;
    this.operationId = init.operationId;
    this.body = init.body;
    this.headers = init.headers;
    this.retryAfter = init.retryAfter;
  }

  /** Coarse error class, handy for exit codes and branching. */
  get kind(): 'auth' | 'not_found' | 'validation' | 'rate_limited' | 'server' | 'connection' | 'client' {
    const s = this.statusCode;
    if (s === 0) return 'connection';
    if (s === 401 || s === 403) return 'auth';
    if (s === 404) return 'not_found';
    if (s === 400 || s === 409 || s === 422) return 'validation';
    if (s === 429) return 'rate_limited';
    if (s >= 500) return 'server';
    return 'client';
  }

  toJSON() {
    return { statusCode: this.statusCode, message: this.message, issues: this.issues, ...(this.code ? { code: this.code } : {}) };
  }
}

/** Thrown by `webhooks.constructEvent` when a delivery cannot be trusted. */
export class SiarWebhookError extends Error {
  override readonly name = 'SiarWebhookError';
  constructor(message: string, readonly reason: 'missing_header' | 'bad_timestamp' | 'expired' | 'bad_signature' | 'bad_payload') {
    super(message);
  }
}
