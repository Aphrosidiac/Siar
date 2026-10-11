import type { FastifyInstance } from 'fastify';
import { audit } from '../platform/audit.js';
import { authenticate, requirePermission, type Actor } from '../platform/auth.js';
import { apiUrl, appUrl, config, isProd } from '../platform/config.js';
import { prisma } from '../platform/db.js';
import { badRequest, conflict, unavailable } from '../platform/errors.js';
import { listOf, pageOf } from '../platform/http.js';
import { logger } from '../platform/logger.js';
import { queueMail } from '../platform/mail.js';
import { define } from '../platform/routes.js';
import { JOBS } from '../platform/queue.js';
import { registerJob, runJob } from '../engine/jobs.js';
import { balance, ensureAccount } from '../domain/credits.js';
import { PLANS } from '../domain/plans.js';
import {
  billingEmail, failPayment, hadPaidPlan, hooks, invoiceView, LIVE_STATUSES, money, planLabel, RANK, renewalCharger, runRenewals, settlePayment,
  subscriptionView, toMyr, usdCents, type Interval, type Requested, type Tier,
} from './billing-core.js';
import { chip, chipConfigured, chipPublicKeys, PAID, verifySignature, type ChipPurchase } from './billing-chip.js';
import { mockCheckoutPage } from './billing-mock.js';
import * as stripeP from './billing-stripe.js';

/**
 * Billing: plans (subscriptions), invoices and X credit top-ups, behind three providers —
 *   STRIPE  global cards in USD; Stripe runs the subscription, we mirror its webhook events
 *   CHIP    Malaysian payments in MYR; we save the card and run renewals ourselves (cron)
 *   MOCK    BILLING_MODE=mock: a local checkout page that settles like a real provider would
 * Provider-independent rules live in billing-core.ts (settlement, renewals, dunning, invoices).
 */

type Kind = 'STRIPE' | 'CHIP' | 'MOCK';
const mockEnabled = () => config.BILLING_MODE === 'mock' && !isProd;
const meta = (m: unknown): Record<string, any> => (m && typeof m === 'object' && !Array.isArray(m) ? { ...(m as object) } : {});

/** body.provider → the provider that will take the money. In mock mode both resolve to MOCK (the request is recorded). */
function resolveProvider(requested?: Requested): { kind: Kind; requested: Requested } {
  const r: Requested = requested ?? 'STRIPE';
  if (config.BILLING_MODE === 'mock') {
    if (isProd) throw unavailable('Billing is not configured on this server.');
    return { kind: 'MOCK', requested: r };
  }
  if (r === 'STRIPE' && !config.STRIPE_SECRET_KEY) throw unavailable('Card payments through Stripe are not configured on this server.');
  if (r === 'CHIP' && !chipConfigured()) throw unavailable('CHIP payments are not configured on this server.');
  return { kind: r, requested: r };
}

// ───────────────────────── provider wiring for the core ─────────────────────────

hooks.deleteToken = async (provider, token) => { if (provider === 'CHIP' && chipConfigured()) await chip.deleteToken(token); };

renewalCharger.charge = async (sub, payment) => {
  const plan = PLANS[payment.tier as Tier];
  if (sub.provider === 'MOCK') {
    const m = meta(sub.metadata);
    await prisma.billingPayment.update({ where: { id: payment.id }, data: { providerRef: `mock_${m.requestedProvider === 'CHIP' ? 'chip' : 'stripe'}_renew_${payment.id}` } });
    return m.mockDeclines ? { status: 'failed', reason: 'Insufficient funds', tokenInvalid: false } : { status: 'paid' };
  }
  const org = await prisma.organization.findUniqueOrThrow({ where: { id: sub.organizationId } });
  const purchase = await chip.createPurchase({
    reference: `Siar ${plan.name} renewal`, clientId: sub.providerCustomerId ?? org.chipClientId,
    products: [{ name: `${planLabel(payment.tier, payment.billingInterval)} renewal`, price: toMyr(payment.amountCents) }],
    metadata: { siar_payment: payment.id, organizationId: sub.organizationId }, successUrl: appUrl('/organization/billing'),
  });
  await prisma.billingPayment.update({ where: { id: payment.id }, data: { providerRef: purchase.id } });
  const r = await chip.charge(purchase.id, sub.providerPaymentToken);
  if (r.status === 'paid') return { status: 'paid', charged: { amount: r.purchase.payment?.amount ?? r.purchase.purchase.total, currency: 'myr' } };
  if (r.status === 'pending') return { status: 'pending' };
  return { status: 'failed', reason: r.reason, tokenInvalid: r.tokenInvalid };
};

