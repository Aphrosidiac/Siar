<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { ArrowLeft, Download, ExternalLink, Printer } from 'lucide-vue-next';
import QueryState from '@/components/QueryState.vue';
import StatusBadge from '@/components/StatusBadge.vue';
import Logo from '@/components/Logo.vue';
import Button from '@/components/ui/Button.vue';
import { api } from '@/lib/api';
import { useQuery } from '@/lib/query';
import { timezone } from '@/lib/store';
import { formatDate, money as fmtMoney } from '@/lib/format';
import type { InvoiceDocument } from '@/lib/types';

const route = useRoute();
const inv = useQuery(() => api.get<InvoiceDocument>(`/billing/invoices/${route.params.id}`));
const d = computed(() => inv.data.value);
const money = (c: number) => fmtMoney(c, d.value?.currency ?? 'usd');
const period = (a?: string | null, b?: string | null) => (a && b ? `${formatDate(a, timezone.value)} – ${formatDate(b, timezone.value)}` : '');
const kind = computed(() => (d.value?.status === 'paid' ? 'Receipt' : 'Invoice'));
function print() {
  const t = document.title; document.title = `Siar ${d.value?.number ?? 'invoice'}`;
  window.print(); document.title = t;
}
</script>

<template>
  <div class="page inv-page">
    <div class="inv-bar no-print">
      <Button variant="ghost" size="sm" :icon="ArrowLeft" to="/billing?tab=invoices">Invoices</Button>
      <span class="grow" />
      <Button v-if="d?.hostedUrl" size="sm" :icon-right="ExternalLink" :href="d.hostedUrl" target="_blank">Open in Stripe</Button>
      <Button v-if="d?.pdfUrl" size="sm" :icon="Download" :href="d.pdfUrl" target="_blank">PDF</Button>
      <Button size="sm" variant="primary" :icon="Printer" :disabled="!d" @click="print">Print or save as PDF</Button>
    </div>

    <QueryState :loading="inv.loading.value" :error="inv.error.value" :status="inv.status.value" :has-data="!!d" feature="This invoice" skeleton="block" @retry="inv.reload">
      <article v-if="d" class="doc">
        <header class="doc-top">
          <div><Logo :size="24" /><div class="tiny muted mt-8">{{ d.issuer.name }} ({{ d.issuer.registration }})<br />{{ d.issuer.country }} · {{ d.issuer.email }}</div></div>
          <div class="doc-id">
            <div class="label">{{ kind }}</div>
            <div class="doc-no">{{ d.number }}</div>
            <StatusBadge :status="d.status" size="sm" />
          </div>
        </header>

        <section class="doc-meta">
          <div>
            <div class="label">Billed to</div>
            <template v-if="d.billTo"><div class="strong">{{ d.billTo.name }}</div><div v-if="d.billTo.address" class="addr small">{{ d.billTo.address }}</div><div v-if="d.billTo.email" class="small muted">{{ d.billTo.email }}</div><div v-if="d.billTo.taxId" class="small muted">Tax ID {{ d.billTo.taxId }}</div></template>
            <div v-else class="small muted">Not recorded</div>
          </div>
          <dl class="kv">
            <dt>Issued</dt><dd>{{ formatDate(d.createdAt, timezone) }}</dd>
            <template v-if="d.paidAt"><dt>Paid</dt><dd>{{ formatDate(d.paidAt, timezone) }}</dd></template>
            <template v-if="d.periodStart"><dt>Service period</dt><dd>{{ period(d.periodStart, d.periodEnd) }}</dd></template>
            <template v-if="d.paymentMethod"><dt>Payment method</dt><dd>{{ d.paymentMethod }}</dd></template>
          </dl>
        </section>

        <table class="lines">
          <thead><tr><th>Description</th><th class="r">Qty</th><th class="r">Unit price</th><th class="r">Amount</th></tr></thead>
          <tbody>
            <tr v-for="(l, i) in d.lines" :key="i">
              <td><div class="strong">{{ l.description }}</div><div v-if="l.periodStart" class="tiny muted">{{ period(l.periodStart, l.periodEnd) }}</div></td>
              <td class="r num">{{ l.quantity }}</td><td class="r num">{{ money(l.unitAmountCents) }}</td><td class="r num">{{ money(l.amountCents) }}</td>
            </tr>
          </tbody>
        </table>

        <div class="totals">
          <dl>
            <dt>Subtotal</dt><dd class="num">{{ money(d.subtotalCents) }}</dd>
            <dt class="tot">Total</dt><dd class="num tot">{{ money(d.totalCents) }}</dd>
            <dt>Amount paid</dt><dd class="num">{{ money(d.amountPaidCents) }}</dd>
            <dt class="strong">Amount due</dt><dd class="num strong">{{ money(d.amountDueCents) }}</dd>
          </dl>
        </div>

        <footer class="doc-foot tiny muted">
          <span v-if="d.provider === 'MOCK'">Test billing: no money moved for this invoice.</span>
          <span v-else>Questions about this invoice? Write to {{ d.issuer.email }} and quote {{ d.number }}.</span>
          <span>{{ d.issuer.product }} by FF Dev Studio · {{ d.issuer.website }}</span>
        </footer>
      </article>
    </QueryState>
  </div>
