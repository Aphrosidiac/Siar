import type { Post } from './types';

/** A post going out right now (publishing, or its time has come in the last 5 minutes): its status is about to change. */
export function inFlight(p: Post | null | undefined, now = Date.now()) {
  if (!p) return false;
  if (p.status === 'PROCESSING' || p.status === 'RETRYING') return true;
  if (p.status !== 'SCHEDULED' || !p.postDate) return false;
  const at = new Date(p.postDate).getTime();
  return at <= now + 5000 && now - at < 5 * 60_000;
}
