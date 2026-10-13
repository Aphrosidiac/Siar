import { randomUUID } from 'node:crypto';
import type { BillingInterval, BillingProvider, PlanTier } from '../generated/prisma/enums.js';
import { audit, systemActor } from '../platform/audit.js';
import { appUrl, config } from '../platform/config.js';
import { prisma, type Db } from '../platform/db.js';
import { badRequest } from '../platform/errors.js';
import { notify } from '../platform/events.js';
import { logger } from '../platform/logger.js';
import { queueMail } from '../platform/mail.js';
import { credit } from '../domain/credits.js';
import { formatPrice, LINK_GRACE_DAYS, LINK_REMIND_DAYS, ONCE_METHODS, PLANS, priceOf, type Currency } from '../domain/plans.js';

/**
 * Billing core, shared by every provider (Stripe, CHIP, the local mock):
 *   prices      — PLANS carries a ringgit list (billing country MY) and a USD list (everywhere else);
 *                 a payment is charged in exactly that currency, never converted
 *   price lock  — a subscription renews at the price it started at (Subscription.unitAmountCents);
 *                 only a plan change takes the current list price
 *   settlement  — one function turns a paid checkout into a subscription / a top-up / a saved card,
 *                 whether the news came from a CHIP callback, a Stripe webhook, a mock "Pay" click or our cron
 *   renewals    — AUTO: a saved card (CHIP and mock: our cron, 3 attempts over 7 days, then FREE; Stripe
 *                 renews its own). LINK (FPX / DuitNow / GrabPay, yearly): reminders 7 days and 1 day
 *                 before the period ends, 3 days' grace after it, then FREE.
 *   invoices    — SIAR-YYYY-NNNNN, one row per paid period / top-up, receipt emailed
 *
 * BillingPayment.amountCents/currency is what is charged. X credit is always USD (creditCents).
 */

export type Tier = PlanTier;
export type Interval = BillingInterval;
export type Requested = 'STRIPE' | 'CHIP';

export const LIVE_STATUSES = ['trialing', 'active', 'past_due'];
export const RANK: Record<Tier, number> = { FREE: 0, STARTER: 1, PRO: 2, BUSINESS: 3, ENTERPRISE: 4 };
/** Retry gaps after a failed renewal: day 0, then +3 days, then +4 days (3 attempts over 7 days). */
export const RETRY_GAP_DAYS = [3, 4];
export const MAX_ATTEMPTS = 3;

/** List price of one period of a plan, in `currency` minor units. */
export function listPrice(tier: Tier, interval: Interval, currency: string) {
  const v = priceOf(tier, interval, currency as Currency);
  if (v === null) throw badRequest('Enterprise is priced per contract. Email hello@ffdev.studio and we will set it up for you.');
  return v;
}
/** X credit is USD; bought in ringgit it is charged at USD_MYR_RATE. */
export const usdToMyr = (usdCents: number) => Math.round(usdCents * config.USD_MYR_RATE);

export function addInterval(d: Date, interval: Interval, n = 1) {
  const months = (interval === 'YEARLY' ? 12 : 1) * n;
  const x = new Date(d);
  const day = x.getUTCDate();
  x.setUTCDate(1);
  x.setUTCMonth(x.getUTCMonth() + months);
  const last = new Date(Date.UTC(x.getUTCFullYear(), x.getUTCMonth() + 1, 0)).getUTCDate();
  x.setUTCDate(Math.min(day, last));
  return x;
}
export const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86400_000);

