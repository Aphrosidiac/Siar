<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ExternalLink, PenSquare, Plus, RotateCw, Trash2, Send } from 'lucide-vue-next';
import PageHead from '@/components/PageHead.vue';
import NoTeam from '@/components/NoTeam.vue';
import QueryState from '@/components/QueryState.vue';
import StatusBadge from '@/components/StatusBadge.vue';
import PostNetworks from '@/components/PostNetworks.vue';
import NetworkIcon from '@/components/NetworkIcon.vue';
import Button from '@/components/ui/Button.vue';
import Input from '@/components/ui/Input.vue';
import Select from '@/components/ui/Select.vue';
import Tabs from '@/components/ui/Tabs.vue';
import Table from '@/components/ui/Table.vue';
import Pager from '@/components/ui/Pager.vue';
import Drawer from '@/components/ui/Drawer.vue';
import EmptyState from '@/components/ui/EmptyState.vue';
import { api } from '@/lib/api';
import { useQuery } from '@/lib/query';
import { session, timezone } from '@/lib/store';
import { NETWORKS, networkName } from '@/lib/networks';
import { formatDateTime, relative, handle } from '@/lib/format';
import { confirm } from '@/lib/confirm';
import { toast } from '@/lib/toast';
import type { Paged, Post } from '@/lib/types';

const route = useRoute(); const router = useRouter();
const status = ref('ALL'); const q = ref(''); const platform = ref<string | null>(null); const offset = ref(0); const limit = 20;
const order = ref('postDate:DESC');
const statusTabs = [{ value: 'ALL', label: 'All' }, { value: 'SCHEDULED', label: 'Scheduled' }, { value: 'POSTED', label: 'Posted' }, { value: 'ERROR', label: 'Failed' }, { value: 'DRAFT', label: 'Drafts' }, { value: 'PROCESSING', label: 'Publishing' }];
let qTimer = 0;
const debouncedQ = ref('');
watch(q, (v) => { clearTimeout(qTimer); qTimer = window.setTimeout(() => { debouncedQ.value = v.trim(); }, 300); });
watch([status, debouncedQ, platform, order, () => session.teamId], () => { offset.value = 0; });

const list = useQuery(() => {
  const [orderBy, ord] = order.value.split(':');
  return api.get<Paged<Post>>('/post/', { teamId: session.teamId, status: status.value === 'ALL' ? undefined : status.value, q: debouncedQ.value, platforms: platform.value ? [platform.value] : undefined, orderBy, order: ord, limit, offset: offset.value });
}, { deps: [status, debouncedQ, platform, order, offset, () => session.teamId], enabled: () => !!session.teamId });

const columns = [
  { key: 'title', label: 'Post' }, { key: 'networks', label: 'Networks', width: '170px', hideSm: true }, { key: 'status', label: 'Status', width: '130px' },
  { key: 'postDate', label: 'When', width: '170px', hideSm: true },
];

// ── detail drawer ──
const openId = computed(() => (route.params.id as string | undefined) ?? null);
const detail = useQuery(() => api.get<Post>(`/post/${openId.value}`), { deps: [openId], enabled: () => !!openId.value });
function open(p: Post) { void router.push(`/posts/${p.id}`); }
function close() { void router.push('/posts'); }
const busy = ref(false);
async function retry(p: Post) {
  busy.value = true;
  try { await api.post(`/post/${p.id}/retry`); toast.success('Retry queued'); await Promise.all([detail.reload(), list.reload()]); } catch (e) { toast.fail(e); } finally { busy.value = false; }
}
async function remove(p: Post) {
  if (!(await confirm({ title: 'Delete this post?', message: p.status === 'POSTED' ? 'It is removed from Siar. Copies already published on the networks stay up unless you delete them there.' : 'It will not be published.', confirmLabel: 'Delete', danger: true }))) return;
  busy.value = true;
  try { await api.del(`/post/${p.id}`); toast.success('Post deleted'); if (openId.value === p.id) close(); await list.reload(); } catch (e) { toast.fail(e); } finally { busy.value = false; }
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
  <div class="page wide">
    <PageHead title="Posts" subtitle="Everything scheduled, published and failed for this team.">
      <Button variant="primary" :icon="Plus" to="/compose">New post</Button>
    </PageHead>
    <NoTeam v-if="!session.teamId" />
    <template v-else>
      <div class="toolbar">
        <div class="grow" style="min-width: 220px; max-width: 360px">
          <Input v-model="q" size="sm" placeholder="Search posts" aria-label="Search posts" />
        </div>
        <Select v-model="platform" size="sm" :options="NETWORKS.map((n) => ({ value: n.type, label: n.name }))" placeholder="All networks" clearable aria-label="Filter by network" />
        <Select v-model="order" size="sm" :options="[{ value: 'postDate:DESC', label: 'Newest first' }, { value: 'postDate:ASC', label: 'Oldest first' }, { value: 'createdAt:DESC', label: 'Recently created' }]" aria-label="Sort" />
      </div>
      <Tabs v-model="status" :tabs="statusTabs" class="mb-16" />
      <QueryState :loading="list.loading.value" :error="list.error.value" :status="list.status.value" :has-data="!!list.data.value" feature="Posts" @retry="list.reload">
        <Table :columns="columns" :rows="list.data.value?.items ?? []" :loading="list.loading.value" clickable @row-click="open">
          <template #cell-title="{ row }">
            <div class="row">
              <img v-if="mediaOf(row)[0]?.thumbnailUrl" :src="mediaOf(row)[0]!.thumbnailUrl!" class="thumb" alt="" />
              <div class="grow"><div class="truncate strong ttl">{{ row.title || 'Untitled post' }}</div>
                <div v-if="row.error" class="tiny danger-text truncate ttl">{{ row.error }}</div><div class="only-sm mt-8"><PostNetworks :targets="row.socialAccounts ?? []" :size="20" /></div></div>
            </div>
          </template>
          <template #cell-networks="{ row }"><PostNetworks :targets="row.socialAccounts ?? []" /></template>
          <template #cell-status="{ row }"><StatusBadge :status="row.status" /></template>
          <template #cell-postDate="{ row }"><span class="small nowrap">{{ formatDateTime(row.postedDate ?? row.postDate, timezone) }}</span></template>
          <template #empty>
            <EmptyState :icon="Send" :title="debouncedQ || platform || status !== 'ALL' ? 'No posts match these filters' : 'No posts yet'" :description="debouncedQ || platform || status !== 'ALL' ? 'Try a different status, network or search.' : 'Write your first post once an account is connected.'">
              <Button variant="primary" :icon="PenSquare" to="/compose">Write a post</Button>
            </EmptyState>
          </template>
        </Table>
        <Pager v-if="list.data.value" :total="list.data.value.total" :limit="limit" v-model:offset="offset" class="mt-16" />
      </QueryState>
    </template>

    <Drawer :open="!!openId" title="Post" :width="560" @close="close">
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
  </div>
</template>

<style scoped>
.ttl { max-width: 460px; }
.only-sm { display: none; }
@media (max-width: 640px) { .ttl { max-width: 40vw; } .only-sm { display: block; } }
.net { border: 1px solid var(--border); border-radius: var(--radius); padding: 12px; }
</style>
