import Stripe from 'stripe';
import { audit, systemActor } from '../platform/audit.js';
import { config } from '../platform/config.js';
import { prisma, type Db } from '../platform/db.js';
import { badRequest, unavailable } from '../platform/errors.js';
import { notify } from '../platform/events.js';
import { logger } from '../platform/logger.js';
import { queueMail } from '../platform/mail.js';
import { PLANS } from '../domain/plans.js';
import { appUrl } from '../platform/config.js';
import { billingEmail, failPayment, LIVE_STATUSES, money, recordInvoice, settlePayment, usdCents, type Interval, type Tier } from './billing-core.js';

/**
 * Stripe (BILLING_MODE=live + STRIPE_SECRET_KEY). Stripe owns the subscription lifecycle (trial,
 * renewals, retries); Siar mirrors it from webhook events into Subscription / Organization.tier /
 * BillingInvoice. Prices are created once per plan+interval+amount and found again by lookup_key,
 * so changing PLANS makes new prices without touching existing subscribers.
 */

let client: Stripe | null = null;
export function stripe() {
  if (!config.STRIPE_SECRET_KEY) throw unavailable('Card payments through Stripe are not configured on this server (STRIPE_SECRET_KEY).');
  return (client ??= new Stripe(config.STRIPE_SECRET_KEY, { maxNetworkRetries: 2, appInfo: { name: 'Siar' } }));
}

/** Verify and parse a webhook delivery (raw body + Stripe-Signature). Pure: no API call. */
export function constructEvent(raw: Buffer | string, signature: string, secret = config.STRIPE_WEBHOOK_SECRET): Stripe.Event {
  return Stripe.webhooks.constructEvent(raw, signature, secret);
}

export const lookupKey = (tier: Tier, interval: Interval) => `siar_${tier.toLowerCase()}_${interval.toLowerCase()}_${usdCents(tier, interval)}`;

/** siar_pro_monthly_10000 → { tier: PRO, interval: MONTHLY }. Falls back to price metadata. */
export function planOfPrice(price: { lookup_key?: string | null; metadata?: Record<string, string> | null } | null | undefined): { tier: Tier; interval: Interval } | null {
  const m = /^siar_(pro|business|enterprise)_(monthly|yearly)(_\d+)?$/.exec(price?.lookup_key ?? '');
  if (m) return { tier: m[1].toUpperCase() as Tier, interval: m[2].toUpperCase() as Interval };
  const t = price?.metadata?.tier, i = price?.metadata?.interval;
  if (t && t in PLANS && (i === 'MONTHLY' || i === 'YEARLY')) return { tier: t as Tier, interval: i };
  return null;
}

const priceCache = new Map<string, string>();
export async function priceId(tier: Tier, interval: Interval) {
  const key = lookupKey(tier, interval);
  const hit = priceCache.get(key);
  if (hit) return hit;
  const found = await stripe().prices.list({ lookup_keys: [key], active: true, limit: 1 });
  const id = found.data[0]?.id ?? (await stripe().prices.create({
    currency: 'usd', unit_amount: usdCents(tier, interval), recurring: { interval: interval === 'YEARLY' ? 'year' : 'month' }, lookup_key: key,
    product_data: { name: `Siar ${PLANS[tier].name}`, metadata: { tier } }, metadata: { tier, interval },
  }, { idempotencyKey: `price-${key}` })).id;
  priceCache.set(key, id);
  return id;
}

export async function ensureCustomer(organizationId: string) {
  const org = await prisma.organization.findUniqueOrThrow({ where: { id: organizationId } });
  if (org.stripeCustomerId) return org.stripeCustomerId;
  const email = await billingEmail(prisma, organizationId);
  const c = await stripe().customers.create({ name: org.name ?? undefined, email: email ?? undefined, metadata: { organizationId } }, { idempotencyKey: `customer-${organizationId}` });
  await prisma.organization.update({ where: { id: organizationId }, data: { stripeCustomerId: c.id } });
  return c.id;
}