</template>

<style scoped>
.inv-page { max-width: 880px; }
.inv-bar { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
.doc { background: var(--bg-elevated); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 48px; display: flex; flex-direction: column; gap: 36px; }
.doc-top { display: flex; justify-content: space-between; gap: 24px; align-items: flex-start; padding-bottom: 28px; border-bottom: 1px solid var(--text); }
.doc-id { text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
.doc-no { font-family: var(--mono); font-size: var(--fs-18); font-weight: 500; letter-spacing: .02em; }
.doc-meta { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 24px; }
.doc-meta .label { margin-bottom: 8px; }
.addr { white-space: pre-line; color: var(--text-muted); margin: 2px 0; }
.kv { display: grid; grid-template-columns: auto 1fr; gap: 6px 20px; font-size: var(--fs-13); align-content: start; }
.kv dt { color: var(--text-subtle); } .kv dd { text-align: right; font-variant-numeric: tabular-nums; }
.lines { width: 100%; border-collapse: collapse; font-size: var(--fs-14); }
.lines th { font-family: var(--mono); font-size: var(--fs-11); font-weight: 500; text-transform: uppercase; letter-spacing: .06em; color: var(--text-subtle); text-align: left; padding: 0 0 10px; border-bottom: 1px solid var(--text); }
.lines td { padding: 14px 0; border-bottom: 1px solid var(--border-soft); vertical-align: top; }
.lines .r { text-align: right; padding-left: 16px; white-space: nowrap; }
.num { font-variant-numeric: tabular-nums; }
.totals { display: flex; justify-content: flex-end; }
.totals dl { display: grid; grid-template-columns: auto auto; gap: 8px 0; min-width: 280px; font-size: var(--fs-14); }
.totals dt { color: var(--text-subtle); } .totals dd { text-align: right; padding-left: 40px; }
.totals .tot { padding-top: 10px; border-top: 1px solid var(--border); font-weight: 600; color: var(--text); }
.doc-foot { display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap; padding-top: 20px; border-top: 1px solid var(--border-soft); }
@media (max-width: 640px) {
  .doc { padding: 20px; gap: 24px; }
  .doc-top, .doc-meta { grid-template-columns: minmax(0, 1fr); flex-direction: column; }
  .doc-id { text-align: left; align-items: flex-start; }
  .lines th:nth-child(2), .lines td:nth-child(2), .lines th:nth-child(3), .lines td:nth-child(3) { display: none; }
  .totals dl { min-width: 0; width: 100%; }
}
@media print {
  .inv-page { max-width: none; padding: 0; }
  .doc { border: 0; padding: 0; background: #fff; color: #0b0b0a; }
}
</style>
