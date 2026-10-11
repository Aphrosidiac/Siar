import type { Actor } from './auth.js';
import type { Db } from './db.js';

const SECRET = /pass(word)?|secret|token|hash|key$/i;
function redact(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(redact);
  if (v && typeof v === 'object' && !(v instanceof Date)) return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, SECRET.test(k) ? '[redacted]' : redact(x)]));
  return v;
}

/** One row per meaningful change, in the same transaction as the change. `summary` is a sentence. */
export async function audit(db: Db, actor: Pick<Actor, 'kind' | 'organizationId' | 'name'> & { userId?: string | null; apiKeyId?: string }, action: string, entity: string, entityId: string | null, summary: string, data?: unknown) {
  await db.auditLog.create({
    data: {
      organizationId: actor.organizationId, actorType: actor.kind, actorId: actor.userId ?? actor.apiKeyId ?? null, actorName: actor.name,
      action, entity, entityId, summary, data: data === undefined ? undefined : (JSON.parse(JSON.stringify(redact(data))) as never),
    },
  });
}

export const systemActor = (organizationId: string) => ({ kind: 'SYSTEM' as const, organizationId, role: 'SYSTEM' as const, name: 'Siar', userId: null });
