import pino from 'pino';
import { config } from './config.js';

/** Query values that are secrets (OAuth codes and state, invite/reset/connect tokens): never written to logs. */
const SECRET_QUERY = /^(code|state|token|t|invite|id_token|access_token|refresh_token|oauth_token|oauth_verifier|key|password|secret)$/i;
export function redactUrl(url: string) {
  const q = url.indexOf('?');
  if (q < 0) return url;
  const params = new URLSearchParams(url.slice(q + 1));
  for (const k of [...params.keys()]) if (SECRET_QUERY.test(k)) params.set(k, '[redacted]');
  return `${url.slice(0, q)}?${params.toString().replace(/%5Bredacted%5D/g, '[redacted]')}`;
}

export const logger = pino({
  // Fastify's own request fields, with secret query values redacted
  serializers: {
    req: (r: { method?: string; url?: string; hostname?: string; host?: string; ip?: string; socket?: { remotePort?: number } }) => ({
      method: r.method, url: redactUrl(String(r.url ?? '')), host: r.host ?? r.hostname, remoteAddress: r.ip, remotePort: r.socket?.remotePort,
    }),
  },
  level: config.NODE_ENV === 'test' ? 'silent' : config.LOG_LEVEL,
  redact: ['req.headers.authorization', 'req.headers.cookie', 'req.headers["x-api-key"]', '*.password', '*.passwordHash', '*.secret', '*.token', '*.accessToken', '*.refreshToken'],
  transport: config.NODE_ENV === 'development' ? { target: 'pino-pretty', options: { translateTime: 'SYS:HH:MM:ss', ignore: 'pid,hostname' } } : undefined,
});
