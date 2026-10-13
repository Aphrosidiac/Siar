<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Check, ChevronRight, CreditCard, Wallet } from 'lucide-vue-next';
import SettingsSection from '@/components/settings/SettingsSection.vue';
import SaveBar from '@/components/settings/SaveBar.vue';
import Tabs from '@/components/ui/Tabs.vue';
import { useDraft } from '@/lib/dirty';
import type { Invoice, Tier } from '@/lib/types';
import PageHead from '@/components/PageHead.vue';
import QueryState from '@/components/QueryState.vue';
import StatusBadge from '@/components/StatusBadge.vue';
import Card from '@/components/ui/Card.vue';
import Button from '@/components/ui/Button.vue';
import Badge from '@/components/ui/Badge.vue';
import Input from '@/components/ui/Input.vue';
import Select from '@/components/ui/Select.vue';
import Modal from '@/components/ui/Modal.vue';
import Table from '@/components/ui/Table.vue';
import Pager from '@/components/ui/Pager.vue';
import EmptyState from '@/components/ui/EmptyState.vue';
import { api } from '@/lib/api';
import { useQuery } from '@/lib/query';
import { loadOrg, session, timezone } from '@/lib/store';
import { formatDate, formatDateTime, formatNumber, money, planMoney, usdMicros } from '@/lib/format';
import { confirm } from '@/lib/confirm';
import { toast } from '@/lib/toast';

type Interval = 'MONTHLY' | 'YEARLY';
interface Sub { plan: Tier; interval?: Interval | null; status?: string | null; provider?: string | null; currentPeriodEnd?: string | null; trialEndsAt?: string | null; cancelAtPeriodEnd?: boolean; amountCents?: number; currency?: string; renewal?: 'AUTO' | 'LINK' | null; priceLocked?: boolean; pendingPlan?: Tier | null; nextRetryAt?: string | null }
interface Usage { used: number; limit: number; remaining: number; resets?: boolean }
interface Credit { balanceMicros: number; heldMicros: number; availableMicros: number; lowBalanceThresholdMicros: number; lowBalance: boolean }
// GET /billing/plans: the catalogue for this organization's billing country (apps/api/src/domain/plans.ts).
interface PlanRow { tier: Tier; name: string; tagline: string; currency: string; price: { monthly: number; yearly: number } | null; oneTime: boolean; trial: boolean; posts: number; comments: number; uploads: number; teams: number | null; analytics: boolean; dmsPerAccount: number }
interface PlanList { country: string | null; detectedCountry: string | null; currency: string; teamsInUse: number; trialDays: number; methods: { card: boolean; bank: boolean }; plans: PlanRow[] }

const ORDER: Tier[] = ['FREE', 'STARTER', 'PRO', 'BUSINESS', 'ENTERPRISE'];
const NAMES: Record<Tier, string> = { FREE: 'Free', STARTER: 'Starter', PRO: 'Pro', BUSINESS: 'Business', ENTERPRISE: 'Enterprise' };
const EXTRAS: Partial<Record<Tier, string[]>> = { ENTERPRISE: ['Custom limits and SLA', 'Paid by invoice'] };
const POPULAR: Tier = 'PRO';

const sub = useQuery(() => api.get<Sub>('/billing/subscription'));
const plansQ = useQuery(() => api.get<PlanList>('/billing/plans'));
const usage = useQuery(async () => {
  const [posts, comments, uploads] = await Promise.all(['posts', 'comments', 'uploads'].map((k) => api.get<Usage>(`/organization/usage/${k}`)));
  return { posts: posts!, comments: comments!, uploads: uploads! };
});
const credit = useQuery(() => api.get<Credit>('/billing/credits/balance'));
const lOffset = ref(0);
const ledger = useQuery(() => api.get<{ items: { id: string; deltaMicroUsd: number; reason: string; action?: string | null; note?: string | null; createdAt?: string | null }[]; total: number }>('/billing/credits/ledger', { limit: 10, offset: lOffset.value }), { deps: [lOffset] });
const iOffset = ref(0);
const invoices = useQuery(() => api.get<{ items: Invoice[]; total: number }>('/billing/invoices', { limit: 12, offset: iOffset.value }), { deps: [iOffset] });