registerJob(JOBS.billingRenewals, () => runRenewals());

// ───────────────────────── checkouts ─────────────────────────

const returnUrl = (p: { purpose: string; tier: string | null }, ok: boolean) =>
  p.purpose === 'CREDIT_TOPUP' ? appUrl(`/organization/billing?tab=credits&topup=${ok ? 'success' : 'canceled'}`)
    : !p.tier ? appUrl(`/organization/billing?card=${ok ? 'updated' : 'canceled'}`)
      : appUrl(`/organization/billing?checkout=${ok ? 'success' : 'canceled'}`);

async function chipClientFor(organizationId: string) {
  const org = await prisma.organization.findUniqueOrThrow({ where: { id: organizationId } });
  const id = await chip.ensureClient({ name: org.name ?? 'Siar customer', email: await billingEmail(prisma, organizationId), chipClientId: org.chipClientId });
  if (!id) throw conflict('Add a billing email to the organization before paying with CHIP.');
  if (id !== org.chipClientId) await prisma.organization.update({ where: { id: organizationId }, data: { chipClientId: id } });
  return id;
}

/** Open the provider checkout for a payment row and remember its reference. */
async function openCheckout(payment: any, prov: { kind: Kind; requested: Requested }, opts: { trial?: boolean; coupon?: string | null } = {}) {
  try {
    let url: string, ref: string;
    if (prov.kind === 'MOCK') {
      ref = `mock_${prov.requested.toLowerCase()}_${payment.id}`;
      url = apiUrl(`/mock-billing/${payment.id}`);
    } else if (prov.kind === 'STRIPE') {
      if (payment.purpose === 'CREDIT_TOPUP') ({ url, ref } = await stripeP.checkoutTopUp({ organizationId: payment.organizationId, paymentId: payment.id, amountUsd: payment.amountCents / 100 }));
      else ({ url, ref } = await stripeP.checkoutSubscription({ organizationId: payment.organizationId, paymentId: payment.id, tier: payment.tier, interval: payment.billingInterval, trial: !!opts.trial, coupon: opts.coupon }));
    } else {
      const card = payment.purpose === 'SUBSCRIPTION';
      const zero = card && payment.amountCents === 0;
      const name = payment.purpose === 'CREDIT_TOPUP' ? `Siar X credit (${money(payment.amountCents, 'usd')})` : !payment.tier ? 'Save a card for Siar renewals' : `${planLabel(payment.tier, payment.billingInterval)}${zero ? `, ${config.TRIAL_DAYS}-day trial` : ''}`;
      const p = await chip.createPurchase({
        reference: name, clientId: await chipClientFor(payment.organizationId), products: [{ name, price: zero ? 0 : toMyr(payment.amountCents) }],
        saveCard: card && !zero, preauthorise: zero, metadata: { siar_payment: payment.id, organizationId: payment.organizationId },
        successUrl: returnUrl(payment, true), failureUrl: returnUrl(payment, false), cancelUrl: returnUrl(payment, false),
      });
      ref = p.id; url = p.checkout_url!;
    }
    await prisma.billingPayment.update({ where: { id: payment.id }, data: { providerRef: ref } });
    return url;
  } catch (err) {
    await prisma.billingPayment.update({ where: { id: payment.id }, data: { status: 'FAILED', settledAt: new Date() } }).catch(() => undefined);
    throw err;
  }
}