export async function checkoutSubscription(o: { organizationId: string; paymentId: string; tier: Tier; interval: Interval; trial: boolean; coupon?: string | null }) {
  const s = stripe();
  let discounts: Stripe.Checkout.SessionCreateParams.Discount[] | undefined;
  if (o.coupon) {
    const pc = await s.promotionCodes.list({ code: o.coupon, active: true, limit: 1 });
    if (!pc.data[0]) throw badRequest(`The code "${o.coupon}" is not valid or has expired.`, [{ code: 'invalid', message: 'Unknown promotion code', path: ['coupon'] }]);
    discounts = [{ promotion_code: pc.data[0].id }];
  }
  const meta = { organizationId: o.organizationId, paymentId: o.paymentId, purpose: 'SUBSCRIPTION', tier: o.tier, interval: o.interval };
  const session = await s.checkout.sessions.create({
    mode: 'subscription', customer: await ensureCustomer(o.organizationId), client_reference_id: o.organizationId,
    line_items: [{ price: await priceId(o.tier, o.interval), quantity: 1 }],
    subscription_data: { metadata: { organizationId: o.organizationId, tier: o.tier, interval: o.interval }, ...(o.trial ? { trial_period_days: config.TRIAL_DAYS } : {}) },
    metadata: meta, ...(discounts ? { discounts } : { allow_promotion_codes: true }),
    success_url: appUrl('/billing?checkout=success'), cancel_url: appUrl('/billing?checkout=canceled'),
  }, { idempotencyKey: `checkout-${o.paymentId}` });
  return { url: session.url!, ref: session.id };
}

export async function checkoutTopUp(o: { organizationId: string; paymentId: string; amountUsd: number }) {
  const meta = { organizationId: o.organizationId, paymentId: o.paymentId, purpose: 'CREDIT_TOPUP' };
  const session = await stripe().checkout.sessions.create({
    mode: 'payment', customer: await ensureCustomer(o.organizationId), client_reference_id: o.organizationId,
    line_items: [{ price_data: { currency: 'usd', unit_amount: o.amountUsd * 100, product_data: { name: 'Siar X credit', description: 'Prepaid balance for X (Twitter) pass-through charges' } }, quantity: 1 }],
    metadata: meta, payment_intent_data: { metadata: meta },
    success_url: appUrl('/billing?tab=credits&topup=success'), cancel_url: appUrl('/billing?tab=credits&topup=canceled'),
  }, { idempotencyKey: `topup-${o.paymentId}` });
  return { url: session.url!, ref: session.id };
}

export async function portalUrl(organizationId: string) {
  const s = await stripe().billingPortal.sessions.create({ customer: await ensureCustomer(organizationId), return_url: appUrl('/billing') });
  return s.url;
}

async function releaseSchedule(sub: Stripe.Subscription) {
  if (!sub.schedule) return;
  const id = typeof sub.schedule === 'string' ? sub.schedule : sub.schedule.id;
  await stripe().subscriptionSchedules.release(id).catch(err => logger.warn({ err, id }, 'schedule release failed'));
}

/** Upgrade now (prorated, invoiced immediately) or downgrade at the period end (subscription schedule). */
export async function changePlan(subscriptionId: string, tier: Tier, interval: Interval, when: 'now' | 'period_end') {
  const s = stripe();
  const cur = await s.subscriptions.retrieve(subscriptionId);
  const item = cur.items.data[0];
  const price = await priceId(tier, interval);
  if (when === 'now') {
    await releaseSchedule(cur);
    const updated = await s.subscriptions.update(cur.id, {
      items: [{ id: item.id, price }], proration_behavior: 'always_invoice', payment_behavior: 'error_if_incomplete', cancel_at_period_end: false,
      metadata: { ...cur.metadata, tier, interval },
    });
    await syncSubscription(updated);
    return updated;
  }
  const schedule = cur.schedule
    ? await s.subscriptionSchedules.retrieve(typeof cur.schedule === 'string' ? cur.schedule : cur.schedule.id)
    : await s.subscriptionSchedules.create({ from_subscription: cur.id });
  const phase = schedule.current_phase ?? { start_date: item.current_period_start, end_date: item.current_period_end };
  await s.subscriptionSchedules.update(schedule.id, {
    end_behavior: 'release',
    phases: [
      { items: [{ price: item.price.id, quantity: 1 }], start_date: phase.start_date, end_date: phase.end_date },
      { items: [{ price, quantity: 1 }], duration: { interval: interval === 'YEARLY' ? 'year' : 'month', interval_count: 1 }, metadata: { tier, interval } },
    ],
  });
  return cur;
}

export async function setCancelAtPeriodEnd(subscriptionId: string, cancel: boolean) {
  const s = stripe();
  const cur = await s.subscriptions.retrieve(subscriptionId);
  await releaseSchedule(cur);
  const updated = await s.subscriptions.update(subscriptionId, { cancel_at_period_end: cancel });
  await syncSubscription(updated);
  return updated;
}

// ───────────────────────── webhook events ─────────────────────────

const idOf = (x: string | { id: string } | null | undefined) => (typeof x === 'string' ? x : x?.id ?? null);
const ts = (n: number | null | undefined) => (n ? new Date(n * 1000) : null);

