import { prisma, type Db } from '../platform/db.js';
import { emit, flushDeliveries, notify } from '../platform/events.js';
import { forbidden } from '../platform/errors.js';
import { X_PRICES, type XAction } from './plans.js';

/**
 * X pass-through credit (micro-USD). Invariants (tests/credits.test.ts):
 *   CreditAccount.balanceMicros == SUM(CreditLedger.deltaMicros)
 *   CreditAccount.heldMicros    == SUM(CreditHold.amountMicros WHERE status = HELD)
 *   available = balance − held, never negative at hold time.
 * A metered call: hold() before the network call, capture() on success, release() on failure.
 */

export async function ensureAccount(db: Db, organizationId: string) {
  return db.creditAccount.upsert({ where: { organizationId }, update: {}, create: { organizationId } });
}

export async function balance(organizationId: string) {
  const a = await ensureAccount(prisma, organizationId);
  const available = a.balanceMicros - a.heldMicros;
  return {
    organizationId, currency: 'usd' as const,
    balanceMicros: Number(a.balanceMicros), heldMicros: Number(a.heldMicros), availableMicros: Number(available),
    balanceCents: Math.floor(Number(a.balanceMicros) / 10_000), availableCents: Math.floor(Number(available) / 10_000),
    lowBalanceThresholdMicros: a.lowBalanceThresholdMicros === null ? null : Number(a.lowBalanceThresholdMicros),
    lowBalance: a.lowBalanceThresholdMicros !== null && available < a.lowBalanceThresholdMicros,
    updatedAt: a.updatedAt.toISOString(),
  };
}

export const priceOf = (action: XAction, count = 1) => BigInt(X_PRICES[action] * count);

/** Reserve credit for a metered action. Throws 403 when the balance cannot cover it. */
export async function hold(organizationId: string, action: XAction, count = 1, ref?: { type: string; id: string }) {
  const amount = priceOf(action, count);
  return prisma.$transaction(async tx => {
    await ensureAccount(tx, organizationId);
    const rows = await tx.$queryRaw<{ organizationId: string }[]>`
      UPDATE "CreditAccount" SET "heldMicros" = "heldMicros" + ${amount}, "updatedAt" = now()
      WHERE "organizationId" = ${organizationId} AND "balanceMicros" - "heldMicros" >= ${amount} RETURNING "organizationId"`;
    if (!rows.length) {
      const ids = await emit(tx, organizationId, 'credit.exhausted', { organizationId, action });
      await notify(tx, organizationId, { kind: 'credit', title: 'X credit exhausted', body: 'X posts, comments and analytics are paused until you top up.', link: '/organization/billing?tab=credits' }, ['OWNER', 'ADMIN']);
      void flushDeliveries(ids);
      throw forbidden(`Not enough X credit for this action ($${(Number(amount) / 1e6).toFixed(3)}). Top up your balance in Billing → Credits.`);
    }
    return tx.creditHold.create({ data: { organizationId, action, amountMicros: amount, refType: ref?.type, refId: ref?.id } });
  });
}

/** Charge a hold: ledger row + balance move, once. */
export async function capture(holdId: string, note?: string) {
  const ids = await prisma.$transaction(async tx => {
    const h = await tx.creditHold.findUnique({ where: { id: holdId } });
    if (!h || h.status !== 'HELD') return [];
    const claimed = await tx.creditHold.updateMany({ where: { id: holdId, status: 'HELD' }, data: { status: 'CAPTURED', settledAt: new Date() } });
    if (!claimed.count) return [];
    await tx.creditLedger.create({ data: { organizationId: h.organizationId, deltaMicros: -h.amountMicros, reason: 'CHARGE', action: h.action, refType: h.refType, refId: h.refId, note } });
    const acc = await tx.creditAccount.update({ where: { organizationId: h.organizationId }, data: { balanceMicros: { decrement: h.amountMicros }, heldMicros: { decrement: h.amountMicros } } });
    const available = acc.balanceMicros - acc.heldMicros;
    if (acc.lowBalanceThresholdMicros !== null && available < acc.lowBalanceThresholdMicros && (!acc.lowBalanceNotifiedAt || Date.now() - acc.lowBalanceNotifiedAt.getTime() > 86_400_000)) {
      await tx.creditAccount.update({ where: { organizationId: h.organizationId }, data: { lowBalanceNotifiedAt: new Date() } });
      await notify(tx, h.organizationId, { kind: 'credit', title: 'X credit is running low', body: `$${(Number(available) / 1e6).toFixed(2)} left.`, link: '/organization/billing?tab=credits' }, ['OWNER', 'ADMIN']);
      return emit(tx, h.organizationId, 'credit.low-balance', { organizationId: h.organizationId, availableMicros: Number(available) });
    }
    return [];
  });
  void flushDeliveries(ids);
}

export async function release(holdId: string) {
  await prisma.$transaction(async tx => {
    const claimed = await tx.creditHold.updateMany({ where: { id: holdId, status: 'HELD' }, data: { status: 'RELEASED', settledAt: new Date() } });
    if (!claimed.count) return;
    const h = await tx.creditHold.findUniqueOrThrow({ where: { id: holdId } });
    await tx.creditAccount.update({ where: { organizationId: h.organizationId }, data: { heldMicros: { decrement: h.amountMicros } } });
  });
}

/** Add credit (settled top-up, refund, staff adjustment). Idempotent on (refType, refId). */
export async function credit(db: Db, organizationId: string, micros: bigint, reason: 'TOPUP' | 'REFUND' | 'ADJUSTMENT', ref?: { type: string; id: string }, note?: string) {
  if (ref) {
    const dup = await db.creditLedger.findFirst({ where: { organizationId, reason, refType: ref.type, refId: ref.id } });
    if (dup) return dup;
  }
  await ensureAccount(db, organizationId);
  const row = await db.creditLedger.create({ data: { organizationId, deltaMicros: micros, reason, refType: ref?.type, refId: ref?.id, note } });
  await db.creditAccount.update({ where: { organizationId }, data: { balanceMicros: { increment: micros }, exhaustedNotifiedAt: null } });
  return row;
}

/** Quote a set of metered actions against the available balance (POST /billing/billable-usage/quote). */
export async function quote(organizationId: string, actions: { action: XAction; count?: number }[]) {
  const b = await balance(organizationId);
  const lines = actions.map(a => ({ action: a.action, count: a.count ?? 1, unitMicros: X_PRICES[a.action], totalMicros: X_PRICES[a.action] * (a.count ?? 1) }));
  const totalMicros = lines.reduce((n, l) => n + l.totalMicros, 0);
  return {
    billable: totalMicros > 0, lines, totalMicros, totalCents: Math.ceil(totalMicros / 10_000), currency: 'usd' as const,
    availableMicros: b.availableMicros, availableCents: b.availableCents, wouldExceedBalance: totalMicros > b.availableMicros,
  };
}
