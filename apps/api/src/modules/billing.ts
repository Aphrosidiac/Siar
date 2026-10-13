import type { FastifyInstance } from 'fastify';
import { audit } from '../platform/audit.js';
import { authenticate, requirePermission, type Actor } from '../platform/auth.js';
import { apiUrl, appUrl, config, isProd } from '../platform/config.js';
import { prisma } from '../platform/db.js';
import { badRequest, conflict, notFound, unavailable } from '../platform/errors.js';
import { listOf, pageOf } from '../platform/http.js';
import { logger } from '../platform/logger.js';
import { queueMail } from '../platform/mail.js';
import { define } from '../platform/routes.js';
import { JOBS } from '../platform/queue.js';
import { registerJob, runJob } from '../engine/jobs.js';
import { balance, ensureAccount } from '../domain/credits.js';
import type { FastifyRequest } from 'fastify';
import { currencyFor, ONCE_METHODS, PLANS, TIER_ORDER, type Currency } from '../domain/plans.js';
import {
  billingEmail, failPayment, hadPaidPlan, hooks, invoiceDocument, invoiceView, listPrice, LIVE_STATUSES, money, planLabel, RANK, renewalCharger, runRenewals, settlePayment,
  subscriptionView, usdToMyr, type Interval, type Requested, type Tier,
} from './billing-core.js';
import { cardCountryOf, chip, chipAccepts, chipConfigured, chipPublicKeys, PAID, verifySignature, type ChipPurchase } from './billing-chip.js';
import { mockCheckoutPage } from './billing-mock.js';
import * as stripeP from './billing-stripe.js';

/**
 * Billing: plans (subscriptions), invoices and X credit top-ups, behind three providers —
 *   STRIPE  cards in USD or ringgit (Stripe runs card subscriptions; we mirror its webhook events),
 *           plus FPX / GrabPay for a yearly plan paid once
 *   CHIP    Malaysian payments in ringgit (FPX, DuitNow, cards); we save the card and run renewals (cron)
 *   MOCK    BILLING_MODE=mock: a local checkout page that settles like a real provider would
 * Routing: the organization's billing country picks the price list (MY → ringgit, else USD).
 * Ringgit goes to CHIP when CHIP has that kind of payment method open for the brand, else Stripe;
 * USD always goes to Stripe. Provider-independent rules live in billing-core.ts.
 */

type Kind = 'STRIPE' | 'CHIP' | 'MOCK';
const mockEnabled = () => config.BILLING_MODE === 'mock' && !isProd;
const meta = (m: unknown): Record<string, any> => (m && typeof m === 'object' && !Array.isArray(m) ? { ...(m as object) } : {});

/** card = a saved card renews it; bank = a yearly plan paid once (FPX, DuitNow, GrabPay); once = a one-off payment (top-up). */
type Need = 'card' | 'bank' | 'once';

/** The visitor's country as Cloudflare saw it (CF-IPCountry), when it is a real country code. */
export function detectedCountry(req?: FastifyRequest): string | null {
  const c = String(req?.headers['cf-ipcountry'] ?? '').toUpperCase();
  return /^[A-Z]{2}$/.test(c) && c !== 'XX' && c !== 'T1' ? c : null;
}

/** The organization's billing country; the first checkout fixes it from where the buyer is (MY when unknown). */
async function countryOf(organizationId: string, req?: FastifyRequest, persist = false) {
  const org = await prisma.organization.findUniqueOrThrow({ where: { id: organizationId }, select: { billingCountry: true } });
  if (org.billingCountry) return org.billingCountry;
  const c = detectedCountry(req) ?? 'MY';
  if (persist) await prisma.organization.update({ where: { id: organizationId }, data: { billingCountry: c } });
  return c;
}

