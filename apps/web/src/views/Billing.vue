<script setup lang="ts">
import { computed, ref } from 'vue';
import { Check, CreditCard, ExternalLink, Wallet } from 'lucide-vue-next';
import PageHead from '@/components/PageHead.vue';
import QueryState from '@/components/QueryState.vue';
import StatusBadge from '@/components/StatusBadge.vue';
import Card from '@/components/ui/Card.vue';
import Button from '@/components/ui/Button.vue';
import Badge from '@/components/ui/Badge.vue';
import Input from '@/components/ui/Input.vue';
import Modal from '@/components/ui/Modal.vue';
import Table from '@/components/ui/Table.vue';
import Pager from '@/components/ui/Pager.vue';
import EmptyState from '@/components/ui/EmptyState.vue';
import { api } from '@/lib/api';
import { useQuery } from '@/lib/query';
import { loadOrg, session, timezone } from '@/lib/store';
import { formatDate, formatDateTime, formatNumber, usd, usdMicros } from '@/lib/format';
import { confirm } from '@/lib/confirm';
import { toast } from '@/lib/toast';

type Tier = 'FREE' | 'PRO' | 'BUSINESS' | 'ENTERPRISE';
interface Sub { plan: Tier; interval?: 'MONTHLY' | 'YEARLY'; status?: string; provider?: string; currentPeriodEnd?: string | null; trialEndsAt?: string | null; cancelAtPeriodEnd?: boolean; amountCents?: number; pendingPlan?: Tier | null }
interface Usage { used: number; limit: number; remaining: number }
interface Credit { balanceMicros: number; heldMicros: number; availableMicros: number; lowBalanceThresholdMicros: number; lowBalance: boolean }

// Mirrors the server's plan catalogue (apps/api/src/domain/plans.ts).
const PLANS: { tier: Tier; name: string; tagline: string; monthly: number | null; yearly: number | null; features: string[] }[] = [
  { tier: 'FREE', name: 'Free', tagline: 'For trying out', monthly: 0, yearly: 0, features: ['20 posts a month', '50 comments a month', '200 uploads', 'Up to 3 teams', 'All 15 networks'] },
  { tier: 'PRO', name: 'Pro', tagline: 'For power users', monthly: 10000, yearly: 9000, features: ['10,000 posts a month', '5,000 comments a month', '100,000 uploads', 'Unlimited teams', 'Analytics and history import'] },
  { tier: 'BUSINESS', name: 'Business', tagline: 'For growing businesses', monthly: 40000, yearly: 36000, features: ['100,000 posts a month', '50,000 comments a month', '1,000,000 uploads', 'Higher daily limits per network', 'Priority support'] },
  { tier: 'ENTERPRISE', name: 'Enterprise', tagline: 'For large organizations', monthly: null, yearly: null, features: ['1,000,000 posts a month', 'Custom limits and SLA', 'Invoicing and SSO', 'Dedicated support'] },
];
const ORDER: Tier[] = ['FREE', 'PRO', 'BUSINESS', 'ENTERPRISE'];

const sub = useQuery(() => api.get<Sub>('/billing/subscription'));
const usage = useQuery(async () => {
  const [posts, comments, uploads] = await Promise.all(['posts', 'comments', 'uploads'].map((k) => api.get<Usage>(`/organization/usage/${k}`)));
  return { posts: posts!, comments: comments!, uploads: uploads! };
});
const credit = useQuery(() => api.get<Credit>('/billing/credits/balance'));
const lOffset = ref(0);
const ledger = useQuery(() => api.get<{ items: { id: string; deltaMicroUsd: number; reason: string; action?: string | null; note?: string | null; createdAt?: string | null }[]; total: number }>('/billing/credits/ledger', { limit: 10, offset: lOffset.value }), { deps: [lOffset] });
const iOffset = ref(0);
const invoices = useQuery(() => api.get<{ items: { id: string; number: string; description?: string; amountCents: number; currency?: string; status?: string; pdfUrl?: string | null; hostedUrl?: string | null; createdAt?: string }[]; total: number }>('/billing/invoices', { limit: 10, offset: iOffset.value }), { deps: [iOffset] });

