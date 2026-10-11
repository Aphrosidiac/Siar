<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { RefreshCw, BarChart3 } from 'lucide-vue-next';
import PageHead from '@/components/PageHead.vue';
import NoTeam from '@/components/NoTeam.vue';
import QueryState from '@/components/QueryState.vue';
import NetworkIcon from '@/components/NetworkIcon.vue';
import LineChart from '@/components/LineChart.vue';
import BarChart from '@/components/BarChart.vue';
import Card from '@/components/ui/Card.vue';
import Select from '@/components/ui/Select.vue';
import Button from '@/components/ui/Button.vue';
import Table from '@/components/ui/Table.vue';
import EmptyState from '@/components/ui/EmptyState.vue';
import { api } from '@/lib/api';
import { useQuery } from '@/lib/query';
import { currentTeam, session } from '@/lib/store';
import { ANALYTICS_TYPES, META } from '@/lib/networks';
import { compactNumber, dayKey, formatNumber } from '@/lib/format';
import { toast } from '@/lib/toast';
import type { NetworkType, Paged, Post } from '@/lib/types';

interface Point { id: string; impressions: number; views: number; likes: number; comments: number; postCount: number; followers: number; following: number; createdAt: string }
interface PostPoint { id: string; impressions: number; views: number; likes: number; comments: number; shares: number; saves: number; createdAt: string }

const available = computed(() => (currentTeam.value?.socialAccounts ?? []).filter((a) => ANALYTICS_TYPES.includes(a.type)));
const type = ref<NetworkType | null>(null);
const days = ref(30);
watch(available, (a) => { if (!a.some((x) => x.type === type.value)) type.value = a[0]?.type ?? null; }, { immediate: true });

const acct = useQuery(() => api.get<{ items: Point[] }>('/analytics/social-account', { teamId: session.teamId, platformType: type.value }), { deps: [type, () => session.teamId], enabled: () => !!session.teamId && !!type.value });
const points = computed(() => {
  const since = Date.now() - days.value * 86400_000;
  return (acct.data.value?.items ?? []).filter((p) => new Date(p.createdAt).getTime() >= since).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
});
const day = (p: Point) => p.createdAt.slice(0, 10);
const first = computed(() => points.value[0]); const last = computed(() => points.value[points.value.length - 1]);
const sum = (k: 'impressions' | 'views' | 'likes' | 'comments') => points.value.reduce((s, p) => s + (p[k] ?? 0), 0);
const delta = computed(() => (first.value && last.value ? last.value.followers - first.value.followers : 0));
const stats = computed(() => [
  { l: 'Followers', v: last.value?.followers ?? 0, sub: `${delta.value >= 0 ? '+' : ''}${formatNumber(delta.value)} in period` },
  { l: 'Impressions', v: sum('impressions') }, { l: 'Views', v: sum('views') }, { l: 'Likes', v: sum('likes') }, { l: 'Comments', v: sum('comments') },
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
    <PageHead title="Analytics" subtitle="Account growth and post performance per network.">
      <Button v-if="type" :icon="RefreshCw" :loading="refreshing" @click="force">Refresh now</Button>
    </PageHead>
    <NoTeam v-if="!session.teamId" />
    <EmptyState v-else-if="!available.length" :icon="BarChart3" title="No accounts to measure" description="Connect an account that supports analytics and numbers start appearing within a day."><Button variant="primary" to="/social-accounts">Connect an account</Button></EmptyState>
    <template v-else>
      <div class="toolbar">
        <div class="chips">
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
          <Card title="Likes per day" class="mt-16"><BarChart :bars="points.map((p) => ({ label: dayKey(new Date(p.createdAt), 'UTC').slice(5), value: p.likes }))" color="var(--chart-2)" /></Card>
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
.nchip { display: inline-flex; align-items: center; gap: 8px; padding: 5px 12px 5px 8px; border: 1px solid var(--border-strong); border-radius: 999px; background: var(--bg); cursor: pointer; color: var(--text); font-size: var(--fs-13); }
.nchip:hover { background: var(--bg-hover); }
.nchip.on { border-color: var(--accent); background: var(--accent-soft); color: var(--accent-soft-text); font-weight: 600; }
@media (max-width: 900px) { .grid-4 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; } }
</style>
