<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { Download, ExternalLink } from 'lucide-vue-next';
import Button from './ui/Button.vue';
import Table from './ui/Table.vue';
import EmptyState from './ui/EmptyState.vue';
import QueryState from './QueryState.vue';
import { api } from '@/lib/api';
import { useQuery } from '@/lib/query';
import { session } from '@/lib/store';
import { META } from '@/lib/networks';
import { formatDateTime, formatNumber } from '@/lib/format';
import { toast } from '@/lib/toast';
import type { NetworkType } from '@/lib/types';

/**
 * Posts the account published outside Siar, read from the network (TikTok: video.list) with each one's
 * views, likes and comments. "Import past posts" runs a post history import and the table fills when it ends.
 */
const props = defineProps<{ type: NetworkType }>();

interface Metrics { views: number; likes: number; comments: number; shares: number }
interface Imported { id: string; title: string | null; description: string | null; smallThumbnail: string | null; permalink: string | null; publishedAt: string | null; analytics: Metrics[] }
interface Run { id: string; status: string; postsImported: number; analyticsImported: number; error: string | null; createdAt: string }

const posts = useQuery(() => api.get<{ posts: Imported[]; total: number }>('/post-history-import/posts', { teamId: session.teamId, socialAccountType: props.type, limit: 20 }), { deps: [() => props.type, () => session.teamId], enabled: () => !!session.teamId });
const run = ref<Run | null>(null);
const DONE = new Set(['COMPLETED', 'FAILED', 'RATE_LIMITED']);
const busy = computed(() => !!run.value && !DONE.has(run.value.status));
let timer: ReturnType<typeof setTimeout> | undefined;

async function latest() {
  if (!session.teamId) return;
  const r = await api.get<{ imports: Run[] }>('/post-history-import/', { teamId: session.teamId, socialAccountType: props.type }).catch(() => null);
  run.value = r?.imports[0] ?? null;
}
function follow() {
  clearTimeout(timer);
  if (!busy.value) return;
  timer = setTimeout(async () => {
    if (!run.value) return;
    run.value = await api.get<Run>(`/post-history-import/${run.value.id}`);
    if (busy.value) return follow();
    if (run.value.status === 'COMPLETED') { await posts.reload(); toast.success(`Imported ${run.value.postsImported} ${META[props.type].name} post${run.value.postsImported === 1 ? '' : 's'}`); }
    else toast.error('Import stopped', run.value.error ?? run.value.status);
  }, 2000);
}
async function start() {
  try { run.value = await api.post<Run>('/post-history-import/', { teamId: session.teamId, socialAccountType: props.type, count: 20, withAnalytics: true }); follow(); }
  catch (e) { toast.fail(e); }
}
watch(() => [props.type, session.teamId], async () => { await latest(); follow(); }, { immediate: true });
onBeforeUnmount(() => clearTimeout(timer));

const last = (p: Imported) => p.analytics[p.analytics.length - 1];
const rows = computed(() => (posts.data.value?.posts ?? []).map((p) => ({ id: p.id, thumb: p.smallThumbnail, title: p.title || p.description || 'Untitled', when: p.publishedAt, link: p.permalink, views: last(p)?.views ?? 0, likes: last(p)?.likes ?? 0, comments: last(p)?.comments ?? 0 })));
const cols = [{ key: 'title', label: 'Post' }, { key: 'when', label: 'Published', width: '170px', hideSm: true }, { key: 'views', label: 'Views', align: 'right' as const, width: '90px' }, { key: 'likes', label: 'Likes', align: 'right' as const, width: '80px' }, { key: 'comments', label: 'Comments', align: 'right' as const, width: '100px', hideSm: true }];
</script>

<template>
  <div class="head mt-24 mb-8">
    <div><h2>Past posts</h2><p class="small muted">Posts on {{ META[type].name }}, including ones published outside Siar, with their views and likes.</p></div>
    <Button :icon="Download" :loading="busy" @click="start">{{ busy ? 'Importing…' : 'Import past posts' }}</Button>
  </div>
  <QueryState :loading="posts.loading.value" :error="posts.error.value" :status="posts.status.value" :has-data="!!posts.data.value" feature="Past posts" @retry="posts.reload">
    <Table :columns="cols" :rows="rows">
      <template #cell-title="{ row }">
        <div class="post">
          <img v-if="row.thumb" :src="row.thumb" alt="" class="thumb" loading="lazy" />
          <span class="truncate">{{ row.title }}</span>
          <a v-if="row.link" :href="row.link" target="_blank" rel="noopener" class="faint" :aria-label="`Open on ${META[type].name}`" @click.stop><ExternalLink :size="14" /></a>
        </div>
      </template>
      <template #cell-when="{ row }">{{ row.when ? formatDateTime(row.when) : '—' }}</template>
      <template #cell-views="{ row }">{{ formatNumber(row.views) }}</template>
      <template #cell-likes="{ row }">{{ formatNumber(row.likes) }}</template>
      <template #cell-comments="{ row }">{{ formatNumber(row.comments) }}</template>
      <template #empty><EmptyState compact title="No past posts yet" :description="`Import past posts to read your ${META[type].name} posts and their numbers.`" /></template>
    </Table>
  </QueryState>
</template>

<style scoped>
.head { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; }
.post { display: flex; align-items: center; gap: 12px; min-width: 0; }
.thumb { width: 32px; height: 42px; object-fit: cover; border-radius: 4px; flex: none; background: var(--bg-subtle); }
</style>
