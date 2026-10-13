import { createVerify } from 'node:crypto';
import { apiUrl, config } from '../platform/config.js';
import { unavailable, upstream } from '../platform/errors.js';
import { logger } from '../platform/logger.js';

/**
 * CHIP Collect (gate.chip-in.asia), live only — adapted from FF Ops' platform/chip.ts. In
 * BILLING_MODE=mock the local mock provider stands in for it (billing-mock.ts).
 *
 * CHIP has no subscription object we rely on: a purchase made with `force_recurring` saves the
 * card, its id becomes the recurring token, and Siar charges each period itself
 * (POST /purchases/{new}/charge/) from the renewal cron. Callbacks are RSA-signed (X-Signature)
 * and verified with CHIP's public key; the purchase is read back from CHIP before anything is applied.
 */

export interface ChipPurchase {
  id: string;
  status: string;
  is_test: boolean;
  is_recurring_token: boolean;
  recurring_token: string | null;
  client_id: string | null;
  purchase: { total: number; currency: string; products: { name: string; price: number; quantity?: number | string }[]; metadata?: Record<string, string> };
  payment: { amount: number; net_amount: number; fee_amount: number; paid_on: number | null } | null;
  transaction_data: { payment_method: string; extra: Record<string, any>; attempts?: { successful: boolean; error?: { code: string; message: string } | null }[] };
  reference: string;
  checkout_url: string | null;
  event_type?: string;
}

export interface PurchaseIn {
  reference: string;
  products: { name: string; price: number; quantity?: number }[];
  clientId?: string | null;
  client?: { email: string; full_name?: string | null } | null;
  /** Save the card: this purchase's id becomes the recurring token. */
  saveCard?: boolean;
  /** Card change / trial start without a charge: a zero preauthorisation that saves the card. */
  preauthorise?: boolean;
  metadata: Record<string, string>;
  successUrl: string;
  failureUrl?: string;
  cancelUrl?: string;
}

export type ChargeResult =
  | { status: 'paid'; purchase: ChipPurchase }
  | { status: 'pending'; purchase: ChipPurchase }
  | { status: 'failed'; reason: string; code: string; tokenInvalid: boolean };

/** A purchase status that means the money is ours. */
export const PAID = new Set(['paid', 'cleared', 'settled', 'refunded', 'pending_refund', 'chargeback']);
const CARD_METHODS = new Set(['visa', 'mastercard', 'maestro', 'mpgs_apple_pay', 'mpgs_google_pay']);

/** The paying card's issuing country, when CHIP reports one (field names vary by acquirer). */
export function cardCountryOf(p: ChipPurchase): string | null {
  const extra = p.transaction_data?.extra ?? {};
  for (const k of ['card_issuer_country', 'issuer_country', 'card_country', 'country']) {
    const v = extra[k];
    if (typeof v === 'string' && /^[A-Za-z]{2}$/.test(v)) return v.toUpperCase();
  }
  return null;
}

export function failureOf(p: ChipPurchase): { code: string; message: string } {
  const a = [...(p.transaction_data?.attempts ?? [])].find(x => !x.successful && x.error);
  return { code: a?.error?.code ?? 'unknown', message: a?.error?.message ?? 'The payment was declined.' };
}

/** CHIP error bodies nest messages by field: { purchase: { products: [{ message }] } } or { __all__: [...] }. */
function chipMessage(body: unknown): { message: string; code: string } {
  const out: { message: string; code: string }[] = [];
  const walk = (v: unknown, path: string) => {
    if (Array.isArray(v)) v.forEach(x => walk(x, path));
    else if (v && typeof v === 'object') {
      const o = v as Record<string, unknown>;
      if (typeof o.message === 'string') out.push({ message: path && path !== '__all__' ? `${path}: ${o.message}` : o.message, code: String(o.code ?? '') });
      else for (const [k, x] of Object.entries(o)) walk(x, path ? `${path}.${k}` : k);
    } else if (typeof v === 'string') out.push({ message: path ? `${path}: ${v}` : v, code: '' });
  };
  walk(body, '');
  return out.length ? { message: out.map(o => o.message).join('; '), code: out[0].code } : { message: 'CHIP refused the request.', code: '' };
}

