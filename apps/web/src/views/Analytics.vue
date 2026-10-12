<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { RefreshCw, BarChart3 } from 'lucide-vue-next';
import PageHead from '@/components/PageHead.vue';
import NoTeam from '@/components/NoTeam.vue';
import QueryState from '@/components/QueryState.vue';
import NetworkIcon from '@/components/NetworkIcon.vue';
import LineChart from '@/components/LineChart.vue';
import Card from '@/components/ui/Card.vue';
import Select from '@/components/ui/Select.vue';
import Button from '@/components/ui/Button.vue';
import Table from '@/components/ui/Table.vue';
import EmptyState from '@/components/ui/EmptyState.vue';
import { api } from '@/lib/api';
import { useQuery } from '@/lib/query';
import { currentTeam, session, timezone } from '@/lib/store';
import { ANALYTICS_TYPES, META } from '@/lib/networks';
import { compactNumber, dayKey, formatDateTime, formatNumber } from '@/lib/format';
import { toast } from '@/lib/toast';
import type { NetworkType, Paged, Post } from '@/lib/types';

interface Point { id: string; impressions: number; views: number; likes: number; comments: number; postCount: number; followers: number; following: number; createdAt: string }
interface PostPoint { id: string; impressions: number; views: number; likes: number; comments: number; shares: number; saves: number; createdAt: string }

const available = computed(() => (currentTeam.value?.socialAccounts ?? []).filter((a) => ANALYTICS_TYPES.includes(a.type)));
const type = ref<NetworkType | null>(null);
const days = ref(30);
watch(available, (a) => { if (!a.some((x) => x.type === type.value)) type.value = a[0]?.type ?? null; }, { immediate: true });

const acct = useQuery(() => api.get<{ items: Point[] }>('/analytics/social-account', { teamId: session.teamId, platformType: type.value }), { deps: [type, () => session.teamId], enabled: () => !!session.teamId && !!type.value });
// Every refresh stores a snapshot of the network's own totals (a trailing window such as the last 28 days, or
// lifetime counts), never the change since the last one. So the figures are the latest snapshot, and a chart
// has one point per day: that day's last snapshot. Adding snapshots up would count the same days twice.
const day = (p: Point) => dayKey(new Date(p.createdAt), 'UTC');
const points = computed(() => {
  const since = Date.now() - days.value * 86400_000;
  const byDay = new Map<string, Point>();
  for (const p of [...(acct.data.value?.items ?? [])].sort((a, b) => a.createdAt.localeCompare(b.createdAt))) if (new Date(p.createdAt).getTime() >= since) byDay.set(day(p), p);
  return [...byDay.values()];
});
const first = computed(() => points.value[0]); const last = computed(() => points.value[points.value.length - 1]);
const delta = computed(() => (first.value && last.value ? last.value.followers - first.value.followers : 0));
const asOf = computed(() => (last.value ? `as of ${formatDateTime(last.value.createdAt, timezone.value)}` : ''));
const stats = computed(() => [
  { l: 'Followers', v: last.value?.followers ?? 0, sub: `${delta.value >= 0 ? '+' : ''}${formatNumber(delta.value)} in period` },
  { l: 'Impressions', v: last.value?.impressions ?? 0, sub: asOf.value }, { l: 'Views', v: last.value?.views ?? 0, sub: asOf.value },
  { l: 'Likes', v: last.value?.likes ?? 0, sub: asOf.value }, { l: 'Comments', v: last.value?.comments ?? 0, sub: asOf.value },
]);

// top posts
const top = useQuery(async () => {
  const posts = await api.get<Paged<Post>>('/post/', { teamId: session.teamId, status: 'POSTED', platforms: [type.value!], orderBy: 'postedDate', order: 'DESC', limit: 20 });
  if (!posts.items.length) return [] as { post: Post; m: PostPoint | null }[];
  const res = await api.get<{ results: { postId: string; items: PostPoint[] }[] }>('/analytics/post/bulk', { postIds: posts.items.map((p) => p.id), platformType: type.value, limit: 20 });
  const by = new Map(res.results.map((r) => [r.postId, r.items.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null]));
  return posts.items.map((post) => ({ post, m: by.get(post.id) ?? null })).sort((a, b) => (b.m?.impressions ?? 0) - (a.m?.impressions ?? 0));
}, { deps: [type, () => session.teamId], enabled: () => !!session.teamId && !!type.value });

const refreshing = ref(false);
async function force() {
  refreshing.value = true;
  try { await api.post('/analytics/social-account/force', { teamId: session.teamId, platformType: type.value }); await acct.reload(); toast.success('Analytics refreshed'); } catch (e) { toast.fail(e); } finally { refreshing.value = false; }
}
const cols = [{ key: 'title', label: 'Post' }, { key: 'impressions', label: 'Impressions', align: 'right' as const, width: '120px' }, { key: 'views', label: 'Views', align: 'right' as const, width: '90px' }, { key: 'likes', label: 'Likes', align: 'right' as const, width: '80px' }, { key: 'comments', label: 'Comments', align: 'right' as const, width: '100px', hideSm: true }];
const rows = computed(() => (top.data.value ?? []).map((r) => ({ id: r.post.id, title: r.post.title, impressions: r.m?.impressions ?? 0, views: r.m?.views ?? 0, likes: r.m?.likes ?? 0, comments: r.m?.comments ?? 0 })));
</script>

