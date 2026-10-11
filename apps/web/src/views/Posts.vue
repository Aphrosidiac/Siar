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
import PostDrawer from '@/components/PostDrawer.vue';
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

// ── detail drawer (deep-linkable: /posts/:id) ──
const openId = computed(() => (route.params.id as string | undefined) ?? null);
function open(p: Post) { void router.push(`/posts/${p.id}`); }
function close() { void router.push('/posts'); }
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
        <Tabs v-model="status" :tabs="statusTabs" variant="pill" />
        <span class="spacer" />
        <Select v-model="platform" size="sm" :options="NETWORKS.map((n) => ({ value: n.type, label: n.name }))" placeholder="All networks" clearable aria-label="Filter by network" />
        <Select v-model="order" size="sm" :options="[{ value: 'postDate:DESC', label: 'Newest first' }, { value: 'postDate:ASC', label: 'Oldest first' }, { value: 'createdAt:DESC', label: 'Recently created' }]" aria-label="Sort" />
        <div class="search"><Input v-model="q" size="sm" placeholder="Search posts" aria-label="Search posts" /></div>
      </div>
      <QueryState :loading="list.loading.value" :error="list.error.value" :status="list.status.value" :has-data="!!list.data.value" feature="Posts" @retry="list.reload">
        <Table :columns="columns" :rows="list.data.value?.items ?? []" :loading="list.loading.value" clickable @row-click="open">
          <template #cell-title="{ row }">
            <div class="row">
              <img v-if="mediaOf(row)[0]?.thumbnailUrl" :src="mediaOf(row)[0]!.thumbnailUrl!" class="thumb" alt="" />
              <div class="grow"><div class="truncate ttl t1">{{ row.title || 'Untitled post' }}</div>
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

    <PostDrawer :id="openId" @close="close" @changed="list.reload" />
  </div>
</template>

<style scoped>
.ttl { max-width: 460px; }
.t1 { font-weight: 500; }
.search { width: 240px; }
.toolbar { margin-bottom: 20px; }
@media (max-width: 1100px) { .search { width: 100%; order: -1; } }
@media (max-width: 640px) { .toolbar .spacer { display: none; } .toolbar > :deep(.field) { flex: 1 1 140px; } }
.only-sm { display: none; }
@media (max-width: 640px) { .ttl { max-width: 40vw; } .only-sm { display: block; } }
</style>