export function money(cents: number, currency: string) {
  const v = (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return currency.toLowerCase() === 'myr' ? `RM ${v}` : currency.toLowerCase() === 'usd' ? `$${v}` : `${currency.toUpperCase()} ${v}`;
}
const day = (d: Date) => d.toISOString().slice(0, 10);
const per = (i: Interval) => (i === 'YEARLY' ? 'year' : 'month');
export const planLabel = (tier: Tier, interval: Interval) => `Siar ${PLANS[tier].name} (${interval === 'YEARLY' ? 'yearly' : 'monthly'})`;

export const priceLabel = (minor: number, currency: string) => formatPrice(minor, currency as Currency);

const meta = (m: unknown): Record<string, any> => (m && typeof m === 'object' && !Array.isArray(m) ? { ...(m as object) } : {});

// ───────────────────────── invoices ─────────────────────────

/** Next SIAR-YYYY-NNNNN. Serialized per year by an advisory lock (callers run in a transaction). */
export async function nextInvoiceNumber(db: Db, at = new Date()) {
  const y = at.getUTCFullYear();
  await db.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${'siar-invoice-' + y}))`;
  const last = await db.billingInvoice.findFirst({ where: { number: { startsWith: `SIAR-${y}-` } }, orderBy: { number: 'desc' }, select: { number: true } });
  const n = last ? Number(last.number.slice(`SIAR-${y}-`.length)) + 1 : 1;
  return `SIAR-${y}-${String(n).padStart(5, '0')}`;
}

export async function billingEmail(db: Db, organizationId: string) {
  const o = await db.organization.findUnique({ where: { id: organizationId }, select: { billingEmail: true, members: { where: { role: 'OWNER' }, orderBy: { createdAt: 'asc' }, take: 1, select: { user: { select: { email: true } } } } } });
  return o?.billingEmail ?? o?.members[0]?.user.email ?? null;
}

export interface InvoiceLine { description: string; quantity: number; unitAmountCents: number; amountCents: number; periodStart?: string | null; periodEnd?: string | null }
export interface InvoiceIn {
  organizationId: string; provider: BillingProvider; providerInvoiceId: string; description: string; amountCents: number; currency: string;
  status: string; periodStart?: Date | null; periodEnd?: Date | null; paidAt?: Date | null; hostedUrl?: string | null; pdfUrl?: string | null;
  /** Defaults to one line for the whole amount. */
  lines?: InvoiceLine[]; paymentMethod?: string | null;
}

/** Who the organization is billed as, right now (snapshotted onto each invoice). */
export async function billTo(db: Db, organizationId: string) {
  const o = await db.organization.findUniqueOrThrow({ where: { id: organizationId }, select: { name: true, billingName: true, billingAddress: true, billingTaxId: true } });
  return { name: o.billingName || o.name, email: await billingEmail(db, organizationId), address: o.billingAddress ?? null, taxId: o.billingTaxId ?? null };
}

/** The issuer printed on every Siar invoice. */
export const ISSUER = { name: 'FF DEV STUDIO', registration: '202603234793', product: 'Siar', country: 'Malaysia', email: 'billing@siaran.my', website: 'siaran.my' };

/** Create or update the invoice for a provider document (idempotent on provider + providerInvoiceId). Emails a receipt when it becomes paid. */
export async function recordInvoice(db: Db, i: InvoiceIn) {
  const cur = await db.billingInvoice.findUnique({ where: { provider_providerInvoiceId: { provider: i.provider, providerInvoiceId: i.providerInvoiceId } } });
  let row;
  if (cur) {
    row = await db.billingInvoice.update({ where: { id: cur.id }, data: { status: i.status, amountCents: i.amountCents, paidAt: i.paidAt ?? cur.paidAt, hostedUrl: i.hostedUrl ?? cur.hostedUrl, pdfUrl: i.pdfUrl ?? cur.pdfUrl, ...(i.lines ? { lines: i.lines as object[] } : {}), paymentMethod: i.paymentMethod ?? cur.paymentMethod } });
  } else {
    row = await db.billingInvoice.create({
      data: {
        organizationId: i.organizationId, provider: i.provider, providerInvoiceId: i.providerInvoiceId, number: await nextInvoiceNumber(db), description: i.description,
        amountCents: i.amountCents, currency: i.currency.toLowerCase(), status: i.status, periodStart: i.periodStart ?? null, periodEnd: i.periodEnd ?? null,
        paidAt: i.paidAt ?? null, hostedUrl: i.hostedUrl ?? null, pdfUrl: i.pdfUrl ?? null, paymentMethod: i.paymentMethod ?? null,
        lines: (i.lines ?? [{ description: i.description, quantity: 1, unitAmountCents: i.amountCents, amountCents: i.amountCents, periodStart: i.periodStart?.toISOString() ?? null, periodEnd: i.periodEnd?.toISOString() ?? null }]) as object[],
        billTo: await billTo(db, i.organizationId),
      },
    });
  }
  if (i.status === 'paid' && cur?.status !== 'paid') {
    const to = await billingEmail(db, i.organizationId);
    if (to) {
      await queueMail(db, {
        to, subject: `Your Siar receipt ${row.number}`, kicker: 'Receipt', heading: `Thank you. ${money(row.amountCents, row.currency)} received.`,
        preheader: `Receipt ${row.number}: ${row.description}, ${money(row.amountCents, row.currency)}.`,
        paragraphs: ['Your payment went through. The invoice is below and always in Billing in the Siar dashboard.'],
        details: [
          ['Receipt', row.number],
          ['For', row.description],
          ['Amount', money(row.amountCents, row.currency)],
          ...(row.paidAt ? [['Paid on', day(row.paidAt)] as [string, string]] : []),
          ...(row.periodStart && row.periodEnd ? [['Period', `${day(row.periodStart)} to ${day(row.periodEnd)}`] as [string, string]] : []),
        ],
        reason: 'You received this receipt because this address is the billing contact for a Siar organization.',
        cta: { label: 'View invoice', url: appUrl(`/billing/invoices/${row.id}`) },
      });
    }
  }
  return row;
}

export const invoiceView = (r: any) => ({
  id: r.id, number: r.number, description: r.description, amountCents: r.amountCents, currency: r.currency, status: r.status, provider: r.provider,
  pdfUrl: r.pdfUrl, hostedUrl: r.hostedUrl, periodStart: r.periodStart?.toISOString() ?? null, periodEnd: r.periodEnd?.toISOString() ?? null,
  paidAt: r.paidAt?.toISOString() ?? null, paymentMethod: r.paymentMethod ?? null, createdAt: r.createdAt.toISOString(),
});

/** The full document: lines, who it was billed to and who issued it. */
export const invoiceDocument = (r: any) => {
  const lines = (Array.isArray(r.lines) && r.lines.length ? r.lines : [{ description: r.description, quantity: 1, unitAmountCents: r.amountCents, amountCents: r.amountCents, periodStart: r.periodStart?.toISOString() ?? null, periodEnd: r.periodEnd?.toISOString() ?? null }]) as InvoiceLine[];
  const subtotal = lines.reduce((n, l) => n + l.amountCents, 0);
  return { ...invoiceView(r), lines, subtotalCents: subtotal, totalCents: r.amountCents, amountPaidCents: r.status === 'paid' ? r.amountCents : 0, amountDueCents: r.status === 'paid' || r.status === 'void' ? 0 : r.amountCents, billTo: r.billTo ?? null, issuer: ISSUER };
};

// ───────────────────────── subscription view ─────────────────────────

export async function subscriptionView(organizationId: string, db: Db = prisma) {
  const org = await db.organization.findUniqueOrThrow({ where: { id: organizationId }, include: { subscription: true } });
  const s = org.subscription;
  const m = meta(s?.metadata);
  return {
    plan: org.tier, interval: s?.billingInterval ?? null, status: s?.status ?? null, provider: s?.provider ?? null,
    currentPeriodEnd: s?.currentPeriodEnd?.toISOString() ?? null, trialEndsAt: (s?.status === 'trialing' ? s.trialEnd : org.trialEndsAt)?.toISOString() ?? null,
    cancelAtPeriodEnd: s?.cancelAtPeriodEnd ?? false, currency: s?.currency ?? (org.billingCountry && org.billingCountry !== 'MY' ? 'usd' : 'myr'),
    // Siar extensions
    amountCents: s?.unitAmountCents ?? 0,
    /** AUTO = a saved card renews it; LINK = paid once per period, renewed from a link before currentPeriodEnd. */
    renewal: s?.renewal ?? null,
    /** The price is locked: renewals charge amountCents whatever the list price becomes. */
    priceLocked: !!s && LIVE_STATUSES.includes(s.status),
    pendingPlan: m.pendingChange?.tier ?? null, pendingInterval: m.pendingChange?.interval ?? null,
    requestedProvider: m.requestedProvider ?? s?.provider ?? null,
    failedAttempts: s?.failedAttempts ?? 0, nextRetryAt: s && s.status === 'past_due' ? s.nextRetryAt?.toISOString() ?? null : null,
    canceledAt: s?.canceledAt?.toISOString() ?? null,
  };
}

/** Has this organization ever paid for (or trialled) a plan? A trial is only for the first paid plan. */
export async function hadPaidPlan(db: Db, organizationId: string) {
  const org = await db.organization.findUniqueOrThrow({ where: { id: organizationId }, select: { trialEndsAt: true, subscription: { select: { id: true } } } });
  if (org.trialEndsAt || org.subscription) return true;
  return (await db.billingPayment.count({ where: { organizationId, purpose: 'SUBSCRIPTION', status: 'PAID', tier: { not: null } } })) > 0;
}

// ───────────────────────── settlement ─────────────────────────

export interface Settlement {
  /** What the provider charged (CHIP: MYR sen from the purchase). Defaults to the payment's price in its charge currency. */
  charged?: { amount: number; currency: string };
  /** CHIP / mock saved-card token (subscriptions, card changes). */
  token?: string | null;
  /** Free-text origin for logs: 'mock', 'chip-callback', 'stripe-webhook', 'renewal'. */
  via: string;
  /** Issuing country of the card that paid (ISO alpha-2), when the provider reports one. */
  cardCountry?: string | null;
}

/** Retire a saved card at the provider. Set by billing.ts (CHIP live deletes the token; mock has nothing to do). */
export const hooks = { deleteToken: async (_provider: BillingProvider, _token: string) => {} };

/**
 * A checkout was paid. Exactly once per payment (PENDING|FAILED|CANCELED → PAID claim); every
 * provider ends here, so a mock "Pay" click, a CHIP callback and a renewal charge settle the same way.
 */
export async function settlePayment(paymentId: string, s: Settlement): Promise<'settled' | 'already' | 'missing'> {
  const oldTokens: { provider: BillingProvider; token: string }[] = [];
  const out = await prisma.$transaction(async tx => {
    const p = await tx.billingPayment.findUnique({ where: { id: paymentId } });
    if (!p) return 'missing' as const;
    const claimed = await tx.billingPayment.updateMany({ where: { id: p.id, status: { in: ['PENDING', 'FAILED', 'CANCELED'] } }, data: { status: 'PAID', settledAt: new Date() } });
    if (!claimed.count) return 'already' as const;
    const actor = systemActor(p.organizationId);
    const currency = s.charged?.currency.toLowerCase() ?? p.currency;
    const amount = s.charged?.amount ?? p.amountCents;
    const ref = p.providerRef ?? p.id;
    const cardCountry = s.cardCountry?.toUpperCase() ?? null;
    if (cardCountry) {
      await tx.billingPayment.update({ where: { id: p.id }, data: { cardCountry } });
      // Ringgit prices are for organizations billed in Malaysia: a foreign card is recorded, never refused.
      if (currency === 'myr' && cardCountry !== 'MY') await audit(tx, actor, 'billing.cardCountry', 'BillingPayment', p.id, `A ringgit payment of ${money(amount, currency)} was made with a card issued in ${cardCountry}`, { via: s.via });
    }

    if (p.purpose === 'CREDIT_TOPUP') {
      const usd = p.creditCents ?? p.amountCents;
      await credit(tx, p.organizationId, BigInt(usd) * 10_000n, 'TOPUP', { type: `${p.provider.toLowerCase()}_payment`, id: ref }, `Top-up ${money(usd, 'usd')}`);
      await recordInvoice(tx, { organizationId: p.organizationId, provider: p.provider, providerInvoiceId: ref, description: `X credit top-up (${money(usd, 'usd')})`, amountCents: amount, currency, status: 'paid', paidAt: new Date() });
      await audit(tx, actor, 'credit.topUp', 'CreditAccount', p.organizationId, `Added ${money(usd, 'usd')} of X credit${currency === 'myr' ? ` for ${money(amount, currency)}` : ''}`, { paymentId: p.id, via: s.via });
      return 'settled' as const;
    }

    const sub = await tx.subscription.findUnique({ where: { organizationId: p.organizationId } });

    // A saved-card change (tier null). If a renewal is behind, it is retried right away.
    if (!p.tier || !p.billingInterval) {
      if (!sub || !s.token) return 'settled' as const;
      if (sub.providerPaymentToken && sub.providerPaymentToken !== s.token) oldTokens.push({ provider: sub.provider, token: sub.providerPaymentToken });
      await tx.subscription.update({ where: { id: sub.id }, data: { providerPaymentToken: s.token, ...(sub.status === 'past_due' ? { nextRetryAt: new Date() } : {}) } });
      await audit(tx, actor, 'subscription.card', 'Subscription', sub.id, 'Card on file changed', { via: s.via });
      return 'settled' as const;
    }

    // A Stripe card subscription runs itself; its webhook events (subscription.*, invoice.paid) carry the state.
    // Link-renewed plans paid through Stripe (FPX, GrabPay, a one-off card payment) settle here like CHIP.
    if (p.provider === 'STRIPE' && p.renewal === 'AUTO') return 'settled' as const;

    const tier = p.tier;
    const interval = p.billingInterval;
    const now = new Date();
    // A link-renewed plan may be renewed through another provider (Stripe FPX now, CHIP later): it is still the same plan.
    const live = !!sub && LIVE_STATUSES.includes(sub.status) && (sub.provider === p.provider || (sub.renewal === 'LINK' && p.renewal === 'LINK'));
    // Started at/after the period end = paying for the next period (renewal, or a past-due catch-up).
    const renewal = live && !!sub!.currentPeriodEnd && (p.isRenewal || p.createdAt >= sub!.currentPeriodEnd);
    const trial = p.amountCents === 0 && !p.isRenewal;
    const start = renewal ? sub!.currentPeriodEnd! : now;
    const end = trial ? addDays(now, config.TRIAL_DAYS) : addInterval(start, interval);
    const m = meta(sub?.metadata);
    delete m.pendingChange;
    delete m.mockDeclines;
    if (p.providerRef?.startsWith('mock_')) m.requestedProvider = p.providerRef.startsWith('mock_chip_') ? 'CHIP' : 'STRIPE';
    if (s.token && sub?.providerPaymentToken && sub.providerPaymentToken !== s.token) oldTokens.push({ provider: sub.provider, token: sub.providerPaymentToken });
    // Price lock: renewing the same plan keeps its price; a new or changed plan takes today's list price.
    const samePlan = renewal && sub!.tier === tier && sub!.billingInterval === interval && sub!.currency === p.currency;
    const unit = samePlan ? sub!.unitAmountCents : listPrice(tier, interval, p.currency);
    if (m.reminded) delete m.reminded;
    const data = {
      provider: p.provider, status: trial ? 'trialing' : 'active', tier, billingInterval: interval, currency: p.currency, renewal: p.renewal,
      unitAmountCents: unit, currentPeriodStart: start, currentPeriodEnd: end,
      trialEnd: trial ? end : sub?.trialEnd ?? null, cancelAtPeriodEnd: false, canceledAt: null, failedAttempts: 0, nextRetryAt: null,
      providerPaymentToken: p.renewal === 'LINK' ? null : s.token ?? sub?.providerPaymentToken ?? null, metadata: m,
    };
    const row = sub
      ? await tx.subscription.update({ where: { id: sub.id }, data })
      : await tx.subscription.create({ data: { ...data, organizationId: p.organizationId, providerSubscriptionId: `siar_sub_${randomUUID().replace(/-/g, '')}` } });
    await tx.organization.update({ where: { id: p.organizationId }, data: { tier, ...(trial ? { trialEndsAt: end } : {}) } });
    await recordInvoice(tx, {
      organizationId: p.organizationId, provider: p.provider, providerInvoiceId: ref, amountCents: amount, currency, status: 'paid', paidAt: now,
      description: trial ? `${planLabel(tier, interval)}: ${config.TRIAL_DAYS}-day trial` : `${planLabel(tier, interval)}${renewal ? ' renewal' : ''}`,
      periodStart: trial ? now : start, periodEnd: end,
    });
    const what = trial ? `Started a ${config.TRIAL_DAYS}-day ${PLANS[tier].name} trial` : renewal ? `Renewed ${PLANS[tier].name} (${per(interval)}ly) for ${money(amount, currency)}` : `Subscribed to ${PLANS[tier].name} (${per(interval)}ly) for ${money(amount, currency)}`;
    await audit(tx, actor, renewal ? 'subscription.renew' : 'subscription.start', 'Subscription', row.id, what, { paymentId: p.id, via: s.via });
    if (sub?.status === 'past_due') await notify(tx, p.organizationId, { kind: 'billing', title: 'Payment received', body: `${PLANS[tier].name} is paid up again.`, link: '/billing' }, ['OWNER']);
    return 'settled' as const;
  });
  for (const t of oldTokens) await hooks.deleteToken(t.provider, t.token).catch(err => logger.warn({ err }, 'old card token delete failed'));
  return out;
}

/** A checkout the payer declined or abandoned. */
export async function failPayment(paymentId: string, reason: string, via: string) {
  return prisma.$transaction(async tx => {
    const p = await tx.billingPayment.findUnique({ where: { id: paymentId } });
    if (!p) return false;
    const r = await tx.billingPayment.updateMany({ where: { id: p.id, status: 'PENDING' }, data: { status: 'FAILED', settledAt: new Date() } });
    if (r.count) await audit(tx, systemActor(p.organizationId), 'billing.payment.failed', 'BillingPayment', p.id, `Payment of ${money(p.amountCents, p.currency)} did not go through: ${reason}`, { via });
    return r.count > 0;
  });
}

// ───────────────────────── renewals (CHIP + mock) ─────────────────────────

export type ChargeOutcome = { status: 'paid'; charged?: { amount: number; currency: string } } | { status: 'pending' } | { status: 'failed'; reason: string; tokenInvalid: boolean };
/** Charges a saved card for a renewal payment. Set by billing.ts per provider. Must set payment.providerRef before charging. */
export const renewalCharger: { charge: (sub: any, payment: any) => Promise<ChargeOutcome> } = { charge: async () => ({ status: 'failed', reason: 'No charger configured.', tokenInvalid: false }) };

const dueWhere = (now: Date) => ({
  provider: { in: ['CHIP', 'MOCK'] as BillingProvider[] }, renewal: 'AUTO' as const, status: { in: LIVE_STATUSES },
  OR: [{ nextRetryAt: null, currentPeriodEnd: { lte: now } }, { nextRetryAt: { lte: now } }],
});

/** The cron (JOBS.billingRenewals, hourly): saved-card renewals that are due, then the link-renewal cycle. */
export async function runRenewals() {
  const due = await prisma.subscription.findMany({ where: dueWhere(new Date()), select: { id: true } });
  const out: Record<string, number> = {};
  for (const s of due) {
    try { const r = await renewOne(s.id); out[r] = (out[r] ?? 0) + 1; }
    catch (err) { logger.error({ err, subscriptionId: s.id }, 'renewal failed'); out.error = (out.error ?? 0) + 1; }
  }
  const links = await prisma.subscription.findMany({ where: { renewal: 'LINK', status: { in: LIVE_STATUSES } }, select: { id: true } });
  for (const s of links) {
    try { const r = await linkCycle(s.id); if (r !== 'idle') out[`link-${r}`] = (out[`link-${r}`] ?? 0) + 1; }
    catch (err) { logger.error({ err, subscriptionId: s.id }, 'link renewal step failed'); out.error = (out.error ?? 0) + 1; }
  }
  return out;
}


/**
 * One step of a link-renewed (FPX / DuitNow / GrabPay) subscription: remind before the period ends,
 * open a grace period when it ends unpaid, and move to Free when the grace runs out.
 * Paying the renewal link (billing.checkout on the same plan) settles the next period early.
 */
export async function linkCycle(subId: string, now = new Date()): Promise<'idle' | 'reminded' | 'grace' | 'ended'> {
  const sub = await prisma.subscription.findUniqueOrThrow({ where: { id: subId } });
  if (sub.renewal !== 'LINK' || !LIVE_STATUSES.includes(sub.status) || !sub.currentPeriodEnd) return 'idle';
  const end = sub.currentPeriodEnd;
  const m = meta(sub.metadata);
  const plan = PLANS[sub.tier].name;
  const pendingTier = m.pendingChange?.tier as Tier | undefined;
  if (end <= now) {
    if (sub.cancelAtPeriodEnd || pendingTier === 'FREE') { await endSubscription(sub.id, 'ended at the period end'); return 'ended'; }
    if (sub.status === 'past_due') {
      if (sub.nextRetryAt && sub.nextRetryAt <= now) { await endSubscription(sub.id, `was not renewed within ${LINK_GRACE_DAYS} days of ending`); return 'ended'; }
      return 'idle';
    }
    const graceEnd = addDays(end, LINK_GRACE_DAYS);
    await prisma.$transaction(async tx => {
      await tx.subscription.update({ where: { id: sub.id }, data: { status: 'past_due', nextRetryAt: graceEnd } });
      await audit(tx, systemActor(sub.organizationId), 'subscription.grace', 'Subscription', sub.id, `${plan} reached its renewal date unpaid; ${LINK_GRACE_DAYS} days' grace until ${day(graceEnd)}`);
      await notify(tx, sub.organizationId, { kind: 'billing', title: `Renew ${plan} by ${day(graceEnd)}`, body: `Your ${plan} plan reached its renewal date. Renew by ${day(graceEnd)} to keep it; after that the organization moves to Free.`, link: '/billing' }, ['OWNER', 'ADMIN']);
      const to = await billingEmail(tx, sub.organizationId);
      if (to) await queueMail(tx, { to, subject: `Renew your Siar ${plan} plan by ${day(graceEnd)}`, kicker: 'Action needed', alert: true, details: [['Plan', plan], ['Amount', money(sub.unitAmountCents, sub.currency)], ['Renew by', day(graceEnd)]], reason: 'You received this email because this address is the billing contact for a Siar organization.', heading: `Your ${plan} plan is due`, paragraphs: [`Your ${plan} plan reached its renewal date on ${day(end)}. It keeps running until ${day(graceEnd)}.`, `Renew by then with ${ONCE_METHODS} or a card, at the same price. Otherwise the organization moves to Free; nothing is deleted.`], cta: { label: 'Renew now', url: appUrl('/billing?renew=1') } });
    });
    return 'grace';
  }
  const daysLeft = (end.getTime() - now.getTime()) / 86400_000;
  const reminded: string[] = Array.isArray(m.reminded) ? m.reminded : [];
  const due = LINK_REMIND_DAYS.filter(d => daysLeft <= d && !reminded.includes(`${day(end)}:${d}`));
  if (!due.length || sub.cancelAtPeriodEnd || pendingTier === 'FREE') return 'idle';
  const tier = (pendingTier ?? sub.tier) as Tier;
  const interval = (m.pendingChange?.interval ?? sub.billingInterval) as Interval;
  const amount = tier === sub.tier && interval === sub.billingInterval ? sub.unitAmountCents : listPrice(tier, interval, sub.currency);
  await prisma.$transaction(async tx => {
    await tx.subscription.update({ where: { id: sub.id }, data: { metadata: { ...m, reminded: [...reminded, ...due.map(d => `${day(end)}:${d}`)] } } });
    const to = await billingEmail(tx, sub.organizationId);
    const left = Math.max(1, Math.ceil(daysLeft));
    await notify(tx, sub.organizationId, { kind: 'billing', title: `${PLANS[tier].name} renews on ${day(end)}`, body: `Renew for ${money(amount, sub.currency)} with ${ONCE_METHODS} or a card before ${day(end)}.`, link: '/billing' }, ['OWNER']);
    if (to) await queueMail(tx, { to, subject: `Your Siar ${PLANS[tier].name} plan renews in ${left} ${left === 1 ? 'day' : 'days'}`, kicker: 'Billing', details: [['Plan', `${PLANS[tier].name} (${per(interval)}ly)`], ['Amount', money(amount, sub.currency)], ['Renew by', day(end)]], reason: 'You received this email because this address is the billing contact for a Siar organization.', heading: `Time to renew ${PLANS[tier].name}`, paragraphs: [`Your plan was paid once, so it does not renew by itself. Renew before ${day(end)} with ${ONCE_METHODS} or a card.`, 'Your price is locked while you stay subscribed.'], cta: { label: 'Renew now', url: appUrl('/billing?renew=1') } });
  });
  return 'reminded';
}