async function orgFor(db: Db, customer: string | null, metaOrg?: string | null) {
  if (metaOrg) {
    const o = await db.organization.findUnique({ where: { id: metaOrg }, select: { id: true, stripeCustomerId: true } });
    if (o) {
      if (customer && !o.stripeCustomerId) await db.organization.update({ where: { id: o.id }, data: { stripeCustomerId: customer } }).catch(() => undefined);
      return o.id;
    }
  }
  if (!customer) return null;
  return (await db.organization.findUnique({ where: { stripeCustomerId: customer }, select: { id: true } }))?.id ?? null;
}

/** Mirror a Stripe subscription into Subscription + Organization.tier. */
export async function syncSubscription(s: Stripe.Subscription, deleted = false) {
  return prisma.$transaction(async tx => {
    const orgId = await orgFor(tx, idOf(s.customer as any), s.metadata?.organizationId);
    if (!orgId) { logger.warn({ subscription: s.id }, 'stripe subscription for an unknown organization'); return null; }
    const item = s.items?.data?.[0];
    const plan = planOfPrice(item?.price) ?? (s.metadata?.tier ? { tier: s.metadata.tier as Tier, interval: (s.metadata.interval as Interval) ?? 'MONTHLY' } : null);
    if (!plan) { logger.warn({ subscription: s.id }, 'stripe subscription with an unknown price'); return null; }
    const status = deleted ? 'canceled' : s.status;
    const existing = await tx.subscription.findUnique({ where: { organizationId: orgId } });
    // A late event about an older subscription must not overwrite the one in use.
    if (existing && existing.providerSubscriptionId !== s.id && LIVE_STATUSES.includes(existing.status) && !LIVE_STATUSES.includes(status)) return existing;
    const meta: Record<string, any> = { ...((existing?.metadata as object) ?? {}), priceId: item?.price?.id };
    if (meta.pendingChange && meta.pendingChange.tier === plan.tier && meta.pendingChange.interval === plan.interval) delete meta.pendingChange;
    const data = {
      provider: 'STRIPE' as const, providerSubscriptionId: s.id, providerCustomerId: idOf(s.customer as any), status, tier: plan.tier, billingInterval: plan.interval,
      currency: s.currency ?? 'usd', unitAmountCents: item?.price?.unit_amount ?? usdCents(plan.tier, plan.interval),
      currentPeriodStart: ts(item?.current_period_start ?? (s as any).current_period_start), currentPeriodEnd: ts(item?.current_period_end ?? (s as any).current_period_end),
      trialEnd: ts(s.trial_end), cancelAtPeriodEnd: !!s.cancel_at_period_end || !!s.cancel_at, canceledAt: ts(s.canceled_at) ?? (deleted ? new Date() : null),
      couponId: (s as any).discounts?.[0] && typeof (s as any).discounts[0] !== 'string' ? (s as any).discounts[0].coupon?.id ?? null : null,
      metadata: meta,
    };
    const row = existing ? await tx.subscription.update({ where: { id: existing.id }, data }) : await tx.subscription.create({ data: { ...data, organizationId: orgId } });
    const live = LIVE_STATUSES.includes(status);
    const ended = deleted || ['canceled', 'unpaid', 'incomplete_expired'].includes(status);
    const org = await tx.organization.findUniqueOrThrow({ where: { id: orgId }, select: { tier: true, trialEndsAt: true } });
    const tier = live ? plan.tier : ended ? 'FREE' : org.tier;
    await tx.organization.update({ where: { id: orgId }, data: { tier, ...(s.trial_end && !org.trialEndsAt ? { trialEndsAt: ts(s.trial_end) } : {}) } });
    if (tier !== org.tier) await audit(tx, systemActor(orgId), 'subscription.sync', 'Subscription', row.id, `Plan is now ${PLANS[tier].name} (Stripe status ${status})`);
    return row;
  });
}

async function paymentFor(session: Stripe.Checkout.Session) {
  const id = session.metadata?.paymentId;
  const p = id ? await prisma.billingPayment.findUnique({ where: { id } }) : await prisma.billingPayment.findUnique({ where: { providerRef: session.id } });
  return p && p.provider === 'STRIPE' ? p : null;
}

function invoiceSubscriptionMeta(inv: Stripe.Invoice): Record<string, string> {
  return (inv.parent?.subscription_details?.metadata as Record<string, string> | undefined) ?? (inv as any).subscription_details?.metadata ?? {};
}