const providerOut = (kind: Kind, requested: string) => ({ provider: kind, requestedProvider: requested });

async function changePlan(actor: Actor, sub: any, tier: Tier, interval: Interval) {
  if (sub.status === 'past_due') throw conflict('Your last payment did not go through. Update your card in the billing portal first, then change plans.');
  const m = meta(sub.metadata);
  const requested = m.requestedProvider ?? sub.provider;
  const done = (q: string) => ({ url: appUrl(`/organization/billing?${q}`), ...providerOut(sub.provider, requested) });
  if (tier === 'FREE') { await cancelPlan(actor, sub); return done('downgrade=scheduled'); }
  if (sub.tier === tier && sub.billingInterval === interval) {
    if (!sub.cancelAtPeriodEnd && !m.pendingChange) throw conflict(`You are already on ${PLANS[tier].name} (${interval.toLowerCase()}).`);
    await resumePlan(actor, sub);
    return done('changed=1');
  }
  const upgrade = RANK[tier] > RANK[sub.tier as Tier] || (tier === sub.tier && interval === 'YEARLY' && sub.billingInterval === 'MONTHLY');
  const label = `${PLANS[sub.tier as Tier].name} (${sub.billingInterval.toLowerCase()}) to ${PLANS[tier].name} (${interval.toLowerCase()})`;

  if (sub.provider === 'STRIPE') {
    await stripeP.changePlan(sub.providerSubscriptionId, tier, interval, upgrade ? 'now' : 'period_end');
    if (!upgrade) await prisma.subscription.update({ where: { id: sub.id }, data: { metadata: { ...m, pendingChange: { tier, interval, at: sub.currentPeriodEnd?.toISOString() ?? null } } } });
    await audit(prisma, actor, upgrade ? 'subscription.upgrade' : 'subscription.downgrade', 'Subscription', sub.id, `${upgrade ? 'Upgraded' : 'Scheduled a change'} from ${label}`);
    return done(upgrade ? 'changed=1' : 'downgrade=scheduled');
  }

  // CHIP / mock
  if (!upgrade) {
    await prisma.subscription.update({ where: { id: sub.id }, data: { metadata: { ...m, pendingChange: { tier, interval, at: sub.currentPeriodEnd?.toISOString() ?? null } }, cancelAtPeriodEnd: false } });
    await audit(prisma, actor, 'subscription.downgrade', 'Subscription', sub.id, `Scheduled a change from ${label} at the period end`);
    return done('downgrade=scheduled');
  }
  if (sub.status === 'trialing') {
    // Nothing has been charged yet: the trial simply continues on the bigger plan.
    delete m.pendingChange;
    await prisma.$transaction(async tx => {
      await tx.subscription.update({ where: { id: sub.id }, data: { tier, billingInterval: interval, unitAmountCents: sub.currency === 'myr' ? toMyr(usdCents(tier, interval)) : usdCents(tier, interval), metadata: m, cancelAtPeriodEnd: false } });
      await tx.organization.update({ where: { id: sub.organizationId }, data: { tier } });
      await audit(tx, actor, 'subscription.upgrade', 'Subscription', sub.id, `Upgraded during the trial from ${label}`);
    });
    return done('changed=1');
  }
  // Upgrade now: a checkout for the new plan, less the unused part of the current period.
  const now = Date.now();
  const start = sub.currentPeriodStart?.getTime() ?? now, end = sub.currentPeriodEnd?.getTime() ?? now;
  const left = end > start ? Math.min(1, Math.max(0, (end - now) / (end - start))) : 0;
  const unused = Math.round(usdCents(sub.tier, sub.billingInterval) * left);
  const amount = Math.max(100, usdCents(tier, interval) - unused);
  const payment = await prisma.billingPayment.create({ data: { organizationId: sub.organizationId, provider: sub.provider, purpose: 'SUBSCRIPTION', amountCents: amount, currency: 'usd', tier, billingInterval: interval } });
  const url = await openCheckout(payment, { kind: sub.provider, requested });
  await audit(prisma, actor, 'billing.checkout', 'BillingPayment', payment.id, `Started an upgrade from ${label} (${money(amount, 'usd')} after ${money(unused, 'usd')} credit for unused time)`);
  return { url, ...providerOut(sub.provider, requested) };
}