export async function renewOne(subId: string): Promise<'skipped' | 'ended' | 'paid' | 'pending' | 'failed' | 'downgraded'> {
  const now = new Date();
  // Lease: a second runner (or a slow charge) cannot charge the same period twice.
  const claimed = await prisma.subscription.updateMany({ where: { id: subId, ...dueWhere(now) }, data: { nextRetryAt: addDays(now, 1 / 144) } });
  if (!claimed.count) return 'skipped';
  const sub = await prisma.subscription.findUniqueOrThrow({ where: { id: subId } });
  if (sub.cancelAtPeriodEnd) {
    await endSubscription(sub.id, 'ended at the period end');
    return 'ended';
  }
  const m = meta(sub.metadata);
  const tier = (m.pendingChange?.tier ?? sub.tier) as Tier;
  const interval = (m.pendingChange?.interval ?? sub.billingInterval) as Interval;
  if (tier === 'FREE') { await endSubscription(sub.id, 'moved to Free at the period end'); return 'ended'; }
  // Price lock: the same plan renews at its own price; a scheduled change takes the new plan's list price.
  const amount = tier === sub.tier && interval === sub.billingInterval ? sub.unitAmountCents : listPrice(tier, interval, sub.currency);
  const payment = await prisma.billingPayment.create({ data: { organizationId: sub.organizationId, provider: sub.provider, purpose: 'SUBSCRIPTION', amountCents: amount, currency: sub.currency, tier, billingInterval: interval } });
  let r: ChargeOutcome;
  try {
    r = sub.providerPaymentToken ? await renewalCharger.charge(sub, payment) : { status: 'failed', reason: 'There is no card on file.', tokenInvalid: true };
  } catch (err) {
    r = { status: 'failed', reason: (err as Error).message || 'The payment provider could not be reached.', tokenInvalid: false };
  }
  if (r.status === 'paid') { await settlePayment(payment.id, { charged: r.charged, via: 'renewal' }); return 'paid'; }
  if (r.status === 'pending') { await prisma.subscription.update({ where: { id: sub.id }, data: { nextRetryAt: addDays(now, 1) } }); return 'pending'; }
  return chargeFailed(sub.id, payment.id, r.reason, r.tokenInvalid);
}

