import { PLANS } from '../domain/plans.js';
import { chargedAmount, chargedCurrency, money } from './billing-core.js';

/**
 * The local stand-in for a provider's hosted checkout (BILLING_MODE=mock). "Pay" and "Decline"
 * post back to /mock-billing/:paymentId/{pay,decline}, which settle through the same function a
 * CHIP callback or Stripe webhook reaches. No money moves.
 */
const esc = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

export function describePayment(p: { purpose: string; tier: string | null; billingInterval: string | null; amountCents: number }) {
  if (p.purpose === 'CREDIT_TOPUP') return 'X credit top-up';
  if (!p.tier) return 'Save a card for renewals';
  const name = PLANS[p.tier as keyof typeof PLANS]?.name ?? p.tier;
  const per = p.billingInterval === 'YEARLY' ? 'yearly' : 'monthly';
  return p.amountCents === 0 ? `Siar ${name} (${per}), free trial` : `Siar ${name} (${per})`;
}

export function mockCheckoutPage(p: { id: string; purpose: string; tier: string | null; billingInterval: string | null; amountCents: number; status: string; provider: any; providerRef: string | null }) {
  const currency = chargedCurrency(p);
  const charged = chargedAmount(p.amountCents, currency);
  const via = p.providerRef?.startsWith('mock_chip_') ? 'CHIP (simulated)' : 'Stripe (simulated)';
  const open = p.status === 'PENDING';
  const body = open
    ? `<form method="post" action="/mock-billing/${esc(p.id)}/pay"><button class="primary" type="submit">Pay ${esc(money(charged, currency))}</button></form>
       <form method="post" action="/mock-billing/${esc(p.id)}/decline"><button class="secondary" type="submit">Decline</button></form>`
    : `<p class="state">This checkout is ${esc(p.status.toLowerCase())}.</p>`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Test checkout · Siar</title>
<style>
:root{--bg:#F3EFE4;--card:#FBFAF6;--ink:#0F0F0E;--muted:#625F57;--line:#DCD6C9;--accent:#121211;--accent-ink:#FFFFFF}
@media (prefers-color-scheme:dark){:root{--bg:#0F0F0E;--card:#171716;--ink:#EDECE8;--muted:#A3A19A;--line:#2A2A27;--accent:#EDECE8;--accent-ink:#121211}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.5 Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif}
main{max-width:420px;margin:0 auto;padding:48px 16px}
.card{background:var(--card);border:1px solid var(--line);border-radius:8px;padding:24px}
.tag{display:inline-block;font-size:12px;color:var(--muted);border:1px solid var(--line);border-radius:8px;padding:2px 8px;margin-bottom:16px}
h1{font-size:20px;margin:0 0 4px;font-weight:600}p{margin:0 0 16px;color:var(--muted)}
.amount{font-size:32px;font-weight:600;letter-spacing:-.02em;margin:8px 0 24px;color:var(--ink)}
button{width:100%;font:inherit;font-weight:600;border-radius:8px;padding:12px 16px;cursor:pointer;margin-top:8px}
.primary{background:var(--accent);color:var(--accent-ink);border:1px solid var(--accent)}.secondary{background:transparent;color:var(--ink);border:1px solid var(--line)}
.state{color:var(--ink)}footer{margin-top:24px;font-size:12px;color:var(--muted);text-align:center}
</style></head><body><main><div class="card">
<span class="tag">Test mode · ${esc(via)} · no money moves</span>
<h1>${esc(describePayment(p))}</h1>
<p>Payment ${esc(p.id)}</p>
<div class="amount">${esc(money(charged, currency))}</div>
${body}
</div><footer>Siar by FF Dev Studio</footer></main></body></html>`;
}