const interval = ref<'MONTHLY' | 'YEARLY'>('MONTHLY');
const busy = ref<string | null>(null);
const current = computed(() => sub.data.value?.plan ?? 'FREE');
const price = (p: (typeof PLANS)[number]) => (interval.value === 'YEARLY' ? p.yearly : p.monthly);
async function go(url: string) { window.location.href = url; }
async function checkout(tier: Tier) {
  busy.value = tier;
  try { const r = await api.post<{ url: string }>('/billing/checkout', { plan: tier, interval: interval.value }); await go(r.url); }
  catch (e) { toast.fail(e); busy.value = null; }
}
async function portal() {
  busy.value = 'portal';
  try { const r = await api.post<{ url: string }>('/billing/portal'); await go(r.url); } catch (e) { toast.fail(e); busy.value = null; }
}
async function cancel() {
  if (!(await confirm({ title: 'Cancel your subscription?', message: `You keep ${PLANS.find((p) => p.tier === current.value)?.name} until ${formatDate(sub.data.value?.currentPeriodEnd, timezone.value)}, then move to Free.`, confirmLabel: 'Cancel at period end', cancelLabel: 'Keep plan', danger: true }))) return;
  busy.value = 'cancel';
  try { await api.post('/billing/cancel'); await Promise.all([sub.reload(), loadOrg()]); toast.success('Subscription will end at the period end'); } catch (e) { toast.fail(e); } finally { busy.value = null; }
}
async function resume() {
  busy.value = 'resume';
  try { await api.post('/billing/resume'); await Promise.all([sub.reload(), loadOrg()]); toast.success('Subscription resumed'); } catch (e) { toast.fail(e); } finally { busy.value = null; }
}

// credit
const topUp = ref(false); const amount = ref<number | null>(25);
async function doTopUp() {
  busy.value = 'topup';
  try { const r = await api.post<{ url: string }>('/billing/credits/top-up', { amountUsd: amount.value }); await go(r.url); } catch (e) { toast.fail(e); busy.value = null; }
}
const threshold = ref<number | null>(null);
async function saveThreshold() {
  busy.value = 'threshold';
  try { await api.patch('/billing/credits/settings', { lowBalanceThresholdMicroUsd: Math.round((threshold.value ?? 0) * 1_000_000) }); await credit.reload(); toast.success('Alert threshold saved'); } catch (e) { toast.fail(e); } finally { busy.value = null; }
}
const pct = (u: Usage) => Math.min(100, Math.round((u.used / Math.max(1, u.limit)) * 100));
const meters = computed(() => (usage.data.value ? [{ l: 'Posts this month', u: usage.data.value.posts }, { l: 'Comments this month', u: usage.data.value.comments }, { l: 'Uploads', u: usage.data.value.uploads }] : []));
const lcols = [{ key: 'createdAt', label: 'When', width: '160px' }, { key: 'reason', label: 'Entry' }, { key: 'delta', label: 'Amount', align: 'right' as const, width: '130px' }];
const icols = [{ key: 'number', label: 'Invoice', width: '170px' }, { key: 'description', label: 'Description', hideSm: true }, { key: 'amountCents', label: 'Amount', align: 'right' as const, width: '110px' }, { key: 'status', label: 'Status', width: '100px' }, { key: 'links', label: '', width: '100px', align: 'right' as const }];
void session;
</script>

