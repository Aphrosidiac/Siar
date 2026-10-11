/**
 * One error envelope for the whole public API (wire-compatible with bundle.social v1):
 *   { "statusCode": 403, "message": "Social sets limit reached. Limit is 3 sets." }
 * A 400 adds `issues: [{ code, message, path }]`. Messages are written for the developer reading
 * them, and are relayed verbatim to dashboards and agents — say what to do, not just what broke.
 */
export interface Issue { code: string; message: string; path: (string | number)[] }

export class AppError extends Error {
  constructor(readonly statusCode: number, message: string, readonly issues?: Issue[], readonly extra?: Record<string, unknown>) {
    super(message);
    this.name = 'AppError';
  }
  toJSON() {
    return { statusCode: this.statusCode, message: this.message, ...(this.issues ? { issues: this.issues } : {}), ...(this.extra ?? {}) };
  }
}

export const badRequest = (message: string, issues?: Issue[]) => new AppError(400, message, issues);
export const validation = (issues: Issue[], message = 'Validation failed') => new AppError(400, message, issues);
export const unauthenticated = (message = 'Missing or invalid API key.') => new AppError(401, message);
export const forbidden = (message = 'You do not have access to this resource.') => new AppError(403, message);
export const quotaExceeded = (message: string) => new AppError(403, message);
export const notFound = (what = 'Resource') => new AppError(404, `${what} not found.`);
export const conflict = (message: string) => new AppError(409, message);
export const tooMany = (message = 'Too many requests. Back off and retry.', retryAfter?: number) => new AppError(429, message, undefined, retryAfter ? { retryAfter } : undefined);
export const notImplemented = (op: string) => new AppError(501, `${op} is not available on this server yet.`);
export const unavailable = (message: string) => new AppError(503, message);
export const upstream = (message: string, extra?: Record<string, unknown>) => new AppError(502, message, undefined, extra);