// tabs (?tab= so receipts and checkout returns land on the right one)
const route = useRoute(); const router = useRouter();
const TABS = [{ value: 'overview', label: 'Overview' }, { value: 'plans', label: 'Plans' }, { value: 'credits', label: 'X credit' }, { value: 'invoices', label: 'Invoices' }, { value: 'details', label: 'Billing details' }];
const tab = ref(TABS.some((t) => t.value === route.query.tab) ? String(route.query.tab) : 'overview');
watch(tab, (t) => void router.replace({ query: { ...route.query, tab: t === 'overview' ? undefined : t, checkout: undefined, topup: undefined, changed: undefined, downgrade: undefined, renew: undefined } }));
onMounted(() => {
  const q = route.query;
  if (q.checkout === 'success') toast.success('Payment received', 'Your plan is active.');
  if (q.checkout === 'canceled') toast.info('Checkout canceled', 'Nothing was charged.');
  if (q.topup === 'success') toast.success('Credit added');
  if (q.topup === 'canceled') toast.info('Top-up canceled', 'Nothing was charged.');
  if (q.changed === '1') toast.success('Plan changed');
  if (q.downgrade === 'scheduled') toast.info('Change scheduled', 'Your plan changes at the end of the period.');
});

// billing details (printed on invoices). The country decides the price list: Malaysia pays in ringgit, everywhere else in USD.
interface DetForm { name: string; email: string; address: string; taxId: string; choice: 'MY' | 'OTHER'; code: string }
const det = useDraft<DetForm>({ name: '', email: '', address: '', taxId: '', choice: 'MY', code: '' });
const COUNTRY_OPTIONS = [{ value: 'MY', label: 'Malaysia (prices in ringgit)' }, { value: 'OTHER', label: 'Another country (prices in USD)' }];
let detected: string | null = null;
let countryInit = 'MY';
const detQ = useQuery(async () => {
  const d = await api.get<{ name: string | null; email: string | null; address: string | null; taxId: string | null; country?: string | null; detectedCountry?: string | null }>('/billing/details');
  detected = d.detectedCountry?.toUpperCase() ?? null;
  countryInit = (d.country ?? d.detectedCountry ?? 'MY').toUpperCase();
  det.reset({ name: d.name ?? '', email: d.email ?? '', address: d.address ?? '', taxId: d.taxId ?? '', choice: countryInit === 'MY' ? 'MY' : 'OTHER', code: countryInit === 'MY' ? '' : countryInit });
  return d;
});
function onChoice(v: unknown) {
  det.form.choice = v === 'OTHER' ? 'OTHER' : 'MY';
  if (det.form.choice === 'OTHER' && !det.form.code) det.form.code = detected && detected !== 'MY' ? detected : '';
}
const countryValue = computed(() => (det.form.choice === 'MY' ? 'MY' : det.form.code.trim().toUpperCase()));
const codeError = computed(() => (det.form.choice === 'OTHER' && det.form.code.trim() && !/^[A-Za-z]{2}$/.test(det.form.code.trim()) ? 'Two letters, like SG or US.' : null));
const detInvalid = computed(() => det.form.choice === 'OTHER' && !/^[A-Za-z]{2}$/.test(det.form.code.trim()));
async function saveDetails() {
  busy.value = 'details';
  const f = det.form;
  const country = countryValue.value;
  try {
    await api.patch('/billing/details', { name: f.name || null, email: f.email || null, address: f.address || null, taxId: f.taxId || null, ...(country !== countryInit ? { country } : {}) });
    if (country === 'MY') { f.choice = 'MY'; f.code = ''; } else { f.code = country; }
    countryInit = country;
    det.commit(); toast.success('Billing details saved', 'New invoices use them.');
    void plansQ.reload();
  }
  catch (e) { toast.fail(e); } finally { busy.value = null; }
}
const openInvoice = (r: Invoice) => void router.push(`/billing/invoices/${r.id}`);