<template>
  <div class="page">
    <PageHead title="Billing" subtitle="Plan, usage, X pay-per-use credit and invoices for the whole organization." />
    <div class="stack-24">
      <!-- current plan -->
      <QueryState :loading="sub.loading.value" :error="sub.error.value" :status="sub.status.value" :has-data="!!sub.data.value" feature="Billing" skeleton="block" @retry="sub.reload">
        <Card v-if="sub.data.value" title="Current plan">
          <template #actions><StatusBadge :status="sub.data.value.status ?? 'active'" /></template>
          <div class="row wrap between" style="align-items: flex-start">
            <div>
              <div class="row"><span class="plan">{{ PLANS.find((p) => p.tier === sub.data.value!.plan)?.name }}</span><Badge v-if="sub.data.value.interval" size="sm">{{ sub.data.value.interval === 'YEARLY' ? 'Yearly' : 'Monthly' }}</Badge></div>
              <div v-if="sub.data.value.plan !== 'FREE'" class="muted small mt-8">{{ usd(sub.data.value.amountCents ?? 0) }} per {{ sub.data.value.interval === 'YEARLY' ? 'year' : 'month' }} · {{ sub.data.value.cancelAtPeriodEnd ? 'ends' : 'renews' }} {{ formatDate(sub.data.value.currentPeriodEnd, timezone) }}</div>
              <div v-if="sub.data.value.trialEndsAt" class="small mt-8">Trial ends {{ formatDate(sub.data.value.trialEndsAt, timezone) }}.</div>
              <div v-if="sub.data.value.provider === 'MOCK'" class="tiny faint mt-8">Test billing: no real money moves.</div>
            </div>
            <div class="row wrap">
              <Button v-if="sub.data.value.plan !== 'FREE'" :icon="CreditCard" :loading="busy === 'portal'" @click="portal">Payment method</Button>
              <Button v-if="sub.data.value.plan !== 'FREE' && sub.data.value.cancelAtPeriodEnd" variant="primary" :loading="busy === 'resume'" @click="resume">Resume subscription</Button>
              <Button v-else-if="sub.data.value.plan !== 'FREE'" variant="danger-ghost" :loading="busy === 'cancel'" @click="cancel">Cancel subscription</Button>
            </div>
          </div>
          <div v-if="sub.data.value.cancelAtPeriodEnd" class="callout warn mt-16">Your plan ends on {{ formatDate(sub.data.value.currentPeriodEnd, timezone) }}. Resume to keep it.</div>
          <div v-if="sub.data.value.status === 'past_due'" class="callout danger mt-16">The last payment failed. Update your payment method to keep your plan.</div>
        </Card>
      </QueryState>

      <!-- plans -->
      <section>
        <div class="row between wrap mb-16"><h2>Plans</h2><div class="pill-toggle"><button :class="{ on: interval === 'MONTHLY' }" @click="interval = 'MONTHLY'">Monthly</button><button :class="{ on: interval === 'YEARLY' }" @click="interval = 'YEARLY'">Yearly · save 10%</button></div></div>
        <div class="plans">
          <article v-for="p in PLANS" :key="p.tier" class="plan-card" :class="{ cur: p.tier === current }">
            <div class="row between"><h3>{{ p.name }}</h3><Badge v-if="p.tier === current" tone="accent" size="sm">Current</Badge></div>
            <div class="muted small">{{ p.tagline }}</div>
            <div class="amt"><template v-if="price(p) === null">Custom</template><template v-else>{{ usd(price(p)!) }}<span class="per"> / month</span></template></div>
            <ul class="list-plain stack"><li v-for="f in p.features" :key="f" class="row small" style="align-items: flex-start"><Check :size="14" class="ok" />{{ f }}</li></ul>
            <div style="margin-top: auto">
              <Button v-if="p.tier === 'ENTERPRISE'" block href="mailto:hello@ffdev.studio?subject=Siar%20Enterprise">Contact us</Button>
              <Button v-else-if="p.tier === current" block disabled>Your plan</Button>
              <Button v-else-if="p.tier === 'FREE'" block variant="secondary" :disabled="current === 'FREE'" @click="cancel">Downgrade to Free</Button>
              <Button v-else block variant="primary" :loading="busy === p.tier" @click="checkout(p.tier)">{{ ORDER.indexOf(p.tier) > ORDER.indexOf(current) ? 'Upgrade' : 'Switch' }} to {{ p.name }}</Button>
            </div>
          </article>
        </div>
      </section>

      <!-- usage -->
      <Card title="Usage">
        <QueryState :loading="usage.loading.value" :error="usage.error.value" :status="usage.status.value" :has-data="!!usage.data.value" feature="Usage" skeleton="block" @retry="usage.reload">
          <div class="stack-16"><div v-for="m in meters" :key="m.l"><div class="row between small"><span>{{ m.l }}</span><span class="muted">{{ formatNumber(m.u.used) }} of {{ formatNumber(m.u.limit) }}</span></div><div class="meter" :class="{ hot: pct(m.u) >= 90 }"><i :style="{ width: `${pct(m.u)}%` }" /></div></div></div>
        </QueryState>
      </Card>

      <!-- credit -->
      <Card title="X (Twitter) credit" subtitle="Posting to X is billed pay per use by X itself. Credit is held while a post publishes and charged when it succeeds.">
        <template #actions><Button variant="primary" :icon="Wallet" @click="topUp = true">Top up</Button></template>
        <QueryState :loading="credit.loading.value" :error="credit.error.value" :status="credit.status.value" :has-data="!!credit.data.value" feature="Credit" skeleton="block" @retry="credit.reload">
          <div v-if="credit.data.value" class="stack-16">
            <div class="grid-3"><div class="stat"><div class="l">Available</div><div class="v">{{ usdMicros(credit.data.value.availableMicros) }}</div></div><div class="stat"><div class="l">Balance</div><div class="v">{{ usdMicros(credit.data.value.balanceMicros) }}</div></div><div class="stat"><div class="l">Held for publishing</div><div class="v">{{ usdMicros(credit.data.value.heldMicros) }}</div></div></div>
            <div v-if="credit.data.value.lowBalance" class="callout warn">Credit is running low. X posts fail when it reaches zero.</div>
            <form class="row wrap" style="align-items: flex-end" @submit.prevent="saveThreshold"><div style="width: 220px"><Input v-model="threshold" type="number" size="sm" label="Warn me below (USD)" :placeholder="String(credit.data.value.lowBalanceThresholdMicros / 1_000_000)" /></div><Button type="submit" size="sm" :loading="busy === 'threshold'" :disabled="threshold === null">Save</Button></form>
            <Table :columns="lcols" :rows="ledger.data.value?.items ?? []" :loading="ledger.loading.value">
              <template #cell-createdAt="{ row }"><span class="small">{{ formatDateTime(row.createdAt, timezone) }}</span></template>
              <template #cell-reason="{ row }"><span class="strong">{{ row.reason.toLowerCase() }}</span> <span class="muted small">{{ row.action ? row.action.replace(/_/g, ' ').toLowerCase() : row.note }}</span></template>
              <template #cell-delta="{ row }"><span :class="row.deltaMicroUsd < 0 ? '' : 'success-text'">{{ row.deltaMicroUsd > 0 ? '+' : '' }}{{ usdMicros(row.deltaMicroUsd) }}</span></template>
              <template #empty><EmptyState compact title="No credit activity" /></template>
            </Table>
            <Pager v-if="ledger.data.value" :total="ledger.data.value.total" :limit="10" v-model:offset="lOffset" />
          </div>
        </QueryState>
      </Card>

      <!-- invoices -->
      <Card title="Invoices" :padded="false">
        <QueryState :loading="invoices.loading.value" :error="invoices.error.value" :status="invoices.status.value" :has-data="!!invoices.data.value" feature="Invoices" @retry="invoices.reload">
          <Table :columns="icols" :rows="invoices.data.value?.items ?? []">
            <template #cell-amountCents="{ row }">{{ usd(row.amountCents, row.currency ?? 'usd') }}</template>
            <template #cell-status="{ row }"><StatusBadge :status="row.status" size="sm" /></template>
            <template #cell-links="{ row }"><a v-if="row.hostedUrl || row.pdfUrl" :href="row.pdfUrl ?? row.hostedUrl ?? ''" target="_blank" rel="noopener" class="row gap-4" style="justify-content: flex-end">View <ExternalLink :size="12" /></a></template>
            <template #empty><EmptyState compact title="No invoices yet" description="Invoices appear here after your first payment." /></template>
          </Table>
          <div style="padding: 0 16px 16px"><Pager v-if="invoices.data.value" :total="invoices.data.value.total" :limit="10" v-model:offset="iOffset" /></div>
        </QueryState>
      </Card>
    </div>

    <Modal :open="topUp" title="Top up X credit" size="sm" @close="topUp = false">
      <form class="stack-16" @submit.prevent="doTopUp">
        <Input v-model="amount" type="number" label="Amount (USD)" prefix="$" required help="Between $5 and $5,000." autofocus />
        <div class="row wrap"><Button v-for="a in [10, 25, 50, 100]" :key="a" size="sm" @click="amount = a">${{ a }}</Button></div>
        <div class="row" style="justify-content: flex-end"><Button variant="secondary" @click="topUp = false">Cancel</Button><Button type="submit" variant="primary" :loading="busy === 'topup'" :disabled="!amount || amount < 5 || amount > 5000">Continue to payment</Button></div>
      </form>
    </Modal>
  </div>
</template>

<style scoped>
.plan { font-size: var(--fs-24); line-height: 32px; font-weight: 600; }
.plans { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
@media (max-width: 1100px) { .plans { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 640px) { .plans { grid-template-columns: minmax(0, 1fr); } }
.plan-card { border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 20px; background: var(--bg); display: flex; flex-direction: column; gap: 12px; }
.plan-card.cur { border-color: var(--accent); box-shadow: 0 0 0 1px var(--accent); }
.amt { font-size: var(--fs-30); line-height: 36px; font-weight: 600; }
.per { font-size: var(--fs-14); font-weight: 400; color: var(--text-subtle); }
.ok { color: var(--success); flex: none; margin-top: 3px; }
.meter { height: 8px; border-radius: 4px; background: var(--bg-muted); overflow: hidden; margin-top: 6px; }
.meter i { display: block; height: 100%; background: var(--accent); border-radius: 4px; }
.meter.hot i { background: var(--danger); }
</style>