async function cancelPlan(actor: Actor, sub: any) {
  if (sub.provider === 'STRIPE') await stripeP.setCancelAtPeriodEnd(sub.providerSubscriptionId, true);
  else {
    const m = meta(sub.metadata);
    delete m.pendingChange;
    await prisma.subscription.update({ where: { id: sub.id }, data: { cancelAtPeriodEnd: true, metadata: m } });
  }
  const until = sub.currentPeriodEnd?.toISOString().slice(0, 10);
  await audit(prisma, actor, 'subscription.cancel', 'Subscription', sub.id, `Set ${PLANS[sub.tier as Tier].name} to end${until ? ` on ${until}` : ''}`);
  const to = await billingEmail(prisma, sub.organizationId);
  if (to) await queueMail(prisma, { to, subject: `Your Siar ${PLANS[sub.tier as Tier].name} plan will end`, heading: 'Your plan is set to end', paragraphs: [`${PLANS[sub.tier as Tier].name} stays active${until ? ` until ${until}` : ' until the end of the period'}, then the organization moves to Free. Nothing is deleted.`, 'Changed your mind? Resume the plan from Billing before then.'], cta: { label: 'Open billing', url: appUrl('/organization/billing') } });
}

async function resumePlan(actor: Actor, sub: any) {
  if (sub.provider === 'STRIPE') await stripeP.setCancelAtPeriodEnd(sub.providerSubscriptionId, false);
  const m = meta(sub.metadata);
  delete m.pendingChange;
  await prisma.subscription.update({ where: { id: sub.id }, data: { cancelAtPeriodEnd: false, metadata: m } });
  await audit(prisma, actor, 'subscription.resume', 'Subscription', sub.id, `Kept ${PLANS[sub.tier as Tier].name} running`);
}

async function liveSub(organizationId: string) {
  const s = await prisma.subscription.findUnique({ where: { organizationId } });
  return s && LIVE_STATUSES.includes(s.status) ? s : null;
}