/** Which provider takes a payment. body.provider, when given, is honoured (and checked). In mock mode everything resolves to MOCK. */
async function route(currency: Currency, need: Need, requested?: Requested): Promise<{ kind: Kind; requested: Requested }> {
  if (need === 'bank' && currency !== 'myr') throw badRequest(`Paying once by ${ONCE_METHODS} is for organizations billed in Malaysia. Pay by card instead.`, [{ code: 'invalid', message: 'Ringgit only', path: ['method'] }]);
  if (requested === 'CHIP' && currency !== 'myr') throw badRequest('CHIP takes ringgit payments only. Organizations billed outside Malaysia pay through Stripe.', [{ code: 'invalid', message: 'Ringgit only', path: ['provider'] }]);
  if (config.BILLING_MODE === 'mock') {
    if (isProd) throw unavailable('Billing is not configured on this server.');
    return { kind: 'MOCK', requested: requested ?? (currency === 'myr' ? 'CHIP' : 'STRIPE') };
  }
  if (requested === 'CHIP' && !chipConfigured()) throw unavailable('CHIP payments are not configured on this server.');
  if (requested) {
    if (requested === 'STRIPE' && !config.STRIPE_SECRET_KEY) throw unavailable('Card payments through Stripe are not configured on this server.');
    return { kind: requested, requested };
  }
  if (currency === 'myr') {
    const open = need === 'once' ? (await chipAccepts('bank')) || (await chipAccepts('card')) : await chipAccepts(need);
    if (open) return { kind: 'CHIP', requested: 'CHIP' };
  }
  if (!config.STRIPE_SECRET_KEY) throw unavailable('Payments are not configured on this server.');
  return { kind: 'STRIPE', requested: 'STRIPE' };
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
    products: [{ name: `${planLabel(payment.tier, payment.billingInterval)} renewal`, price: payment.amountCents }],
    metadata: { siar_payment: payment.id, organizationId: sub.organizationId }, successUrl: appUrl('/billing'),
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
  p.purpose === 'CREDIT_TOPUP' ? appUrl(`/billing?tab=credits&topup=${ok ? 'success' : 'canceled'}`)
    : !p.tier ? appUrl(`/billing?card=${ok ? 'updated' : 'canceled'}`)
      : appUrl(`/billing?checkout=${ok ? 'success' : 'canceled'}`);

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
      if (payment.purpose === 'CREDIT_TOPUP') ({ url, ref } = await stripeP.checkoutTopUp({ organizationId: payment.organizationId, paymentId: payment.id, amount: payment.amountCents, currency: payment.currency, creditUsd: (payment.creditCents ?? payment.amountCents) / 100 }));
      else if (payment.renewal === 'LINK') ({ url, ref } = await stripeP.checkoutOnce({ organizationId: payment.organizationId, paymentId: payment.id, tier: payment.tier, interval: payment.billingInterval, currency: payment.currency, amount: payment.amountCents, name: `${planLabel(payment.tier, payment.billingInterval)}${payment.isRenewal ? ' renewal' : ''}` }));
      else ({ url, ref } = await stripeP.checkoutSubscription({ organizationId: payment.organizationId, paymentId: payment.id, tier: payment.tier, interval: payment.billingInterval, currency: payment.currency, trial: !!opts.trial, coupon: opts.coupon }));
    } else {
      const card = payment.purpose === 'SUBSCRIPTION' && payment.renewal === 'AUTO';
      const zero = card && payment.amountCents === 0;
      const name = payment.purpose === 'CREDIT_TOPUP' ? `Siar X credit (${money(payment.creditCents ?? payment.amountCents, 'usd')})` : !payment.tier ? 'Save a card for Siar renewals' : `${planLabel(payment.tier, payment.billingInterval)}${payment.isRenewal ? ' renewal' : ''}${zero ? `, ${config.TRIAL_DAYS}-day trial` : ''}`;
      const p = await chip.createPurchase({
        reference: name, clientId: await chipClientFor(payment.organizationId), products: [{ name, price: zero ? 0 : payment.amountCents }],
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
  if (sub.status === 'past_due') throw conflict(sub.renewal === 'LINK' ? 'Your plan is due for renewal. Renew it first, then change plans.' : 'Your last payment did not go through. Update your card in the billing portal first, then change plans.');
  const m = meta(sub.metadata);
  const requested = m.requestedProvider ?? sub.provider;
  const done = (q: string) => ({ url: appUrl(`/billing?${q}`), ...providerOut(sub.provider, requested) });
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
      await tx.subscription.update({ where: { id: sub.id }, data: { tier, billingInterval: interval, unitAmountCents: listPrice(tier, interval, sub.currency), metadata: m, cancelAtPeriodEnd: false } });
      await tx.organization.update({ where: { id: sub.organizationId }, data: { tier } });
      await audit(tx, actor, 'subscription.upgrade', 'Subscription', sub.id, `Upgraded during the trial from ${label}`);
    });
    return done('changed=1');
  }
  // Upgrade now: a checkout for the new plan, less the unused part of the current period.
  const now = Date.now();
  const start = sub.currentPeriodStart?.getTime() ?? now, end = sub.currentPeriodEnd?.getTime() ?? now;
  const left = end > start ? Math.min(1, Math.max(0, (end - now) / (end - start))) : 0;
  const unused = Math.round(sub.unitAmountCents * left);
  const amount = Math.max(100, listPrice(tier, interval, sub.currency) - unused);
  // A link-renewed plan is upgraded by paying once again (routed afresh); a saved-card plan stays with its provider.
  const prov = sub.renewal === 'LINK' ? await route(sub.currency as Currency, 'bank') : { kind: sub.provider as Kind, requested };
  const payment = await prisma.billingPayment.create({ data: { organizationId: sub.organizationId, provider: prov.kind, purpose: 'SUBSCRIPTION', amountCents: amount, currency: sub.currency, tier, billingInterval: interval, renewal: sub.renewal } });
  const url = await openCheckout(payment, prov);
  await audit(prisma, actor, 'billing.checkout', 'BillingPayment', payment.id, `Started an upgrade from ${label} (${money(amount, sub.currency)} after ${money(unused, sub.currency)} credit for unused time)`);
  return { url, ...providerOut(prov.kind, prov.requested) };
}

