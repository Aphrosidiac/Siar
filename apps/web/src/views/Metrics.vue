<script setup lang="ts">
/**
 * Siar's own analytics, staff only (docs/ANALYTICS.md): GET /api/internal/metrics. Every number here comes from the
 * same report the CLI prints, so this page, the API and a terminal never disagree.
 */
import { computed, ref } from 'vue';
import { Copy } from 'lucide-vue-next';
import PageHead from '@/components/PageHead.vue';
import QueryState from '@/components/QueryState.vue';
import LineChart from '@/components/LineChart.vue';
import Card from '@/components/ui/Card.vue';
import Select from '@/components/ui/Select.vue';
import Tabs from '@/components/ui/Tabs.vue';
import Table from '@/components/ui/Table.vue';
import Button from '@/components/ui/Button.vue';
import EmptyState from '@/components/ui/EmptyState.vue';
import { api } from '@/lib/api';
import { useQuery } from '@/lib/query';
import { session } from '@/lib/store';
import { compactNumber, formatNumber, money, relative } from '@/lib/format';
import { toast } from '@/lib/toast';

const days = ref(30);
const tab = ref('overview');
const q = useQuery(() => api.get<any>('/api/internal/metrics', { days: days.value }), { deps: [days], enabled: () => !!session.me?.user.isStaff });
const r = computed(() => q.data.value);

const col = (key: string, label: string, opts: { align?: 'right'; width?: string; hideSm?: boolean } = {}) => ({ key, label, ...opts });
const num = (key: string, label: string, width = '110px') => col(key, label, { align: 'right', width });
const rows = (list: any[] | undefined): any[] => (list ?? []).map((x, i) => ({ id: String(i), ...x }));
const pct = (a: number, b: number) => (b ? `${Math.round((a / b) * 100)}%` : '—');

const people = computed(() => r.value?.people);
const stats = computed(() => {
  const p = people.value; const f = r.value?.funnel; const g = r.value?.search.google;
  if (!p || !f) return [];
  return [
    { l: 'Human visitors', v: p.human.visitors, sub: `${formatNumber(p.human.views)} page views` },
    { l: 'Unconfirmed browsers', v: p.unconfirmed.views, sub: 'page views without the beacon' },
    { l: 'Signups', v: f.signups, sub: `${f.paying} paying, ${f.trialing} on trial` },
    { l: 'Google clicks', v: g?.clicks ?? 0, sub: `${formatNumber(g?.impressions ?? 0)} impressions` },
    { l: 'Bot requests', v: (r.value?.bots.byClass ?? []).reduce((a: number, b: any) => a + b.requests, 0), sub: `${(r.value?.bots.impostors ?? []).reduce((a: number, b: any) => a + b.requests, 0)} from impostors` },
  ];
});
const trafficSeries = computed(() => {
  const d = people.value?.daily ?? [];
  return [
    { name: 'Human visitors', points: d.map((x: any) => ({ x: x.day, y: x.humanVisitors })) },
    { name: 'Unconfirmed views', points: d.map((x: any) => ({ x: x.day, y: x.unconfirmedViews })) },
    { name: 'Bot page hits', points: d.map((x: any) => ({ x: x.day, y: x.botPages })) },
  ];
});
const searchSeries = computed(() => [
  { name: 'Google impressions', points: (r.value?.search.google.daily ?? []).map((x: any) => ({ x: x.day, y: x.impressions })) },
  { name: 'Bing impressions', points: (r.value?.search.bing.daily ?? []).map((x: any) => ({ x: x.day, y: x.impressions })) },
]);
const funnelRows = computed(() => {
  const f = r.value?.funnel; if (!f) return [];
  return [['Signed up', f.signups], ['Connected an account', f.connectedAccount], ['Published a post', f.publishedPost], ['On a trial', f.trialing], ['Paying', f.paying]]
    .map(([step, n]) => ({ id: String(step), step, people: n, share: step === 'Signed up' ? '' : pct(n as number, f.signups) }));
});
const peopleRows = computed(() => {
  const p = people.value; if (!p) return [];
  return [['Humans (ran the beacon)', p.human], ['Unconfirmed browsers (no JavaScript ran)', p.unconfirmed], ['Automation (webdriver or page flood)', p.automation], ['Staff (FF)', p.staff]]
    .map(([who, v]: any) => ({ id: who, who, views: v.views, visitors: v.visitors }));
});
const collectorLabel: Record<string, string> = { traffic: 'Traffic log', 'search:google': 'Google Search Console', 'search:bing': 'Bing Webmaster' };

