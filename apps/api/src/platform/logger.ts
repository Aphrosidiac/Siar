import pino from 'pino';
import { config } from './config.js';

export const logger = pino({
  level: config.NODE_ENV === 'test' ? 'silent' : config.LOG_LEVEL,
  redact: ['req.headers.authorization', 'req.headers.cookie', 'req.headers["x-api-key"]', '*.password', '*.passwordHash', '*.secret', '*.token', '*.accessToken', '*.refreshToken'],
  transport: config.NODE_ENV === 'development' ? { target: 'pino-pretty', options: { translateTime: 'SYS:HH:MM:ss', ignore: 'pid,hostname' } } : undefined,
});