async function chargeFailed(subId: string, paymentId: string, reason: string, tokenInvalid: boolean) {
  return prisma.$transaction(async tx => {
    await tx.billingPayment.updateMany({ where: { id: paymentId, status: 'PENDING' }, data: { status: 'FAILED', settledAt: new Date() } });
    const sub = await tx.subscription.findUniqueOrThrow({ where: { id: subId } });
    const payment = await tx.billingPayment.findUniqueOrThrow({ where: { id: paymentId } });
    const attempts = sub.failedAttempts + 1;
    const actor = systemActor(sub.organizationId);
    const to = await billingEmail(tx, sub.organizationId);
    const amount = money(payment.amountCents, payment.currency);
    const plan = PLANS[sub.tier].name;
    if (attempts >= MAX_ATTEMPTS) {
      await tx.subscription.update({ where: { id: subId }, data: { status: 'canceled', canceledAt: new Date(), failedAttempts: attempts, nextRetryAt: null, cancelAtPeriodEnd: false } });
      await tx.organization.update({ where: { id: sub.organizationId }, data: { tier: 'FREE' } });
      await audit(tx, actor, 'subscription.downgrade', 'Subscription', subId, `Moved to Free after ${attempts} failed payments (${reason})`, { paymentId });
      await notify(tx, sub.organizationId, { kind: 'billing', title: `Your ${plan} plan was moved to Free`, body: `We could not charge ${amount} after ${attempts} attempts. Nothing was deleted; choose a plan again to restore your limits.`, link: '/billing' }, ['OWNER', 'ADMIN']);
      if (to) await queueMail(tx, { to, subject: `Your Siar ${plan} plan was moved to Free`, kicker: 'Billing', alert: true, details: [['Plan', `${plan} → Free`], ['Amount due', amount], ['Attempts', String(attempts)]], reason: 'You received this email because this address is the billing contact for a Siar organization.', heading: `Your ${plan} plan was moved to Free`, paragraphs: [`We tried to charge ${amount} for ${plan} ${attempts} times and the payment did not go through (${reason}).`, 'Your organization is now on the Free plan. Nothing was deleted: teams over the Free limit stay, but new teams cannot be created until you choose a paid plan again.'], cta: { label: 'Choose a plan', url: appUrl('/billing') } });
      return 'downgraded' as const;
    }
    const next = addDays(new Date(), RETRY_GAP_DAYS[attempts - 1] ?? RETRY_GAP_DAYS[RETRY_GAP_DAYS.length - 1]);
    await tx.subscription.update({ where: { id: subId }, data: { status: 'past_due', failedAttempts: attempts, nextRetryAt: next, ...(tokenInvalid ? { providerPaymentToken: null } : {}) } });
    await audit(tx, actor, 'subscription.chargeFailed', 'Subscription', subId, `Renewal charge of ${amount} failed (${reason}), attempt ${attempts} of ${MAX_ATTEMPTS}; retrying ${day(next)}`, { paymentId });
    await notify(tx, sub.organizationId, { kind: 'billing', title: 'Payment failed', body: `We could not charge ${amount} for ${plan} (${reason}). We will try again on ${day(next)}. Update your card to keep your plan.`, link: '/billing' }, ['OWNER', 'ADMIN']);
    if (to) await queueMail(tx, { to, subject: 'Action needed: your Siar payment did not go through', kicker: 'Action needed', alert: true, details: [['Plan', plan], ['Amount', amount], ['Next try', day(next)]], reason: 'You received this email because this address is the billing contact for a Siar organization.', heading: 'Your payment did not go through', paragraphs: [`We could not charge ${amount} for your ${plan} plan (${reason}).`, `We will try again on ${day(next)}. After ${MAX_ATTEMPTS} failed attempts the organization moves to the Free plan. Updating your card now retries right away.`], cta: { label: 'Update card', url: appUrl('/billing') } });
    return 'failed' as const;
  });
}

