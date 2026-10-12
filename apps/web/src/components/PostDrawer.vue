<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { Eye, ExternalLink, Heart, MessageCircle, PenSquare, RefreshCw, RotateCw, Trash2 } from 'lucide-vue-next';
import QueryState from './QueryState.vue';
import StatusBadge from './StatusBadge.vue';
import NetworkIcon from './NetworkIcon.vue';
import Button from './ui/Button.vue';
import Drawer from './ui/Drawer.vue';
import { api } from '@/lib/api';
import { useQuery } from '@/lib/query';
import { inFlight } from '@/lib/inflight';
import { timezone } from '@/lib/store';
import { ANALYTICS_TYPES, networkName } from '@/lib/networks';
import { formatDateTime, formatNumber, relative, handle } from '@/lib/format';
import { confirm } from '@/lib/confirm';
import { toast } from '@/lib/toast';
import type { NetworkType, Post } from '@/lib/types';

/** Post detail: per-network status and figures, errors verbatim, retry / edit / delete. Used by Posts and Calendar. */
const props = defineProps<{ id: string | null }>();
const emit = defineEmits<{ close: []; changed: [] }>();
const detail = useQuery(() => api.get<Post>(`/post/${props.id}`), { deps: [() => props.id], enabled: () => !!props.id });
const busy = ref(false);
// While the post is going out, follow it until every network answers, and let the list know when it changes.
let poll = 0;
watch(() => detail.data.value, (p, old) => {
  clearInterval(poll);
  if (inFlight(p)) poll = window.setInterval(() => { void detail.refresh(); }, 2500);
  if (p && old && p.id === old.id && p.status !== old.status) emit('changed');
});
onBeforeUnmount(() => clearInterval(poll));
async function retry(p: Post) {
  busy.value = true;
  try { await api.post(`/post/${p.id}/retry`); toast.success('Retry queued'); await detail.reload(); emit('changed'); } catch (e) { toast.fail(e); } finally { busy.value = false; }
}
// networks whose API cannot delete a published post (the adapters' deletePost: false)
const NO_API_DELETE = new Set(['INSTAGRAM', 'TIKTOK', 'SNAPCHAT']);
function deleteMessage(p: Post) {
  const live = (p.socialAccounts ?? []).filter((t) => t.status === 'POSTED').map((t) => t.socialAccount?.type ?? '');
  if (!live.length) return 'It will not be published.';
  const gone = live.filter((t) => !NO_API_DELETE.has(t)).map(networkName);
  const kept = live.filter((t) => NO_API_DELETE.has(t)).map(networkName);
  const list = (xs: string[]) => xs.length > 1 ? `${xs.slice(0, -1).join(', ')} and ${xs.at(-1)}` : xs[0];
  return [gone.length ? `It is deleted from ${list(gone)} too.` : '', kept.length ? `${list(kept)} ${kept.length > 1 ? 'do' : 'does'} not let apps delete posts, so delete it there yourself.` : ''].filter(Boolean).join(' ');
}
async function remove(p: Post) {
  if (!(await confirm({ title: 'Delete this post?', message: deleteMessage(p), confirmLabel: 'Delete', danger: true }))) return;
  busy.value = true;
  try { await api.del(`/post/${p.id}`); toast.success('Post deleted'); emit('changed'); emit('close'); } catch (e) { toast.fail(e); } finally { busy.value = false; }
}
const post = computed(() => detail.data.value);
const errorRows = computed(() => {
  const p = post.value; if (!p) return [];
  const out: { type: string; message: string; verbose: any }[] = [];
  for (const [type, message] of Object.entries(p.errors ?? {})) out.push({ type, message, verbose: (p.errorsVerbose as any)?.[type] });
  if (!out.length && p.error) out.push({ type: '', message: p.error, verbose: null });
  return out;
});
// Each network's latest figures for this post (likes, comments, views), read from the network by the daily sweep
// or by Refresh. X is left out of Refresh: its reads are billed per request.
interface PostPoint { likes: number; comments: number; views: number; createdAt: string }
const figures = ref<Record<string, PostPoint | null>>({});
const refreshingType = ref<string | null>(null);
const measurable = (t: { status?: string | null; socialAccount?: { type: string } | null }) => t.status === 'POSTED' && ANALYTICS_TYPES.includes((t.socialAccount?.type ?? '') as NetworkType);
watch(() => (post.value?.socialAccounts?.some(measurable) ? post.value.id : null), async (id) => {
  figures.value = {};
  const p = post.value; if (!id || !p) return;
  for (const t of (p.socialAccounts ?? []).filter(measurable)) {
    const type = t.socialAccount!.type;
    try {
      const r = await api.get<{ items: PostPoint[] }>('/analytics/post', { postId: id, platformType: type });
      figures.value = { ...figures.value, [type]: [...r.items].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null };
    } catch { figures.value = { ...figures.value, [type]: null }; }
  }
}, { immediate: true });
async function refreshFigures(p: Post, type: string) {
  refreshingType.value = type;
  try { figures.value = { ...figures.value, [type]: await api.post<PostPoint>('/analytics/post/force', { postId: p.id, platformType: type }) }; toast.success(`${networkName(type)} figures refreshed`); }
  catch (e) { toast.fail(e); } finally { refreshingType.value = null; }
}
const textFor = (p: Post, type: string) => (p.data?.[type]?.text as string | undefined) ?? '';
const mediaOf = (p: Post) => (p.uploads ?? []).map((u) => u.upload).filter(Boolean);
</script>