<template>
  <div class="page wide">
    <PageHead title="Analytics" subtitle="Account growth and post performance per network. Figures are the network's own totals at the latest refresh (Facebook, Instagram and Threads count the last 28 days).">
      <Button v-if="type" :icon="RefreshCw" :loading="refreshing" @click="force">Refresh now</Button>
    </PageHead>
    <NoTeam v-if="!session.teamId" />
    <EmptyState v-else-if="!available.length" :icon="BarChart3" title="No accounts to measure" description="Connect an account that supports analytics and numbers start appearing within a day."><Button variant="primary" to="/social-accounts">Connect an account</Button></EmptyState>
    <template v-else>
      <div class="toolbar">
        <div class="nets">
          <button v-for="a in available" :key="a.type" type="button" class="nchip" :class="{ on: type === a.type }" :aria-pressed="type === a.type" @click="type = a.type"><NetworkIcon :type="a.type" :size="20" :title="false" />{{ META[a.type].name }}</button>
        </div>
        <span class="spacer" />
        <Select v-model="days" size="sm" :options="[{ value: 7, label: 'Last 7 days' }, { value: 30, label: 'Last 30 days' }, { value: 90, label: 'Last 90 days' }, { value: 3650, label: 'All time' }]" aria-label="Period" />
      </div>
      <QueryState :loading="acct.loading.value" :error="acct.error.value" :status="acct.status.value" :has-data="!!acct.data.value" feature="Analytics" skeleton="cards" @retry="acct.reload">
        <EmptyState v-if="!points.length" title="No data in this period" description="Analytics are collected daily. Try a longer period, or refresh now." compact />
        <template v-else>
          <div class="grid-4" style="grid-template-columns: repeat(5, minmax(0, 1fr))">
            <div v-for="s in stats" :key="s.l" class="stat"><div class="l">{{ s.l }}</div><div class="v">{{ compactNumber(s.v) }}</div><div class="tiny muted">{{ s.sub ?? ' ' }}</div></div>
          </div>
          <div class="grid-2 mt-16">
            <Card title="Followers"><LineChart :series="[{ name: 'Followers', points: points.map((p) => ({ x: day(p), y: p.followers })) }]" /></Card>
            <Card title="Impressions and views"><LineChart :series="[{ name: 'Impressions', points: points.map((p) => ({ x: day(p), y: p.impressions })) }, { name: 'Views', points: points.map((p) => ({ x: day(p), y: p.views })) }]" /></Card>
          </div>
          <Card title="Likes and comments" class="mt-16"><LineChart :series="[{ name: 'Likes', points: points.map((p) => ({ x: day(p), y: p.likes })) }, { name: 'Comments', points: points.map((p) => ({ x: day(p), y: p.comments })) }]" /></Card>
        </template>
      </QueryState>

      <h2 class="mt-24 mb-8">Top posts</h2>
      <QueryState :loading="top.loading.value" :error="top.error.value" :status="top.status.value" :has-data="!!top.data.value" feature="Post analytics" @retry="top.reload">
        <Table :columns="cols" :rows="rows" clickable @row-click="(r) => $router.push(`/posts/${r.id}`)">
          <template #cell-impressions="{ row }">{{ formatNumber(row.impressions) }}</template>
          <template #cell-views="{ row }">{{ formatNumber(row.views) }}</template>
          <template #cell-likes="{ row }">{{ formatNumber(row.likes) }}</template>
          <template #cell-comments="{ row }">{{ formatNumber(row.comments) }}</template>
          <template #empty><EmptyState compact title="No published posts yet" description="Post analytics show up here after a post goes live." /></template>
        </Table>
      </QueryState>
    </template>
  </div>
</template>

<style scoped>
.chips { display: flex; gap: 8px; flex-wrap: wrap; }
.nchip { display: inline-flex; align-items: center; gap: 8px; padding: 5px 12px 5px 8px; border: 1px solid var(--border); border-radius: var(--radius-pill); background: var(--bg-elevated); cursor: pointer; color: var(--text-subtle); font-size: var(--fs-13); white-space: nowrap; flex: none; transition: border-color var(--t-micro), color var(--t-micro); }
.nchip:hover { color: var(--text); border-color: var(--border-strong); }
.nchip.on { border-color: var(--text); box-shadow: inset 0 0 0 1px var(--text); color: var(--text); font-weight: 500; }
.nets { display: flex; gap: 6px; flex-wrap: wrap; }
@media (max-width: 640px) { .nets { flex: 1 1 100%; min-width: 0; flex-wrap: nowrap; overflow-x: auto; scrollbar-width: none; margin: 0 -16px; padding: 0 16px; } }
@media (max-width: 900px) { .grid-4 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; } }
</style>