export class ChipApiError extends Error {
  constructor(readonly status: number, readonly code: string, message: string, readonly body: unknown) { super(message); }
}

/** Verify CHIP's X-Signature: base64 RSA PKCS#1 v1.5 over SHA-256 of the raw body. */
export function verifySignature(raw: Buffer, signature: string, pems: string[]): boolean {
  for (const pem of pems) {
    try {
      const v = createVerify('RSA-SHA256');
      v.update(raw);
      if (v.verify(pem, signature, 'base64')) return true;
    } catch { /* malformed key: try the next */ }
  }
  return false;
}

export const chipConfigured = () => !!(config.CHIP_SECRET_KEY && config.CHIP_BRAND_ID);

async function api<T>(method: 'GET' | 'POST', path: string, body?: unknown): Promise<T> {
  if (!chipConfigured()) throw unavailable('CHIP is not configured on this server (CHIP_SECRET_KEY, CHIP_BRAND_ID).');
  let res: Response;
  try {
    res = await fetch(`${config.CHIP_API_URL.replace(/\/$/, '')}${path}`, {
      method, signal: AbortSignal.timeout(25_000),
      headers: { authorization: `Bearer ${config.CHIP_SECRET_KEY}`, 'content-type': 'application/json', accept: 'application/json' },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
  } catch (err) {
    logger.error({ err, path }, 'chip unreachable');
    throw upstream('CHIP could not be reached. Try again in a minute.');
  }
  const text = await res.text();
  let json: unknown = null;
  try { json = text ? JSON.parse(text) : null; } catch { json = text; }
  if (!res.ok) {
    const m = chipMessage(json);
    logger.warn({ path, status: res.status, body: json }, 'chip refused');
    throw new ChipApiError(res.status, m.code, m.message, json);
  }
  return json as T;
}
const wrap = async <T>(fn: () => Promise<T>) => {
  try { return await fn(); } catch (err) {
    if (err instanceof ChipApiError) throw upstream(`CHIP: ${err.message}`);
    throw err;
  }
};

const methodCache = new Map<string, { at: number; list: string[] }>();
/** Card methods that can be saved (recurring) or preauthorised on this brand. */
async function cardMethods(kind: 'card' | 'preauth', amount: number) {
  const q = new URLSearchParams({ brand_id: config.CHIP_BRAND_ID, currency: 'MYR', amount: String(Math.max(amount, 1000)) });
  if (kind === 'card') q.set('recurring', 'true');
  else q.set('preauthorization', 'true');
  const key = q.toString();
  let hit = methodCache.get(key);
  if (!hit || Date.now() - hit.at > 30 * 60_000) {
    const r = await api<{ available_payment_methods: string[] }>('GET', `/payment_methods/?${key}`);
    hit = { at: Date.now(), list: (r.available_payment_methods ?? []).filter(m => CARD_METHODS.has(m) || kind === 'preauth') };
    methodCache.set(key, hit);
  }
  if (!hit.list.length) throw upstream('Card payments that can be saved are not enabled on this CHIP brand. Ask CHIP to enable recurring card payments.');
  return hit.list;
}

/**
 * Can this CHIP brand take this kind of payment right now? CHIP approves payment methods per brand,
 * so a configured brand may still have none open. Checkout routes ringgit payments to CHIP only
 * when this says yes (Stripe otherwise). Errors count as "no".
 *   card — a card that can be saved for renewals (monthly / yearly AUTO)
 *   bank — anything paid once: FPX, DuitNow, e-wallets, cards (yearly LINK)
 */
export async function chipAccepts(kind: 'card' | 'bank'): Promise<boolean> {
  if (!chipConfigured()) return false;
  try {
    if (kind === 'card') return (await cardMethods('card', 1000)).length > 0;
    const q = new URLSearchParams({ brand_id: config.CHIP_BRAND_ID, currency: 'MYR', amount: '1000' });
    const key = q.toString();
    let hit = methodCache.get(key);
    if (!hit || Date.now() - hit.at > 30 * 60_000) {
      const r = await api<{ available_payment_methods: string[] }>('GET', `/payment_methods/?${key}`);
      hit = { at: Date.now(), list: r.available_payment_methods ?? [] };
      methodCache.set(key, hit);
    }
    return hit.list.some(m => !CARD_METHODS.has(m));
  } catch { return false; }
}

export const callbackUrl = () => apiUrl('/api/v1/billing/chip/callback');

export const chip = {
  ensureClient: (c: { name: string; email: string | null; chipClientId: string | null }) => wrap(async () => {
    if (c.chipClientId) return c.chipClientId;
    if (!c.email) return null;
    return (await api<{ id: string }>('POST', '/clients/', { email: c.email, full_name: c.name.slice(0, 1000) })).id;
  }),
  createPurchase: (o: PurchaseIn) => wrap(async () => {
    const total = o.products.reduce((t, p) => t + p.price * (p.quantity ?? 1), 0);
    const whitelist = o.preauthorise ? await cardMethods('preauth', 1000) : o.saveCard ? await cardMethods('card', total) : undefined;
    return api<ChipPurchase>('POST', '/purchases/', {
      brand_id: config.CHIP_BRAND_ID,
      ...(o.clientId ? { client_id: o.clientId } : { client: { email: o.client!.email, ...(o.client!.full_name ? { full_name: o.client!.full_name } : {}) } }),
      purchase: {
        currency: 'MYR', language: 'en', timezone: 'Asia/Kuala_Lumpur', metadata: o.metadata,
        products: o.products.map(p => ({ name: p.name.slice(0, 256), price: p.price, quantity: p.quantity ?? 1 })),
        ...(o.preauthorise ? { total_override: 0 } : {}),
      },
      reference: o.reference.slice(0, 128), platform: 'api', creator_agent: 'Siar',
      success_redirect: o.successUrl, failure_redirect: o.failureUrl ?? o.successUrl, cancel_redirect: o.cancelUrl ?? o.successUrl,
      success_callback: callbackUrl(),
      ...(o.saveCard || o.preauthorise ? { force_recurring: true } : {}),
      ...(o.preauthorise ? { skip_capture: true } : {}),
      ...(whitelist ? { payment_method_whitelist: whitelist } : {}),
    });
  }),
  getPurchase: (id: string) => wrap(() => api<ChipPurchase>('GET', `/purchases/${encodeURIComponent(id)}/`)),
  async charge(id: string, token: string): Promise<ChargeResult> {
    try {
      const r = await api<ChipPurchase>('POST', `/purchases/${id}/charge/`, { recurring_token: token });
      if (PAID.has(r.status)) return { status: 'paid', purchase: r };
      if (r.status === 'pending_charge') return { status: 'pending', purchase: r };
      const f = failureOf(r);
      return { status: 'failed', reason: f.message, code: f.code, tokenInvalid: f.code === 'recurring_token_expired' };
    } catch (err) {
      if (!(err instanceof ChipApiError)) throw err;
      if (err.code === 'invalid_recurring_token') return { status: 'failed', reason: 'The saved card is no longer valid.', code: err.code, tokenInvalid: true };
      const fresh = await api<ChipPurchase>('GET', `/purchases/${id}/`).catch(() => null);
      const f = fresh ? failureOf(fresh) : { code: err.code, message: err.message };
      return { status: 'failed', reason: f.message, code: f.code, tokenInvalid: f.code === 'recurring_token_expired' };
    }
  },
  cancelPurchase: (id: string) => wrap(async () => { await api('POST', `/purchases/${id}/cancel/`).catch(e => { if (!(e instanceof ChipApiError)) throw e; }); }),
  deleteToken: (id: string) => wrap(async () => { await api('POST', `/purchases/${id}/delete_recurring_token/`).catch(e => { if (!(e instanceof ChipApiError)) throw e; }); }),
};

let companyKey: { at: number; pem: string } | null = null;
/** PEM keys a callback may be signed with (CHIP's company public key, cached 6 h). */
export async function chipPublicKeys(): Promise<string[]> {
  if (!companyKey || Date.now() - companyKey.at > 6 * 3600_000) {
    try { companyKey = { at: Date.now(), pem: await api<string>('GET', '/public_key/') }; } catch (err) { logger.error({ err }, 'chip public key fetch failed'); }
  }
  return companyKey ? [companyKey.pem.replace(/\\n/g, '\n').trim()] : [];
}