define({
  'billing.subscription': async ({ actor }) => {
    requirePermission(actor, 'billing');
    return subscriptionView(actor.organizationId);
  },

  'billing.checkout': async ({ actor, body }) => {
    requirePermission(actor, 'billing');
    const tier = body.plan as Tier;
    const interval = body.interval as Interval;
    if (tier === 'ENTERPRISE') throw badRequest('Enterprise is priced per contract. Email hello@ffdev.studio and we will set it up for you.', [{ code: 'invalid', message: 'Choose PRO or BUSINESS', path: ['plan'] }]);
    const sub = await liveSub(actor.organizationId);
    if (sub) return changePlan(actor, sub, tier, interval);
    if (tier === 'FREE') throw conflict('You are already on the Free plan.');
    const prov = resolveProvider(body.provider);
    if (body.coupon && prov.kind === 'CHIP') throw badRequest('Promotion codes are only accepted at card checkout through Stripe.', [{ code: 'invalid', message: 'Not accepted with CHIP', path: ['coupon'] }]);
    const trial = config.TRIAL_DAYS > 0 && !(await hadPaidPlan(prisma, actor.organizationId));
    const usd = usdCents(tier, interval);
    const payment = await prisma.billingPayment.create({
      data: { organizationId: actor.organizationId, provider: prov.kind, purpose: 'SUBSCRIPTION', amountCents: trial && prov.kind !== 'STRIPE' ? 0 : usd, currency: 'usd', tier, billingInterval: interval },
    });
    const url = await openCheckout(payment, prov, { trial, coupon: body.coupon });
    await audit(prisma, actor, 'billing.checkout', 'BillingPayment', payment.id, `Started checkout for ${planLabel(tier, interval)} through ${prov.requested}${trial ? ` with a ${config.TRIAL_DAYS}-day trial` : ''}`);
    return { url, ...providerOut(prov.kind, prov.requested), trialDays: trial ? config.TRIAL_DAYS : 0 };
  },

  'billing.portal': async ({ actor }) => {
    requirePermission(actor, 'billing');
    const org = await prisma.organization.findUniqueOrThrow({ where: { id: actor.organizationId }, include: { subscription: true } });
    const sub = org.subscription;
    if (sub?.provider === 'STRIPE' || (!sub && org.stripeCustomerId && config.BILLING_MODE === 'live' && config.STRIPE_SECRET_KEY)) {
      return { url: await stripeP.portalUrl(org.id), provider: 'STRIPE' };
    }
    if (!sub || !LIVE_STATUSES.includes(sub.status)) throw conflict('There is no paid plan yet. Choose a plan first; the card you pay with is kept for renewals.');
    // CHIP / mock: changing the card is a new zero-amount purchase that saves it.
    if (sub.provider === 'MOCK' && !mockEnabled()) throw unavailable('Billing is not configured on this server.');
    const requested = meta(sub.metadata).requestedProvider ?? sub.provider;
    const payment = await prisma.billingPayment.create({ data: { organizationId: org.id, provider: sub.provider, purpose: 'SUBSCRIPTION', amountCents: 0, currency: 'usd' } });
    const url = await openCheckout(payment, { kind: sub.provider as Kind, requested });
    await audit(prisma, actor, 'billing.portal', 'BillingPayment', payment.id, 'Started a card change');
    return { url, ...providerOut(sub.provider as Kind, requested) };
  },

  'billing.cancel': async ({ actor }) => {
    requirePermission(actor, 'billing');
    const sub = await liveSub(actor.organizationId);
    if (!sub) throw conflict('There is no paid plan to cancel.');
    if (!sub.cancelAtPeriodEnd) await cancelPlan(actor, sub);
    return subscriptionView(actor.organizationId);
  },

  'billing.resume': async ({ actor }) => {
    requirePermission(actor, 'billing');
    const sub = await prisma.subscription.findUnique({ where: { organizationId: actor.organizationId } });
    if (!sub || !LIVE_STATUSES.includes(sub.status)) throw conflict('This plan has already ended. Choose a plan to start again.');
    if (sub.cancelAtPeriodEnd || meta(sub.metadata).pendingChange) await resumePlan(actor, sub);
    return subscriptionView(actor.organizationId);
  },

  'billing.invoices': async ({ actor, query }) => {
    requirePermission(actor, 'billing');
    const { skip, take } = pageOf(query);
    const where = { organizationId: actor.organizationId };
    const [rows, total] = await Promise.all([prisma.billingInvoice.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take }), prisma.billingInvoice.count({ where })]);
    return listOf(rows.map(invoiceView), total);
  },

  'billing.topUp': async ({ actor, body }) => {
    requirePermission(actor, 'credits.topUp');
    const amountUsd = Number(body.amountUsd);
    if (!Number.isInteger(amountUsd) || amountUsd < 5 || amountUsd > 5000) throw badRequest('Top-ups are whole dollars from $5 to $5000.', [{ code: 'invalid', message: 'Between 5 and 5000', path: ['amountUsd'] }]);
    const prov = resolveProvider(body.provider);
    const payment = await prisma.billingPayment.create({ data: { organizationId: actor.organizationId, provider: prov.kind, purpose: 'CREDIT_TOPUP', amountCents: amountUsd * 100, currency: 'usd' } });
    const url = await openCheckout(payment, prov);
    await audit(prisma, actor, 'billing.topUp', 'BillingPayment', payment.id, `Started a ${money(amountUsd * 100, 'usd')} X credit top-up through ${prov.requested}`);
    return { url, ...providerOut(prov.kind, prov.requested) };
  },

  'billing.ledger': async ({ actor, query }) => {
    requirePermission(actor, 'billing');
    const { skip, take } = pageOf(query);
    const where = { organizationId: actor.organizationId };
    const [rows, total] = await Promise.all([prisma.creditLedger.findMany({ where, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], skip, take }), prisma.creditLedger.count({ where })]);
    return listOf(rows.map(r => ({ id: r.id, deltaMicroUsd: Number(r.deltaMicros), reason: r.reason, action: r.action, refType: r.refType, refId: r.refId, note: r.note, createdAt: r.createdAt.toISOString() })), total);
  },

  'billing.creditSettings': async ({ actor, body }) => {
    requirePermission(actor, 'billing');
    const v = Number(body.lowBalanceThresholdMicroUsd);
    if (!Number.isInteger(v) || v < 0 || v > 5_000_000_000) throw badRequest('The low-balance threshold is in micro-USD, from 0 (off) to 5000000000 ($5000).', [{ code: 'invalid', message: 'Between 0 and 5000000000', path: ['lowBalanceThresholdMicroUsd'] }]);
    await prisma.$transaction(async tx => {
      await ensureAccount(tx, actor.organizationId);
      await tx.creditAccount.update({ where: { organizationId: actor.organizationId }, data: { lowBalanceThresholdMicros: v === 0 ? null : BigInt(v), lowBalanceNotifiedAt: null } });
      await audit(tx, actor, 'credit.settings', 'CreditAccount', actor.organizationId, v === 0 ? 'Turned off the low-balance alert' : `Low-balance alert at ${money(Math.round(v / 10_000), 'usd')}`);
    });
    return balance(actor.organizationId);
  },
});