async function copyMarkdown() {
  try {
    const res = await fetch(`/api/internal/metrics?days=${days.value}&format=md`, { credentials: 'include' });
    await navigator.clipboard.writeText(await res.text());
    toast.success('Report copied as markdown');
  } catch (e) { toast.fail(e); }
}
</script>

<template>
  <div class="page wide">
    <PageHead eyebrow="Staff" title="Metrics" subtitle="Siar's own traffic, crawlers, signups, revenue and search. Days are Malaysia days. Staff and internal accounts are left out of signups and revenue.">
      <Select v-model="days" size="sm" :options="[{ value: 1, label: 'Last 24 hours' }, { value: 7, label: 'Last 7 days' }, { value: 30, label: 'Last 30 days' }, { value: 90, label: 'Last 90 days' }]" aria-label="Period" />
      <Button :icon="Copy" @click="copyMarkdown">Copy report</Button>
    </PageHead>
    <EmptyState v-if="!session.me?.user.isStaff" title="Staff only" description="This page is for Siar staff." />
    <QueryState v-else :loading="q.loading.value" :error="q.error.value" :status="q.status.value" :has-data="!!r" feature="Metrics" skeleton="cards" @retry="q.reload">
      <template v-if="r">
        <div class="grid-5">
          <div v-for="s in stats" :key="s.l" class="stat"><div class="l">{{ s.l }}</div><div class="v">{{ compactNumber(s.v) }}</div><div class="tiny muted">{{ s.sub }}</div></div>
        </div>
        <Tabs v-model="tab" class="mt-24" :tabs="[{ value: 'overview', label: 'Overview' }, { value: 'traffic', label: 'Traffic' }, { value: 'bots', label: 'Bots and AI' }, { value: 'search', label: 'Search' }, { value: 'revenue', label: 'Revenue' }, { value: 'sources', label: 'Sources' }]" />

        <template v-if="tab === 'overview'">
          <Card title="People and bots on siaran.my, per day" class="mt-16"><LineChart :series="trafficSeries" /></Card>
          <div class="grid-2 mt-16">
            <Card title="Who viewed pages" :padded="false"><Table :columns="[col('who', 'Who'), num('views', 'Views'), num('visitors', 'Visitors')]" :rows="peopleRows" /></Card>
            <Card title="Signups to paying" :padded="false"><Table :columns="[col('step', 'Step'), num('people', 'People'), num('share', 'Of signups')]" :rows="funnelRows" /></Card>
          </div>
          <div class="grid-2 mt-16">
            <Card title="Where visits came from" :padded="false"><Table :columns="[col('name', 'Channel'), num('visits', 'Visits')]" :rows="rows(people?.channels)" /></Card>
            <Card title="Signups by channel" :padded="false"><Table :columns="[col('name', 'Channel'), num('signups', 'Signups', '90px'), num('connected', 'Connected', '100px'), num('paying', 'Paying', '90px')]" :rows="rows(r.funnel.byChannel)" /></Card>
          </div>
        </template>

        <template v-else-if="tab === 'traffic'">
          <div class="grid-2 mt-16">
            <Card title="Top pages (humans)" :padded="false"><Table :columns="[col('path', 'Page'), num('views', 'Views', '90px'), num('visitors', 'Visitors', '90px')]" :rows="rows(people?.topPages)" /></Card>
            <Card title="Landing pages" :padded="false"><Table :columns="[col('name', 'Page'), num('visits', 'Visits')]" :rows="rows(people?.landingPages)" /></Card>
          </div>
          <div class="grid-3 mt-16">
            <Card title="Referrers" :padded="false"><Table :columns="[col('name', 'Site'), num('visits', 'Visits', '80px')]" :rows="rows(people?.referrers)" /></Card>
            <Card title="Countries" :padded="false"><Table :columns="[col('name', 'Country'), num('visits', 'Visits', '80px')]" :rows="rows(people?.countries)" /></Card>
            <Card title="Devices and browsers" :padded="false"><Table :columns="[col('name', 'Device or browser'), num('visits', 'Visits', '80px')]" :rows="rows([...(people?.devices ?? []), ...(people?.browsers ?? [])])" /></Card>
          </div>
          <div class="grid-2 mt-16">
            <Card title="Unconfirmed browser hits" subtitle="A browser User-Agent, but the page's JavaScript never ran: a bounce under 3 seconds, a blocker, or a scraper." :padded="false"><Table :columns="[col('path', 'Page'), col('agent', 'Claims to be', { width: '140px' }), num('views', 'Hits', '70px')]" :rows="rows(people?.unconfirmedPages)" /></Card>
            <Card title="Errors people hit" :padded="false"><Table :columns="[col('path', 'Page'), num('status', 'Status', '80px'), num('hits', 'Hits', '70px')]" :rows="rows(people?.errors)" /></Card>
          </div>
        </template>

        <template v-else-if="tab === 'bots'">
          <div class="grid-2 mt-16">
            <Card title="Requests by class" subtitle="Every host. Search and AI crawlers are checked against their owner's published IP list or reverse DNS." :padded="false"><Table :columns="[col('class', 'Class'), num('requests', 'Requests'), num('pages', 'Pages', '80px'), num('ips', 'IPs', '70px')]" :rows="rows(r.bots.byClass)" /></Card>
            <Card title="Impostors" subtitle="Claimed to be a known crawler from an IP its owner doesn't use." :padded="false"><Table :columns="[col('claimed', 'Claimed'), num('requests', 'Requests', '90px'), num('ips', 'IPs', '60px')]" :rows="rows(r.bots.impostors)" /></Card>
          </div>
          <Card title="Crawlers and automated clients" class="mt-16" :padded="false">
            <Table :columns="[col('agent', 'Agent'), col('owner', 'Owner', { width: '110px', hideSm: true }), col('class', 'Class', { width: '100px' }), col('purpose', 'Purpose', { width: '90px', hideSm: true }), col('verified', 'Verified', { width: '110px' }), num('requests', 'Requests', '90px'), num('pages', 'Pages', '70px'), col('lastSeen', 'Last seen', { width: '110px', hideSm: true })]" :rows="rows(r.bots.agents)">
              <template #cell-lastSeen="{ row }">{{ row.lastSeen ? relative(row.lastSeen) : '—' }}</template>
            </Table>
          </Card>
          <div class="grid-2 mt-16">
            <Card title="What search and AI crawlers read" :padded="false"><Table :columns="[col('agent', 'Agent', { width: '150px' }), col('path', 'Path'), num('hits', 'Hits', '60px')]" :rows="rows(r.bots.crawledPaths)" /></Card>
            <div>
              <Card title="AI" :subtitle="`${r.ai.visitsFromAssistants} visits and ${r.ai.signupsFromAssistants} signups came from AI assistants. ${r.ai.note}`" :padded="false"><Table :columns="[col('agent', 'Crawler'), col('purpose', 'Purpose', { width: '90px' }), col('verified', 'Verified', { width: '110px' }), num('requests', 'Requests', '80px')]" :rows="rows(r.ai.crawlers)" /></Card>
              <Card title="Scanner paths" class="mt-16" :padded="false"><Table :columns="[col('path', 'Path'), num('hits', 'Hits', '70px'), num('ips', 'IPs', '60px')]" :rows="rows(r.bots.scannerPaths)" /></Card>
              <Card title="Errors crawlers hit" class="mt-16" :padded="false"><Table :columns="[col('path', 'Path'), num('status', 'Status', '70px'), num('hits', 'Hits', '60px')]" :rows="rows(r.bots.crawlErrors)" /></Card>
            </div>
          </div>
        </template>

        <template v-else-if="tab === 'search'">
          <Card title="Impressions per day" class="mt-16"><LineChart :series="searchSeries" /></Card>
          <div v-for="eng in (['google', 'bing'] as const)" :key="eng" class="mt-24">
            <h2 class="mb-8">{{ eng === 'google' ? 'Google' : 'Bing' }}: {{ formatNumber(r.search[eng].clicks) }} clicks, {{ formatNumber(r.search[eng].impressions) }} impressions<template v-if="r.search[eng].position">, average position {{ r.search[eng].position.toFixed(1) }}</template></h2>
            <div class="grid-3">
              <Card title="Queries" :padded="false"><Table :columns="[col('query', 'Query'), num('clicks', 'Clicks', '64px'), num('impressions', 'Impr.', '64px'), num('position', 'Pos.', '56px')]" :rows="rows(r.search[eng].queries)" /></Card>
              <Card title="Pages" :padded="false"><Table :columns="[col('page', 'Page'), num('clicks', 'Clicks', '64px'), num('impressions', 'Impr.', '64px')]" :rows="rows(r.search[eng].pages.map((x: any) => ({ ...x, page: x.page.replace(/^https:\/\/siaran\.my/, '') || '/' })))" /></Card>
              <Card title="Target keywords" :padded="false"><Table :columns="[col('query', 'Keyword'), num('impressions', 'Impr.', '64px'), num('position', 'Pos.', '56px')]" :rows="rows(r.search[eng].tracked)" /></Card>
            </div>
          </div>
        </template>

        <template v-else-if="tab === 'revenue'">
          <div class="grid-4 mt-16">
            <div v-for="m in r.revenue.mrrByCurrency" :key="m.currency" class="stat"><div class="l">MRR, {{ m.currency.toUpperCase() }}</div><div class="v">{{ money(m.mrrCents, m.currency) }}</div></div>
            <div class="stat"><div class="l">Started in period</div><div class="v">{{ r.revenue.started }}</div></div>
            <div class="stat"><div class="l">Canceled in period</div><div class="v">{{ r.revenue.canceled }}</div><div class="tiny muted">{{ r.revenue.cancelingAtPeriodEnd }} canceling at period end</div></div>
          </div>
          <div class="grid-2 mt-16">
            <Card title="Subscriptions" :padded="false"><Table :columns="[col('tier', 'Plan'), col('interval', 'Interval'), col('status', 'Status'), num('subs', 'Count', '70px'), num('mrr', 'Monthly value')]" :rows="rows(r.revenue.subscriptions.map((s: any) => ({ ...s, mrr: money(s.mrrCents, s.currency) })))" /></Card>
            <Card title="Payments collected" :padded="false"><Table :columns="[col('purpose', 'Purpose'), col('currency', 'Currency'), num('payments', 'Payments', '90px'), num('amount', 'Collected')]" :rows="rows(r.revenue.payments.map((p: any) => ({ ...p, amount: money(p.amountCents, p.currency) })))" /></Card>
          </div>
          <Card title="Signups by landing page" class="mt-16" :padded="false"><Table :columns="[col('name', 'Landing page'), num('signups', 'Signups', '90px'), num('connected', 'Connected', '100px'), num('posted', 'Posted', '80px'), num('paying', 'Paying', '80px')]" :rows="rows(r.funnel.byLanding)" /></Card>
        </template>

        <template v-else>
          <Card title="Collectors" class="mt-16" :subtitle="`Traffic log stored from ${r.sources.trafficLogFrom ? relative(r.sources.trafficLogFrom) : 'nothing yet'} to ${r.sources.trafficLogTo ? relative(r.sources.trafficLogTo) : '—'}.`" :padded="false">
            <Table :columns="[col('name', 'Source'), col('state', 'State', { width: '90px' }), col('when', 'Last run', { width: '120px' }), num('rows', 'Rows', '80px'), col('detail', 'Detail', { hideSm: true })]" :rows="rows(r.sources.collectors.map((c: any) => ({ name: collectorLabel[c.id] ?? c.id, state: c.ok ? 'OK' : 'Not working', when: relative(c.ranAt), rows: c.rows, detail: c.detail })))" />
          </Card>
          <p class="small muted mt-16">How each number is counted: docs/ANALYTICS.md in the Siar repository.</p>
        </template>
      </template>
    </QueryState>
  </div>
</template>

<style scoped>
.grid-5 { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px; }
.grid-3 { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
@media (max-width: 1100px) { .grid-5 { grid-template-columns: repeat(3, minmax(0, 1fr)); } .grid-3 { grid-template-columns: minmax(0, 1fr); } }
@media (max-width: 640px) { .grid-5 { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
</style>