const interval = ref<Interval>('MONTHLY');
const busy = ref<string | null>(null);
const current = computed<Tier>(() => sub.data.value?.plan ?? 'FREE');
const paid = computed(() => current.value !== 'FREE');
const currency = computed(() => plansQ.data.value?.currency ?? 'myr');
const rank = (t: Tier) => ORDER.indexOf(t);
// start the toggle on the running plan's interval
watch(() => sub.data.value?.interval, (i) => { if (i) interval.value = i; }, { immediate: true });

const bankOffered = computed(() => !!plansQ.data.value?.methods.bank && interval.value === 'YEARLY');
function features(p: PlanRow): string[] {
  const n = formatNumber;
  const f = p.oneTime
    ? [`${n(p.posts)} free posts to try`, `${n(p.comments)} comments and ${n(p.uploads)} uploads, one time`]
    : [`${n(p.posts)} posts a month`, `${n(p.comments)} comments a month`, `${n(p.uploads)} uploads a month`];
  f.push(p.teams === null ? 'Unlimited brands' : p.teams === 1 ? '1 brand' : `${p.teams} brands`, 'Unlimited social accounts');
  if (p.analytics) f.push('Analytics and history import');
  if (p.dmsPerAccount) f.push(`${n(p.dmsPerAccount)} DMs per account a month*`);
  return [...f, ...(EXTRAS[p.tier] ?? [])];
}
const perMonth = (p: PlanRow) => planMoney(Math.round((p.price?.yearly ?? 0) / 12), p.currency);

async function go(url: string) { window.location.href = url; }
/** Moving to a plan with fewer brands than the organization has: say what happens first. */
async function confirmBrands(p: PlanRow) {
  const inUse = plansQ.data.value?.teamsInUse ?? 0;
  if (p.teams === null || inUse <= p.teams || rank(p.tier) >= rank(current.value)) return true;
  return confirm({ title: `Switch to ${p.name}?`, message: `You have ${inUse} brands and ${p.name} includes ${p.teams}. Your existing brands stay, but you can't add new ones until you upgrade.`, confirmLabel: `Switch to ${p.name}`, cancelLabel: 'Keep plan' });
}
async function checkout(p: PlanRow, method: 'card' | 'bank' = 'card') {
  if (!(await confirmBrands(p))) return;
  busy.value = `${p.tier}:${method}`;
  try {
    const r = await api.post<{ url: string }>('/billing/checkout', { plan: p.tier, interval: interval.value, ...(paid.value ? {} : { method }) });
    await go(r.url);
  }
  catch (e) { toast.fail(e); busy.value = null; }
}
async function portal() {
  busy.value = 'portal';
  try { const r = await api.post<{ url: string }>('/billing/portal'); await go(r.url); } catch (e) { toast.fail(e); busy.value = null; }
}
async function cancel() {
  const inUse = plansQ.data.value?.teamsInUse ?? 0;
  const free = plansQ.data.value?.plans.find((p) => p.tier === 'FREE');
  const brands = free?.teams != null && inUse > free.teams ? ` You have ${inUse} brands and Free includes ${free.teams}: they stay, but you can't add new ones until you upgrade.` : '';
  if (!(await confirm({ title: 'Cancel your subscription?', message: `You keep ${NAMES[current.value]} until ${formatDate(sub.data.value?.currentPeriodEnd, timezone.value)}, then move to Free.${brands}`, confirmLabel: 'Cancel at period end', cancelLabel: 'Keep plan', danger: true }))) return;
  busy.value = 'cancel';
  try { await api.post('/billing/cancel'); await Promise.all([sub.reload(), loadOrg()]); toast.success('Subscription will end at the period end'); } catch (e) { toast.fail(e); } finally { busy.value = null; }
}
async function resume() {
  busy.value = 'resume';
  try { await api.post('/billing/resume'); await Promise.all([sub.reload(), loadOrg()]); toast.success('Subscription resumed'); } catch (e) { toast.fail(e); } finally { busy.value = null; }
}