<template>
    <Drawer :open="!!id" title="Post" :width="560" @close="emit('close')">
  <QueryState :loading="detail.loading.value" :error="detail.error.value" :status="detail.status.value" :has-data="!!post" feature="This post" @retry="detail.reload">
    <div v-if="post" class="stack-16">
      <div class="row wrap"><StatusBadge :status="post.status" /><span class="muted small">{{ post.status === 'POSTED' ? `Published ${formatDateTime(post.postedDate, timezone)}` : `${post.status === 'DRAFT' ? 'Planned for' : 'Scheduled for'} ${formatDateTime(post.postDate, timezone)}` }}</span></div>
      <div v-if="post.retryCount" class="small muted">Retried {{ post.retryCount }} time{{ post.retryCount === 1 ? '' : 's' }}.</div>

      <div v-if="errorRows.length" class="stack">
        <div v-for="e in errorRows" :key="e.type" class="callout danger" role="alert">
          <div class="grow">
            <div class="strong">{{ e.type ? networkName(e.type) : 'Publishing failed' }}</div>
            <div class="prewrap">{{ e.message }}</div>
            <div v-if="e.verbose?.errorMessage && e.verbose.errorMessage !== e.message" class="small prewrap mt-8">Network said: <em>{{ e.verbose.errorMessage }}</em><span v-if="e.verbose.code"> ({{ e.verbose.code }}{{ e.verbose.httpStatus ? `, HTTP ${e.verbose.httpStatus}` : '' }})</span></div>
            <details v-if="e.verbose" class="mt-8"><summary class="small" style="cursor: pointer">Network response</summary>
              <pre class="prewrap mono" style="margin: 8px 0 0">{{ JSON.stringify(e.verbose, null, 2) }}</pre></details>
          </div>
        </div>
      </div>

      <div v-if="mediaOf(post).length" class="row wrap">
        <template v-for="u in mediaOf(post)" :key="u!.id"><img v-if="u!.thumbnailUrl || u!.url" :src="(u!.thumbnailUrl || u!.url)!" class="thumb" style="width: 72px; height: 72px" alt="" /></template>
      </div>

      <div class="stack">
        <h3>Networks</h3>
        <div v-for="t in post.socialAccounts ?? []" :key="t.socialAccountId" class="net">
          <div class="row">
            <NetworkIcon :type="t.socialAccount?.type ?? ''" :size="28" />
            <div class="grow"><div class="strong">{{ networkName(t.socialAccount?.type ?? '') }} <span class="muted">{{ t.socialAccount?.username ? handle(t.socialAccount.username) : '' }}</span></div>
              <div class="tiny muted">{{ t.publishedAt ? `Published ${relative(t.publishedAt)}` : 'Not published yet' }}</div></div>
            <StatusBadge :status="t.status" size="sm" />
          </div>
          <p v-if="textFor(post, t.socialAccount?.type ?? '')" class="prewrap small mt-8">{{ textFor(post, t.socialAccount?.type ?? '') }}</p>
          <a v-if="t.permalink" :href="t.permalink" target="_blank" rel="noopener" class="small row gap-4 mt-8">View on {{ networkName(t.socialAccount?.type ?? '') }} <ExternalLink :size="12" /></a>
          <div v-if="measurable(t)" class="figs row wrap mt-8">
            <template v-if="figures[t.socialAccount!.type]">
              <span class="small row gap-4" title="Likes"><Heart :size="14" />{{ formatNumber(figures[t.socialAccount!.type]!.likes) }} likes</span>
              <span class="small row gap-4" title="Comments"><MessageCircle :size="14" />{{ formatNumber(figures[t.socialAccount!.type]!.comments) }} comments</span>
              <span class="small row gap-4" title="Views"><Eye :size="14" />{{ formatNumber(figures[t.socialAccount!.type]!.views) }} views</span>
              <span class="tiny muted">as of {{ formatDateTime(figures[t.socialAccount!.type]!.createdAt, timezone) }}</span>
            </template>
            <span v-else class="tiny muted">No figures yet</span>
            <span class="spacer" />
            <Button v-if="t.socialAccount!.type !== 'TWITTER'" size="sm" variant="ghost" :icon="RefreshCw" :loading="refreshingType === t.socialAccount!.type" @click="refreshFigures(post, t.socialAccount!.type)">Refresh</Button>
          </div>
        </div>
      </div>
    </div>
  </QueryState>
  <template v-if="post" #footer>
    <Button variant="danger-ghost" :icon="Trash2" :disabled="busy" @click="remove(post)">Delete</Button>
    <span class="spacer" />
    <Button v-if="post.status === 'ERROR'" variant="primary" :icon="RotateCw" :loading="busy" @click="retry(post)">Retry</Button>
    <Button v-if="post.status === 'DRAFT' || post.status === 'SCHEDULED' || post.status === 'ERROR'" :icon="PenSquare" :to="`/compose/${post.id}`">Edit</Button>
  </template>
</Drawer>
</template>

<style scoped>
.net { border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 12px; }
.figs { gap: 12px; padding-top: 8px; border-top: 1px solid var(--border); }
</style>