// ───────────────────────── raw routes: provider callbacks + mock checkout ─────────────────────────

async function applyChipPurchase(p: ChipPurchase) {
  const byRef = await prisma.billingPayment.findUnique({ where: { providerRef: p.id } });
  const payment = byRef ?? (p.purchase.metadata?.siar_payment ? await prisma.billingPayment.findUnique({ where: { id: p.purchase.metadata.siar_payment } }) : null);
  if (!payment || payment.provider !== 'CHIP') return 'unknown';
  if (PAID.has(p.status) || p.status === 'preauthorized') {
    return settlePayment(payment.id, { charged: { amount: p.payment?.amount ?? (p.status === 'preauthorized' ? 0 : p.purchase.total), currency: 'myr' }, token: p.is_recurring_token ? p.id : null, via: 'chip-callback' });
  }
  if (['error', 'cancelled', 'expired', 'blocked'].includes(p.status)) { await failPayment(payment.id, p.status, 'chip-callback'); return 'failed'; }
  return 'ignored';
}

export async function billingRawRoutes(app: FastifyInstance) {
  // Provider webhooks need the exact bytes that were signed: a raw-body JSON parser, scoped to them.
  await app.register(async scope => {
    scope.addContentTypeParser('application/json', { parseAs: 'buffer' }, (_req, body, done) => done(null, body));

    scope.post('/api/v1/billing/stripe/webhook', async (req, reply) => {
      if (!config.STRIPE_WEBHOOK_SECRET) return reply.status(503).send({ statusCode: 503, message: 'Stripe webhooks are not configured on this server.' });
      const sig = req.headers['stripe-signature'];
      let event;
      try { event = stripeP.constructEvent(req.body as Buffer, String(sig ?? '')); }
      catch { logger.warn({ ip: req.ip }, 'stripe webhook with a bad signature'); return reply.status(400).send({ statusCode: 400, message: 'Bad signature.' }); }
      const r = await stripeP.handleStripeEvent(event);
      return { received: true, handled: r.handled };
    });

    scope.post('/api/v1/billing/chip/callback', async (req, reply) => {
      if (!chipConfigured()) return reply.status(503).send({ statusCode: 503, message: 'CHIP is not configured on this server.' });
      const raw = req.body as Buffer;
      const sig = req.headers['x-signature'];
      if (typeof sig !== 'string' || !Buffer.isBuffer(raw) || !verifySignature(raw, sig, await chipPublicKeys())) {
        logger.warn({ ip: req.ip }, 'chip callback with a bad signature');
        return reply.status(401).send({ statusCode: 401, message: 'Bad signature.' });
      }
      let body: any;
      try { body = JSON.parse(raw.toString('utf8')); } catch { return reply.status(400).send({ statusCode: 400, message: 'Not JSON.' }); }
      const type = String(body.event_type ?? '');
      const purchaseId: string | null = type.startsWith('purchase.') || body.type === 'purchase' ? body.id : body.related_to?.type === 'purchase' ? body.related_to.id : null;
      if (!purchaseId || type === 'purchase.recurring_token_deleted') return { received: true };
      // The body is only a hint: read the purchase back from CHIP (a 5xx here makes CHIP retry).
      const result = await applyChipPurchase(await chip.getPurchase(purchaseId));
      return { received: true, result };
    });
  });

  // ── mock checkout (BILLING_MODE=mock, never in production) ──
  const mockPayment = async (id: string) => {
    if (!mockEnabled()) return null;
    const p = await prisma.billingPayment.findUnique({ where: { id } }).catch(() => null);
    return p && p.provider === 'MOCK' ? p : null;
  };
  const notFoundPage = (reply: any) => reply.status(404).send({ statusCode: 404, message: 'Checkout not found.' });

  app.get<{ Params: { paymentId: string } }>('/mock-billing/:paymentId', async (req, reply) => {
    const p = await mockPayment(req.params.paymentId);
    if (!p) return notFoundPage(reply);
    return reply.type('text/html; charset=utf-8').header('cache-control', 'no-store').send(mockCheckoutPage(p));
  });

  app.post<{ Params: { paymentId: string } }>('/mock-billing/:paymentId/pay', async (req, reply) => {
    const p = await mockPayment(req.params.paymentId);
    if (!p) return notFoundPage(reply);
    if (p.status !== 'PENDING') return reply.redirect(`/mock-billing/${p.id}`, 303);
    await settlePayment(p.id, { token: p.purpose === 'SUBSCRIPTION' ? `mock_tok_${p.id}` : null, via: 'mock' });
    return reply.redirect(returnUrl(p, true), 303);
  });

  app.post<{ Params: { paymentId: string } }>('/mock-billing/:paymentId/decline', async (req, reply) => {
    const p = await mockPayment(req.params.paymentId);
    if (!p) return notFoundPage(reply);
    await failPayment(p.id, 'declined at the test checkout', 'mock');
    return reply.redirect(returnUrl(p, false), 303);
  });

  /**
   * Mock only: let time pass. The current period (or the pending retry) becomes due now, the
   * saved test card is set to approve or decline (`fail`), and the renewal cron runs once.
   */
  app.post('/mock-billing/renew', async (req, reply) => {
    if (!mockEnabled()) return notFoundPage(reply);
    const actor = await authenticate(req);
    requirePermission(actor, 'billing');
    const body = (req.body ?? {}) as { fail?: boolean };
    const sub = await prisma.subscription.findUnique({ where: { organizationId: actor.organizationId } });
    if (!sub || sub.provider !== 'MOCK' || !LIVE_STATUSES.includes(sub.status)) throw conflict('There is no running mock subscription to renew.');
    const m = meta(sub.metadata);
    m.mockDeclines = !!body.fail;
    const due = new Date(Date.now() - 1000);
    await prisma.subscription.update({ where: { id: sub.id }, data: { metadata: m, ...(sub.status === 'past_due' ? { nextRetryAt: due } : { currentPeriodEnd: due, nextRetryAt: null }) } });
    const result = await runJob(JOBS.billingRenewals, {});
    return { result, subscription: await subscriptionView(actor.organizationId) };
  });
}