// a plan paid once (FPX or GrabPay) is renewed from a link: "Renew now" pays the next period at the locked price
const isLink = computed(() => sub.data.value?.renewal === 'LINK');
const DAY = 86_400_000;
const periodEnd = computed(() => (sub.data.value?.currentPeriodEnd ? new Date(sub.data.value.currentPeriodEnd).getTime() : null));
/** Renewal opens 30 days before the end (the API refuses earlier), and stays open while the plan is in its grace. */
const renewOpen = computed(() => sub.data.value?.status === 'past_due' || (periodEnd.value !== null && periodEnd.value - Date.now() <= 30 * DAY));
const graceEnd = computed(() => sub.data.value?.nextRetryAt ?? (periodEnd.value !== null ? new Date(periodEnd.value + 3 * DAY).toISOString() : null));
async function renew() {
  const s = sub.data.value; if (!s) return;
  busy.value = 'renew';
  try { const r = await api.post<{ url: string }>('/billing/checkout', { plan: s.plan, interval: s.interval, renew: true }); await go(r.url); }
  catch (e) { toast.fail(e); busy.value = null; }
}
// ?renew=1 (the reminder email) lands on the renew action
let renewHandled = false;
watch(() => sub.data.value, async (s) => {
  if (renewHandled || !s || !['1', 'true'].includes(String(route.query.renew))) return;
  renewHandled = true;
  tab.value = 'overview';
  await nextTick();
  const el = document.getElementById('billing-renew');
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  el.focus({ preventScroll: true });
}, { immediate: true });

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
/** Free is a one-time allowance (resets: false): "12 of 20 free posts used", no reset date. Paid plans count per month. */
const meters = computed(() => {
  const u = usage.data.value; if (!u) return [];
  const row = (l: string, noun: string, x: Usage) => (x.resets === false
    ? { l, u: x, text: `${formatNumber(x.used)} of ${formatNumber(x.limit)} free ${noun} used` }
    : { l: `${l} this month`, u: x, text: `${formatNumber(x.used)} of ${formatNumber(x.limit)}` });
  return [row('Posts', 'posts', u.posts), row('Comments', 'comments', u.comments), row('Uploads', 'uploads', u.uploads)];
});
const freeAllowance = computed(() => usage.data.value?.posts.resets === false);
const freePostsUsedUp = computed(() => !!usage.data.value && usage.data.value.posts.resets === false && usage.data.value.posts.limit > 0 && usage.data.value.posts.remaining <= 0);
const trialDays = computed(() => plansQ.data.value?.trialDays ?? 0);
const lcols = [{ key: 'createdAt', label: 'When', width: '160px' }, { key: 'reason', label: 'Entry' }, { key: 'delta', label: 'Amount', align: 'right' as const, width: '130px' }];
const icols = [{ key: 'number', label: 'Invoice', width: '170px' }, { key: 'createdAt', label: 'Date', width: '130px' }, { key: 'description', label: 'Description', hideSm: true }, { key: 'status', label: 'Status', width: '100px' }, { key: 'amountCents', label: 'Amount', align: 'right' as const, width: '130px' }, { key: 'go', label: '', width: '40px', align: 'right' as const }];
void session;
</script>