/** Pay the next period of a link-renewed plan (or a scheduled change to it) at its locked price. */
async function renewLink(actor: Actor, sub: any) {
  if (sub.renewal !== 'LINK') throw conflict('This plan renews by card on its own. There is nothing to pay now.');
  const m = meta(sub.metadata);
  if (sub.cancelAtPeriodEnd || m.pendingChange?.tier === 'FREE') throw conflict('This plan is set to end. Resume it first, then renew.');
  const end = sub.currentPeriodEnd?.getTime() ?? 0;
  if (sub.status !== 'past_due' && end - Date.now() > 30 * 86400_000) throw conflict(`This plan is paid until ${sub.currentPeriodEnd.toISOString().slice(0, 10)}. Renewal opens 30 days before that.`);
  const tier = (m.pendingChange?.tier ?? sub.tier) as Tier;
  const interval = (m.pendingChange?.interval ?? sub.billingInterval) as Interval;
  const amount = tier === sub.tier && interval === sub.billingInterval ? sub.unitAmountCents : listPrice(tier, interval, sub.currency);
  const prov = await route(sub.currency as Currency, 'bank');
  const payment = await prisma.billingPayment.create({ data: { organizationId: sub.organizationId, provider: prov.kind, purpose: 'SUBSCRIPTION', amountCents: amount, currency: sub.currency, tier, billingInterval: interval, renewal: 'LINK', isRenewal: true } });
  const url = await openCheckout(payment, prov);
  await audit(prisma, actor, 'billing.checkout', 'BillingPayment', payment.id, `Started the renewal of ${planLabel(tier, interval)} (${money(amount, sub.currency)})`);
  return { url, ...providerOut(prov.kind, prov.requested), currency: sub.currency, amountCents: amount };
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
  if (to) await queueMail(prisma, { to, subject: `Your Siar ${PLANS[sub.tier as Tier].name} plan will end`, kicker: 'Billing', details: [['Plan', PLANS[sub.tier as Tier].name], ['Active until', until ?? 'End of the period'], ['Then', 'Free plan']], reason: 'You received this email because this address is the billing contact for a Siar organization.', heading: 'Your plan is set to end.', paragraphs: [`${PLANS[sub.tier as Tier].name} stays active${until ? ` until ${until}` : ' until the end of the period'}, then the organization moves to Free. Nothing is deleted.`, 'Changed your mind? Resume the plan from Billing before then.'], cta: { label: 'Open billing', url: appUrl('/billing') } });
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

  'billing.plans': async ({ actor, req }) => {
    requirePermission(actor, 'billing');
    const country = await countryOf(actor.organizationId, req);
    const currency = currencyFor(country);
    const teamsInUse = await prisma.team.count({ where: { organizationId: actor.organizationId, deletedAt: null } });
    const trialAvailable = config.TRIAL_DAYS > 0 && !(await hadPaidPlan(prisma, actor.organizationId));
    return {
      country, detectedCountry: detectedCountry(req), currency, teamsInUse, trialDays: trialAvailable ? config.TRIAL_DAYS : 0,
      // Yearly plans can be paid once (FPX, DuitNow, GrabPay) only in ringgit; everything can be paid by card.
      methods: { card: true, bank: currency === 'myr' },
      plans: TIER_ORDER.map(t => {
        const p = PLANS[t];
        return {
          tier: t, name: p.name, tagline: p.tagline, currency, price: p.prices ? p.prices[currency] : null, oneTime: p.oneTime, trial: p.trial && trialAvailable,
          posts: p.posts, comments: p.comments, uploads: p.uploads, teams: p.teams, analytics: p.analytics,
          dmsPerAccount: p.dmsPerAccount, automationRunsPerAccount: p.automationRunsPerAccount, importPostsPerAccount: p.importPostsPerAccount, reviewImportPerAccount: p.reviewImportPerAccount,
        };
      }),
    };
  },

  'billing.checkout': async ({ actor, body, req }) => {
    requirePermission(actor, 'billing');
    const tier = body.plan as Tier;
    const interval = body.interval as Interval;
    const method = (body.method ?? 'card') as 'card' | 'bank';
    if (tier === 'ENTERPRISE') throw badRequest('Enterprise is priced per contract. Email hello@ffdev.studio and we will set it up for you.', [{ code: 'invalid', message: 'Choose STARTER, PRO or BUSINESS', path: ['plan'] }]);
    const sub = await liveSub(actor.organizationId);
    if (sub && body.renew) return renewLink(actor, sub);
    if (sub) return changePlan(actor, sub, tier, interval);
    if (body.renew) throw conflict('There is no running plan to renew. Choose a plan instead.');
    if (tier === 'FREE') throw conflict('You are already on the Free plan.');
    if (method === 'bank' && interval !== 'YEARLY') throw badRequest(`Monthly plans renew by card. Choose yearly to pay once by ${ONCE_METHODS}.`, [{ code: 'invalid', message: 'Yearly only', path: ['method'] }]);
    const currency = currencyFor(await countryOf(actor.organizationId, req, true));
    const prov = await route(currency, method, body.provider);
    if (body.coupon && (prov.kind === 'CHIP' || method === 'bank')) throw badRequest('Promotion codes are only accepted at card checkout through Stripe.', [{ code: 'invalid', message: 'Not accepted here', path: ['coupon'] }]);
    const trial = PLANS[tier].trial && method === 'card' && config.TRIAL_DAYS > 0 && !(await hadPaidPlan(prisma, actor.organizationId));
    const amount = listPrice(tier, interval, currency);
    const payment = await prisma.billingPayment.create({
      data: { organizationId: actor.organizationId, provider: prov.kind, purpose: 'SUBSCRIPTION', amountCents: trial && prov.kind !== 'STRIPE' ? 0 : amount, currency, tier, billingInterval: interval, renewal: method === 'bank' ? 'LINK' : 'AUTO' },
    });
    const url = await openCheckout(payment, prov, { trial, coupon: body.coupon });
    await audit(prisma, actor, 'billing.checkout', 'BillingPayment', payment.id, `Started checkout for ${planLabel(tier, interval)} at ${money(amount, currency)} through ${prov.requested}${method === 'bank' ? ' (paid once)' : ''}${trial ? ` with a ${config.TRIAL_DAYS}-day trial` : ''}`);
    return { url, ...providerOut(prov.kind, prov.requested), trialDays: trial ? config.TRIAL_DAYS : 0, currency, amountCents: amount };
  },

  'billing.portal': async ({ actor }) => {
    requirePermission(actor, 'billing');
    const org = await prisma.organization.findUniqueOrThrow({ where: { id: actor.organizationId }, include: { subscription: true } });
    const sub = org.subscription;
    if (sub?.provider === 'STRIPE' || (!sub && org.stripeCustomerId && config.BILLING_MODE === 'live' && config.STRIPE_SECRET_KEY)) {
      return { url: await stripeP.portalUrl(org.id), provider: 'STRIPE' };
    }
    if (!sub || !LIVE_STATUSES.includes(sub.status)) throw conflict('There is no paid plan yet. Choose a plan first; the card you pay with is kept for renewals.');
    if (sub.renewal === 'LINK') throw conflict(`This plan was paid once (${ONCE_METHODS}), so there is no card on file. Renew it from Billing when the reminder arrives.`);
    // CHIP / mock: changing the card is a new zero-amount purchase that saves it.
    if (sub.provider === 'MOCK' && !mockEnabled()) throw unavailable('Billing is not configured on this server.');
    const requested = meta(sub.metadata).requestedProvider ?? sub.provider;
    const payment = await prisma.billingPayment.create({ data: { organizationId: org.id, provider: sub.provider, purpose: 'SUBSCRIPTION', amountCents: 0, currency: sub.currency } });
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

  'billing.invoice': async ({ actor, params }) => {
    requirePermission(actor, 'billing');
    const row = await prisma.billingInvoice.findFirst({ where: { id: params.id, organizationId: actor.organizationId } });
    if (!row) throw notFound('Invoice');
    return invoiceDocument(row);
  },

  'billing.details': async ({ actor, req }) => {
    requirePermission(actor, 'billing');
    const o = await prisma.organization.findUniqueOrThrow({ where: { id: actor.organizationId }, select: { billingName: true, billingEmail: true, billingAddress: true, billingTaxId: true, billingCountry: true } });
    return { name: o.billingName, email: o.billingEmail, address: o.billingAddress, taxId: o.billingTaxId, country: o.billingCountry, detectedCountry: detectedCountry(req) };
  },

  'billing.updateDetails': async ({ actor, body, req }) => {
    requirePermission(actor, 'billing');
    const clean = (v: unknown) => (typeof v === 'string' ? v.trim() || null : v === null ? null : undefined);
    const country = clean(body.country)?.toUpperCase();
    if (country && !/^[A-Z]{2}$/.test(country)) throw badRequest('country is a two-letter ISO 3166-1 code, like MY or SG.', [{ code: 'invalid', message: 'ISO 3166-1 alpha-2', path: ['country'] }]);
    const before = await prisma.organization.findUniqueOrThrow({ where: { id: actor.organizationId }, select: { billingCountry: true } });
    const o = await prisma.organization.update({
      where: { id: actor.organizationId },
      data: { billingName: clean(body.name), billingEmail: clean(body.email)?.toLowerCase(), billingAddress: clean(body.address), billingTaxId: clean(body.taxId), ...(country !== undefined ? { billingCountry: country } : {}) },
      select: { billingName: true, billingEmail: true, billingAddress: true, billingTaxId: true, billingCountry: true },
    });
    const moved = country !== undefined && country !== before.billingCountry;
    // A running plan keeps its currency and locked price; the new country applies to the next checkout.
    await audit(prisma, actor, 'billing.details', 'Organization', actor.organizationId, moved ? `Updated billing details; billing country ${before.billingCountry ?? 'unset'} → ${country ?? 'unset'}` : 'Updated billing details');
    return { name: o.billingName, email: o.billingEmail, address: o.billingAddress, taxId: o.billingTaxId, country: o.billingCountry, detectedCountry: detectedCountry(req) };
  },

  'billing.topUp': async ({ actor, body, req }) => {
    requirePermission(actor, 'credits.topUp');
    const amountUsd = Number(body.amountUsd);
    if (!Number.isInteger(amountUsd) || amountUsd < 5 || amountUsd > 5000) throw badRequest('Top-ups are whole dollars from $5 to $5000.', [{ code: 'invalid', message: 'Between 5 and 5000', path: ['amountUsd'] }]);
    // X credit is USD (X's own prices); organizations billed in Malaysia pay for it in ringgit at USD_MYR_RATE.
    const currency = currencyFor(await countryOf(actor.organizationId, req, true));
    const prov = await route(currency, 'once', body.provider);
    const credit = amountUsd * 100;
    const charge = currency === 'myr' ? usdToMyr(credit) : credit;
    const payment = await prisma.billingPayment.create({ data: { organizationId: actor.organizationId, provider: prov.kind, purpose: 'CREDIT_TOPUP', amountCents: charge, currency, creditCents: credit } });
    const url = await openCheckout(payment, prov);
    await audit(prisma, actor, 'billing.topUp', 'BillingPayment', payment.id, `Started a ${money(credit, 'usd')} X credit top-up${currency === 'myr' ? ` (${money(charge, 'myr')})` : ''} through ${prov.requested}`);
    return { url, ...providerOut(prov.kind, prov.requested), currency, amountCents: charge };
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
    return settlePayment(payment.id, { charged: { amount: p.payment?.amount ?? (p.status === 'preauthorized' ? 0 : p.purchase.total), currency: 'myr' }, token: p.is_recurring_token ? p.id : null, cardCountry: cardCountryOf(p), via: 'chip-callback' });
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

  // ?cardCountry=SG simulates a card issued abroad (the ringgit card-country flag).
  app.post<{ Params: { paymentId: string }; Querystring: { cardCountry?: string } }>('/mock-billing/:paymentId/pay', async (req, reply) => {
    const p = await mockPayment(req.params.paymentId);
    if (!p) return notFoundPage(reply);
    if (p.status !== 'PENDING') return reply.redirect(`/mock-billing/${p.id}`, 303);
    await settlePayment(p.id, { token: p.purpose === 'SUBSCRIPTION' && p.renewal === 'AUTO' ? `mock_tok_${p.id}` : null, cardCountry: req.query.cardCountry ?? null, via: 'mock' });
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