/** Close a CHIP/mock subscription (cancel at period end reached, or moved to Free). */
export async function endSubscription(subId: string, why: string) {
  const sub = await prisma.subscription.findUniqueOrThrow({ where: { id: subId } });
  await prisma.$transaction(async tx => {
    const m = meta(sub.metadata);
    delete m.pendingChange;
    await tx.subscription.update({ where: { id: subId }, data: { status: 'canceled', canceledAt: new Date(), nextRetryAt: null, providerPaymentToken: null, metadata: m } });
    await tx.organization.update({ where: { id: sub.organizationId }, data: { tier: 'FREE' } });
    await audit(tx, systemActor(sub.organizationId), 'subscription.end', 'Subscription', subId, `${PLANS[sub.tier].name} ${why}; now on Free`);
    const to = await billingEmail(tx, sub.organizationId);
    if (to) await queueMail(tx, { to, subject: `Your Siar ${PLANS[sub.tier].name} plan has ended`, kicker: 'Billing', reason: 'You received this email because this address is the billing contact for a Siar organization.', heading: `Your ${PLANS[sub.tier].name} plan has ended`, paragraphs: ['Your organization is now on the Free plan. Nothing was deleted; choose a plan any time to restore your limits.'], cta: { label: 'View plans', url: appUrl('/billing') } });
  });
  if (sub.providerPaymentToken) await hooks.deleteToken(sub.provider, sub.providerPaymentToken).catch(err => logger.warn({ err }, 'card token delete failed'));
}
