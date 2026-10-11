<script setup lang="ts">
import { computed, ref } from 'vue';
import { ExternalLink, PenSquare, RotateCw, Trash2 } from 'lucide-vue-next';
import QueryState from './QueryState.vue';
import StatusBadge from './StatusBadge.vue';
import NetworkIcon from './NetworkIcon.vue';
import Button from './ui/Button.vue';
import Drawer from './ui/Drawer.vue';
import { api } from '@/lib/api';
import { useQuery } from '@/lib/query';
import { timezone } from '@/lib/store';
import { networkName } from '@/lib/networks';
import { formatDateTime, relative, handle } from '@/lib/format';
import { confirm } from '@/lib/confirm';
import { toast } from '@/lib/toast';
import type { Post } from '@/lib/types';

/** Post detail: per-network status, errors verbatim, retry / edit / delete. Used by Posts and Calendar. */
const props = defineProps<{ id: string | null }>();
const emit = defineEmits<{ close: []; changed: [] }>();
const detail = useQuery(() => api.get<Post>(`/post/${props.id}`), { deps: [() => props.id], enabled: () => !!props.id });
const busy = ref(false);
async function retry(p: Post) {
  busy.value = true;
  try { await api.post(`/post/${p.id}/retry`); toast.success('Retry queued'); await detail.reload(); emit('changed'); } catch (e) { toast.fail(e); } finally { busy.value = false; }
}
async function remove(p: Post) {
  if (!(await confirm({ title: 'Delete this post?', message: p.status === 'POSTED' ? 'It is removed from Siar. Copies already published on the networks stay up unless you delete them there.' : 'It will not be published.', confirmLabel: 'Delete', danger: true }))) return;
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
</style>