async function recordStripeInvoice(inv: Stripe.Invoice, status: string) {
  return prisma.$transaction(async tx => {
    const orgId = await orgFor(tx, idOf(inv.customer as any), invoiceSubscriptionMeta(inv).organizationId ?? inv.metadata?.organizationId);
    if (!orgId || !inv.id) return null;
    const line = inv.lines?.data?.[0];
    const row = await recordInvoice(tx, {
      organizationId: orgId, provider: 'STRIPE', providerInvoiceId: inv.id, description: line?.description ?? inv.description ?? 'Siar subscription',
      amountCents: status === 'paid' ? inv.amount_paid : inv.amount_due, currency: inv.currency, status,
      periodStart: ts(line?.period?.start ?? inv.period_start), periodEnd: ts(line?.period?.end ?? inv.period_end),
      paidAt: status === 'paid' ? ts(inv.status_transitions?.paid_at) ?? new Date() : null, hostedUrl: inv.hosted_invoice_url ?? null, pdfUrl: inv.invoice_pdf ?? null,
    });
    return { orgId, row };
  });
}

/**
 * Apply one verified Stripe event. Idempotent: Stripe retries deliveries and may send them out of
 * order, so every branch is an upsert or a guarded state change.
 */
export async function handleStripeEvent(event: Stripe.Event): Promise<{ handled: boolean }> {
  const o: any = event.data.object;
  switch (event.type) {
    case 'checkout.session.completed':
    case 'checkout.session.async_payment_succeeded': {
      const session = o as Stripe.Checkout.Session;
      const p = await paymentFor(session);
      if (!p) return { handled: false };
      if (session.mode === 'payment' && session.payment_status !== 'paid') return { handled: true }; // async method: wait for async_payment_succeeded
      if (session.customer && !(await prisma.organization.findFirst({ where: { id: p.organizationId, stripeCustomerId: { not: null } } }))) {
        await prisma.organization.update({ where: { id: p.organizationId }, data: { stripeCustomerId: idOf(session.customer as any) } }).catch(() => undefined);
      }
      await settlePayment(p.id, { charged: { amount: session.amount_total ?? p.amountCents, currency: session.currency ?? 'usd' }, via: 'stripe-webhook' });
      return { handled: true };
    }
    case 'checkout.session.async_payment_failed':
    case 'checkout.session.expired': {
      const p = await paymentFor(o);
      if (p) await failPayment(p.id, event.type === 'checkout.session.expired' ? 'checkout expired' : 'payment failed', 'stripe-webhook');
      return { handled: !!p };
    }
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      return { handled: !!(await syncSubscription(o as Stripe.Subscription, event.type === 'customer.subscription.deleted')) };
    case 'invoice.paid': {
      const r = await recordStripeInvoice(o as Stripe.Invoice, 'paid');
      if (r) await prisma.subscription.updateMany({ where: { organizationId: r.orgId, provider: 'STRIPE' }, data: { failedAttempts: 0 } });
      return { handled: !!r };
    }
    case 'invoice.payment_failed': {
      const inv = o as Stripe.Invoice;
      const r = await recordStripeInvoice(inv, 'open');
      if (!r) return { handled: false };
      await prisma.$transaction(async tx => {
        await tx.subscription.updateMany({ where: { organizationId: r.orgId, provider: 'STRIPE' }, data: { failedAttempts: inv.attempt_count ?? 1 } });
        const amount = money(inv.amount_due, inv.currency);
        const next = ts(inv.next_payment_attempt);
        await audit(tx, systemActor(r.orgId), 'subscription.chargeFailed', 'BillingInvoice', r.row.id, `Stripe could not charge ${amount} (attempt ${inv.attempt_count ?? 1})`);
        await notify(tx, r.orgId, { kind: 'billing', title: 'Payment failed', body: `We could not charge ${amount}.${next ? ` Stripe retries on ${next.toISOString().slice(0, 10)}.` : ''} Update your card to keep your plan.`, link: '/billing' }, ['OWNER', 'ADMIN']);
        const to = await billingEmail(tx, r.orgId);
        if (to) await queueMail(tx, { to, subject: 'Action needed: your Siar payment did not go through', kicker: 'Action needed', alert: true, details: [['Invoice', r.row.number], ['Amount', amount], ...(next ? [['Next try', next.toISOString().slice(0, 10)] as [string, string]] : [])], reason: 'You received this email because this address is the billing contact for a Siar organization.', heading: 'Your payment did not go through', paragraphs: [`We could not charge ${amount} for invoice ${r.row.number}.`, next ? `Stripe will try again on ${next.toISOString().slice(0, 10)}. Updating your card now keeps your plan running.` : 'Update your card to keep your plan running.'], cta: { label: 'Update card', url: appUrl('/billing') } });
      });
      return { handled: true };
    }
    default:
      return { handled: false };
  }
}