<template>
  <div class="page">
    <PageHead title="Billing" subtitle="Plan, usage, X pay-per-use credit and invoices for the whole organization." />
    <Tabs v-model="tab" :tabs="TABS" class="mb-16" />

    <div v-if="tab === 'overview'" class="stack-24">
      <QueryState :loading="sub.loading.value" :error="sub.error.value" :status="sub.status.value" :has-data="!!sub.data.value" feature="Billing" skeleton="block" @retry="sub.reload">
        <Card v-if="sub.data.value" title="Current plan">
          <template #actions><StatusBadge :status="sub.data.value.status ?? 'active'" /></template>
          <div class="row wrap between" style="align-items: flex-start">
            <div>
              <div class="row"><span class="plan">{{ NAMES[sub.data.value.plan] }}</span><Badge v-if="sub.data.value.interval" size="sm">{{ sub.data.value.interval === 'YEARLY' ? 'Yearly' : 'Monthly' }}</Badge></div>
              <div v-if="sub.data.value.plan !== 'FREE'" class="muted small mt-8">
                {{ money(sub.data.value.amountCents ?? 0, sub.data.value.currency) }} per {{ sub.data.value.interval === 'YEARLY' ? 'year' : 'month' }} ·
                <template v-if="sub.data.value.cancelAtPeriodEnd">ends {{ formatDate(sub.data.value.currentPeriodEnd, timezone) }}</template>
                <template v-else-if="isLink">paid until {{ formatDate(sub.data.value.currentPeriodEnd, timezone) }}. Renew before then.</template>
                <template v-else>renews {{ formatDate(sub.data.value.currentPeriodEnd, timezone) }}</template>
              </div>
              <div v-if="sub.data.value.plan !== 'FREE' && sub.data.value.priceLocked" class="tiny muted mt-8">Your price is locked while you stay subscribed.</div>
              <div v-if="sub.data.value.pendingPlan" class="small mt-8">Moves to {{ NAMES[sub.data.value.pendingPlan] }} on {{ formatDate(sub.data.value.currentPeriodEnd, timezone) }}.</div>
              <div v-if="sub.data.value.trialEndsAt" class="small mt-8">Trial ends {{ formatDate(sub.data.value.trialEndsAt, timezone) }}.</div>
              <div v-if="sub.data.value.provider === 'MOCK'" class="tiny faint mt-8">Test billing: no real money moves.</div>
            </div>
            <div class="row wrap">
              <Button v-if="isLink && !sub.data.value.cancelAtPeriodEnd" id="billing-renew" variant="primary" :loading="busy === 'renew'" :disabled="!renewOpen" @click="renew">Renew now</Button>
              <Button v-if="sub.data.value.plan !== 'FREE' && !isLink" :icon="CreditCard" :loading="busy === 'portal'" @click="portal">Payment method</Button>
              <Button v-if="sub.data.value.plan !== 'FREE' && sub.data.value.cancelAtPeriodEnd" variant="primary" :loading="busy === 'resume'" @click="resume">Resume subscription</Button>
              <Button v-else-if="sub.data.value.plan !== 'FREE'" variant="danger-ghost" :loading="busy === 'cancel'" @click="cancel">Cancel subscription</Button>
            </div>
          </div>
          <div v-if="isLink && !renewOpen && !sub.data.value.cancelAtPeriodEnd" class="tiny muted mt-8">Renewal opens 30 days before the end date. We email you a link then.</div>
          <div v-if="sub.data.value.cancelAtPeriodEnd" class="callout warn mt-16">Your plan ends on {{ formatDate(sub.data.value.currentPeriodEnd, timezone) }}. Resume to keep it.</div>
          <div v-if="sub.data.value.status === 'past_due' && isLink" class="callout danger mt-16" role="alert">Renew by {{ formatDate(graceEnd, timezone) }} to keep {{ NAMES[sub.data.value.plan] }}.</div>
          <div v-else-if="sub.data.value.status === 'past_due'" class="callout danger mt-16" role="alert">The last payment failed. Update your payment method to keep your plan.</div>
        </Card>
      </QueryState>
      <Card title="Usage">
        <QueryState :loading="usage.loading.value" :error="usage.error.value" :status="usage.status.value" :has-data="!!usage.data.value" feature="Usage" skeleton="block" @retry="usage.reload">
          <div class="stack-16">
            <div v-if="freePostsUsedUp" class="callout warn" role="alert">
              <div>You've used your {{ formatNumber(usage.data.value!.posts.limit) }} free posts. Choose Starter<template v-if="trialDays">, or start the {{ trialDays }}-day Pro trial.</template><template v-else> or Pro.</template> <Button variant="link" @click="tab = 'plans'">See plans</Button></div>
            </div>
            <div v-for="m in meters" :key="m.l"><div class="row between small"><span>{{ m.l }}</span><span class="muted">{{ m.text }}</span></div><div class="meter" :class="{ hot: pct(m.u) >= 90 }"><i :style="{ width: `${pct(m.u)}%` }" /></div></div>
            <div v-if="freeAllowance" class="tiny muted">The Free plan's allowance is one-time. It does not reset.</div>
          </div>
        </QueryState>
      </Card>
    </div>

    <div v-else-if="tab === 'plans'">
      <QueryState :loading="plansQ.loading.value" :error="plansQ.error.value" :status="plansQ.status.value" :has-data="!!plansQ.data.value" feature="Plans" skeleton="block" @retry="plansQ.reload">
        <section v-if="plansQ.data.value">
          <div class="row between wrap mb-16"><span class="small muted">Billed per organization, never per connected account. Unlimited social accounts on every plan.</span><div class="pill-toggle"><button :class="{ on: interval === 'MONTHLY' }" @click="interval = 'MONTHLY'">Monthly</button><button :class="{ on: interval === 'YEARLY' }" @click="interval = 'YEARLY'">Yearly · 2 months free</button></div></div>
          <div class="plans">
            <article v-for="p in plansQ.data.value.plans" :key="p.tier" class="plan-card" :class="{ cur: p.tier === current, pop: p.tier === POPULAR && p.tier !== current }">
              <div class="row between"><h3>{{ p.name }}</h3><Badge v-if="p.tier === current" tone="accent" size="sm">Current</Badge><Badge v-else-if="p.tier === POPULAR" tone="accent" size="sm">Most popular</Badge></div>
              <div class="muted small">{{ p.tagline }}</div>
              <div>
                <div class="amt">
                  <template v-if="p.oneTime">Free</template>
                  <template v-else-if="!p.price">Custom</template>
                  <template v-else-if="interval === 'YEARLY'">{{ planMoney(p.price.yearly, p.currency) }}<span class="per"> / year</span></template>
                  <template v-else>{{ planMoney(p.price.monthly, p.currency) }}<span class="per"> / month</span></template>
                </div>
                <div v-if="p.price && !p.oneTime && interval === 'YEARLY'" class="small muted" style="margin-top: 4px">{{ perMonth(p) }} a month · 2 months free</div>
              </div>
              <div v-if="p.trial"><Badge tone="info" size="sm">{{ plansQ.data.value.trialDays }}-day free trial</Badge></div>
              <ul class="list-plain stack"><li v-for="f in features(p)" :key="f" class="row small" style="align-items: flex-start"><Check :size="14" class="ok" />{{ f }}</li></ul>
              <div class="pay" style="margin-top: auto">
                <Button v-if="p.tier === 'ENTERPRISE'" block href="mailto:hello@ffdev.studio?subject=Siar%20Enterprise">Contact us</Button>
                <template v-else-if="p.tier === current">
                  <Button block disabled>Your plan</Button>
                  <div v-if="paid && sub.data.value?.amountCents" class="tiny muted mt-8">Your price: {{ money(sub.data.value.amountCents, sub.data.value.currency) }} per {{ sub.data.value.interval === 'YEARLY' ? 'year' : 'month' }}. Locked while you stay subscribed.</div>
                </template>
                <Button v-else-if="p.tier === 'FREE'" block variant="secondary" :disabled="current === 'FREE' || !!sub.data.value?.cancelAtPeriodEnd" @click="cancel">Downgrade to Free</Button>
                <template v-else-if="!paid && bankOffered">
                  <div class="stack">
                    <Button block variant="primary" :loading="busy === `${p.tier}:card`" :disabled="!!busy" @click="checkout(p, 'card')">{{ p.trial ? `Start ${plansQ.data.value.trialDays}-day trial` : 'Pay by card' }}</Button>
                    <Button block variant="secondary" :loading="busy === `${p.tier}:bank`" :disabled="!!busy" @click="checkout(p, 'bank')">Pay once: FPX or GrabPay</Button>
                  </div>
                  <div class="tiny muted mt-8">A card renews by itself<template v-if="p.trial"> after the trial</template>. Paying once covers the year; we email a link to renew before it ends.</div>
                </template>
                <Button v-else block variant="primary" :loading="busy === `${p.tier}:card`" :disabled="!!busy" @click="checkout(p)">
                  <template v-if="paid">{{ rank(p.tier) > rank(current) ? 'Upgrade' : 'Switch' }} to {{ p.name }}</template>
                  <template v-else-if="p.trial">Start {{ plansQ.data.value.trialDays }}-day free trial</template>
                  <template v-else>Choose {{ p.name }}</template>
                </Button>
              </div>
            </article>
          </div>
          <p class="small muted mt-16">* Inbox and comment-to-DM: Facebook and Instagram, opening after Meta approval.</p>
          <p class="small muted mt-8">Your price never goes up while you stay subscribed. Prices are in {{ currency === 'myr' ? 'ringgit for Malaysia' : 'US dollars' }}; yearly is ten months' price. <Button variant="link" @click="tab = 'details'">Set your country</Button></p>
        </section>
      </QueryState>
    </div>

    <div v-else-if="tab === 'credits'">
      <Card title="X (Twitter) credit" subtitle="Posting to X is billed pay per use by X itself. Credit is held while a post publishes and charged when it succeeds.">
        <template #actions><Button variant="primary" :icon="Wallet" @click="topUp = true">Top up</Button></template>
        <div v-if="currency === 'myr'" class="small muted mb-16">Paid in ringgit; the rate is shown at checkout.</div>
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
    </div>

    <div v-else-if="tab === 'invoices'">
      <QueryState :loading="invoices.loading.value" :error="invoices.error.value" :status="invoices.status.value" :has-data="!!invoices.data.value" feature="Invoices" @retry="invoices.reload">
        <Table :columns="icols" :rows="invoices.data.value?.items ?? []" clickable @row-click="openInvoice">
          <template #cell-number="{ row }"><RouterLink :to="`/billing/invoices/${row.id}`" class="mono-n" @click.stop>{{ row.number }}</RouterLink></template>
          <template #cell-createdAt="{ row }"><span class="small">{{ formatDate(row.createdAt, timezone) }}</span></template>
          <template #cell-description="{ row }"><span>{{ row.description }}</span><span v-if="row.periodStart" class="tiny muted d-block">{{ formatDate(row.periodStart, timezone) }} – {{ formatDate(row.periodEnd, timezone) }}</span></template>
          <template #cell-status="{ row }"><StatusBadge :status="row.status" size="sm" /></template>
          <template #cell-amountCents="{ row }"><span class="num">{{ money(row.amountCents, row.currency) }}</span></template>
          <template #cell-go><ChevronRight :size="16" class="faint" /></template>
          <template #empty><EmptyState compact title="No invoices yet" description="Invoices appear here after your first payment." /></template>
        </Table>
        <Pager v-if="invoices.data.value" :total="invoices.data.value.total" :limit="12" v-model:offset="iOffset" class="mt-16" />
      </QueryState>
    </div>

    <div v-else-if="tab === 'details'" class="sections">
      <SettingsSection title="Billing details" description="Printed under “Billed to” on new invoices. Invoices already issued keep the details they were issued with.">
        <QueryState :loading="detQ.loading.value" :error="detQ.error.value" :status="detQ.status.value" :has-data="!!detQ.data.value" feature="Billing details" skeleton="block" @retry="detQ.reload">
          <div class="grid-2">
            <Input v-model="det.form.name" label="Company or name" :placeholder="session.org?.name ?? ''" help="Leave empty to use the organization name." />
            <Input v-model="det.form.email" type="email" label="Billing email" placeholder="accounts@company.com" help="Receipts and payment problems go here. Empty: the owner." />
            <div class="field span-2"><label class="field-label" for="baddr">Address</label><textarea id="baddr" v-model="det.form.address" class="control ta" rows="4" placeholder="Street, city, postcode, country" /></div>
            <Input v-model="det.form.taxId" label="Tax ID" placeholder="Optional" help="SST, VAT or GST number, if you need it on invoices." />
            <Select :model-value="det.form.choice" label="Country" :options="COUNTRY_OPTIONS" help="Applies to your next checkout. A running plan keeps its price." @update:model-value="onChoice" />
            <Input v-if="det.form.choice === 'OTHER'" v-model="det.form.code" label="Country code" placeholder="e.g. SG" maxlength="2" autocomplete="country" :error="codeError" help="Two letters, like SG or US." />
          </div>
        </QueryState>
      </SettingsSection>
      <SaveBar :dirty="det.dirty.value" :busy="busy === 'details'" :disabled="detInvalid" @save="saveDetails" @discard="det.discard" />
    </div>

    <Modal :open="topUp" title="Top up X credit" size="sm" @close="topUp = false">
      <form class="stack-16" @submit.prevent="doTopUp">
        <Input v-model="amount" type="number" label="Amount (USD)" prefix="$" required :help="currency === 'myr' ? 'Between $5 and $5,000. Paid in ringgit; the rate is shown at checkout.' : 'Between $5 and $5,000.'" autofocus />
        <div class="row wrap"><Button v-for="a in [10, 25, 50, 100]" :key="a" size="sm" @click="amount = a">${{ a }}</Button></div>
        <div class="row" style="justify-content: flex-end"><Button variant="secondary" @click="topUp = false">Cancel</Button><Button type="submit" variant="primary" :loading="busy === 'topup'" :disabled="!amount || amount < 5 || amount > 5000">Continue to payment</Button></div>
      </form>
    </Modal>
  </div>
</template>

<style scoped>
.plan { font-size: var(--fs-24); line-height: 32px; font-weight: 600; }
.plans { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
.plan-card { border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 20px; background: var(--bg-elevated); display: flex; flex-direction: column; gap: 12px; }
.plan-card.pop { border-color: var(--text); }
.plan-card.cur { border-color: var(--accent); box-shadow: 0 0 0 1px var(--accent); }
.amt { font-size: var(--fs-30); line-height: 36px; font-weight: 500; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
.per { font-size: var(--fs-14); font-weight: 400; color: var(--text-subtle); }
.pay :deep(.btn) { white-space: normal; height: auto; min-height: 40px; padding-top: 8px; padding-bottom: 8px; text-align: center; }
.ok { color: var(--success); flex: none; margin-top: 3px; }
.meter { height: 4px; border-radius: 2px; background: var(--bg-muted); overflow: hidden; margin-top: 6px; }
.meter i { display: block; height: 100%; background: var(--text); border-radius: 2px; transform-origin: left; animation: grow 900ms var(--ease-out) backwards; }
@keyframes grow { from { transform: scaleX(0); } }
.meter.hot i { background: var(--danger); }
.mono-n { font-family: var(--mono); font-size: var(--fs-13); color: var(--text); text-decoration: none; }
.mono-n:hover { text-decoration: underline; }
.d-block { display: block; }
.num { font-variant-numeric: tabular-nums; }
.ta { height: auto; padding-top: 10px; padding-bottom: 10px; resize: vertical; line-height: 20px; }
</style>
