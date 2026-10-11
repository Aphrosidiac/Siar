<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { Download, FileUp } from 'lucide-vue-next';
import PageHead from '@/components/PageHead.vue';
import QueryState from '@/components/QueryState.vue';
import StatusBadge from '@/components/StatusBadge.vue';
import Card from '@/components/ui/Card.vue';
import Button from '@/components/ui/Button.vue';
import Checkbox from '@/components/ui/Checkbox.vue';
import FileDrop from '@/components/ui/FileDrop.vue';
import Drawer from '@/components/ui/Drawer.vue';
import Table from '@/components/ui/Table.vue';
import Pager from '@/components/ui/Pager.vue';
import Select from '@/components/ui/Select.vue';
import EmptyState from '@/components/ui/EmptyState.vue';
import { api, isApiError } from '@/lib/api';
import { useQuery } from '@/lib/query';
import { currentTeam, session, timezone } from '@/lib/store';
import { NETWORKS } from '@/lib/networks';
import { downloadText, formatDateTime } from '@/lib/format';
import { toast } from '@/lib/toast';

interface Imp { id: string; teamId: string; status: string; fileName: string; totalRows: number; processedRows: number; successRows: number; failedRows: number; error?: string | null; createdAt: string; completedAt?: string | null }
interface Row { id: string; rowNumber: number; status: 'SUCCESS' | 'FAILED'; postId?: string | null; error?: string | null }

const offset = ref(0); const limit = 20;
const list = useQuery(() => api.get<{ items: Imp[]; total: number }>('/post-csv-import/', { limit, offset: offset.value }), { deps: [offset] });
const active = computed(() => (list.data.value?.items ?? []).some((i) => ['PENDING', 'PROCESSING', 'RATE_LIMITED'].includes(i.status)));
let timer = 0;
watch(active, (a) => { clearInterval(timer); if (a) timer = window.setInterval(() => void list.reload(), 2500); }, { immediate: true });
onBeforeUnmount(() => clearInterval(timer));

const uploading = ref(false); const uploadError = ref<{ message: string; issues: string[] } | null>(null);
async function upload(files: File[]) {
  const file = files[0]; if (!file) return;
  uploading.value = true; uploadError.value = null;
  try {
    const form = new FormData();
    if (session.teamId) form.append('teamId', session.teamId);
    form.append('file', file);
    const r = await api.upload<Imp>('/post-csv-import/', form);
    toast.success('Import started', `${r.totalRows} rows queued from ${r.fileName}.`);
    offset.value = 0; await list.reload();
  } catch (e) { uploadError.value = { message: (e as Error).message, issues: isApiError(e) ? e.issues.map((i) => i.message) : [] }; } finally { uploading.value = false; }
}

// ── template ──
const PREFIX: Record<string, { p: string; extra: string[] }> = {
  TIKTOK: { p: 'tiktok', extra: ['Privacy'] }, YOUTUBE: { p: 'youtube', extra: ['Title', 'Privacy'] }, INSTAGRAM: { p: 'instagram', extra: ['Type'] }, FACEBOOK: { p: 'facebook', extra: [] },
  TWITTER: { p: 'twitter', extra: [] }, THREADS: { p: 'threads', extra: [] }, LINKEDIN: { p: 'linkedin', extra: [] }, PINTEREST: { p: 'pinterest', extra: ['BoardName'] },
  REDDIT: { p: 'reddit', extra: ['Subreddit'] }, MASTODON: { p: 'mastodon', extra: ['Privacy'] }, DISCORD: { p: 'discord', extra: ['ChannelId'] }, SLACK: { p: 'slack', extra: ['ChannelId'] },
  BLUESKY: { p: 'bluesky', extra: [] }, GOOGLE_BUSINESS: { p: 'googleBusiness', extra: [] },
};
const chosen = ref<Set<string>>(new Set(['MASTODON', 'BLUESKY']));
function tog(t: string, on: boolean) { const s = new Set(chosen.value); if (on) s.add(t); else s.delete(t); chosen.value = s; }
const q = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
function template() {
  const types = NETWORKS.map((n) => n.type).filter((t) => chosen.value.has(t) && PREFIX[t]);
  const cols: [string, string][] = [['teamId', session.teamId ?? 'YOUR_TEAM_ID'], ['title', 'Launch announcement'], ['text', 'Text used by every network without its own text column'], ['postDate', new Date(Date.now() + 86400_000).toISOString()], ['status', 'SCHEDULED'], ['socialAccountTypes', types.join('#')]];
  for (const t of types) { const { p, extra } = PREFIX[t]!; for (const x of extra) cols.push([p + x, '']); cols.push([`${p}MediaUrls`, ''], [`${p}FirstComment`, '']); }
  downloadText('siar-bulk-posts.csv', `${cols.map((c) => c[0]).join(',')}\r\n${cols.map((c) => q(c[1])).join(',')}\r\n`, 'text/csv');
}

// ── rows drawer ──
const viewing = ref<Imp | null>(null); const rowStatus = ref<string | null>(null); const rOffset = ref(0);
const rows = useQuery(() => api.get<{ items: Row[]; total: number }>(`/post-csv-import/${viewing.value!.id}/rows`, { status: rowStatus.value, limit: 25, offset: rOffset.value }), { deps: [() => viewing.value?.id, rowStatus, rOffset], enabled: () => !!viewing.value });
watch(viewing, () => { rowStatus.value = null; rOffset.value = 0; });
const cols = [{ key: 'fileName', label: 'File' }, { key: 'status', label: 'Status', width: '170px' }, { key: 'progress', label: 'Rows', width: '200px' }, { key: 'createdAt', label: 'Uploaded', width: '160px', hideSm: true }];
const rcols = [{ key: 'rowNumber', label: 'Row', width: '70px' }, { key: 'status', label: 'Result', width: '110px' }, { key: 'error', label: 'Detail' }];
</script>

<template>
  <div class="page">
    <PageHead title="Bulk post" subtitle="Schedule hundreds of posts from one CSV file. Each row becomes a post, with its own text, networks and media URLs." />
    <div class="grid-2" style="align-items: start">
      <Card title="1. Get the template" :subtitle="currentTeam ? `Pre-filled with the ID of ${currentTeam.name}.` : undefined">
        <div class="stack-16">
          <div class="grid-2" style="gap: 4px 12px"><Checkbox v-for="n in NETWORKS.filter((x) => PREFIX[x.type])" :key="n.type" :model-value="chosen.has(n.type)" :label="n.name" @update:model-value="tog(n.type, $event)" /></div>
          <div><Button :icon="Download" :disabled="!chosen.size" @click="template">Download template</Button></div>
          <p class="small muted">Separate several networks or several media URLs with <code>#</code>. Dates are ISO 8601 (<code>2026-11-01T09:00:00Z</code>). Status is SCHEDULED or DRAFT.</p>
        </div>
      </Card>
      <Card title="2. Upload your CSV">
        <div class="stack-16">
          <FileDrop accept=".csv,text/csv" :multiple="false" title="Drop a .csv file here or click to browse" hint="Up to 10 MB" :disabled="uploading" @files="upload" />
          <div v-if="uploadError" class="callout danger" role="alert"><div><div class="strong">{{ uploadError.message }}</div><ul v-if="uploadError.issues.length > 1" class="small" style="margin: 4px 0 0; padding-left: 16px"><li v-for="i in uploadError.issues.slice(0, 8)" :key="i">{{ i }}</li></ul></div></div>
        </div>
      </Card>
    </div>

    <h2 class="mt-24 mb-8">Imports</h2>
    <QueryState :loading="list.loading.value" :error="list.error.value" :status="list.status.value" :has-data="!!list.data.value" feature="Bulk import" @retry="list.reload">
      <Table :columns="cols" :rows="list.data.value?.items ?? []" clickable @row-click="(r) => (viewing = r)">
        <template #cell-fileName="{ row }"><span class="strong">{{ row.fileName }}</span></template>
        <template #cell-status="{ row }"><StatusBadge :status="row.status" /></template>
        <template #cell-progress="{ row }">
          <div class="small">{{ row.processedRows }} / {{ row.totalRows }} <span class="success-text">{{ row.successRows }} ok</span> <span v-if="row.failedRows" class="danger-text">{{ row.failedRows }} failed</span></div>
          <div class="bar"><i :style="{ width: `${row.totalRows ? Math.round((row.processedRows / row.totalRows) * 100) : 0}%` }" /></div>
        </template>
        <template #cell-createdAt="{ row }"><span class="small muted">{{ formatDateTime(row.createdAt, timezone) }}</span></template>
        <template #empty><EmptyState :icon="FileUp" title="No imports yet" description="Upload a CSV above and its progress shows up here." /></template>
      </Table>
      <Pager v-if="list.data.value" :total="list.data.value.total" :limit="limit" v-model:offset="offset" class="mt-16" />
    </QueryState>

    <Drawer :open="!!viewing" :title="viewing?.fileName ?? 'Import'" :width="640" @close="viewing = null">
      <div v-if="viewing" class="stack-16">
        <div v-if="viewing.error" class="callout danger">{{ viewing.error }}</div>
        <Select v-model="rowStatus" size="sm" placeholder="All rows" clearable :options="[{ value: 'FAILED', label: 'Failed only' }, { value: 'SUCCESS', label: 'Succeeded only' }]" aria-label="Filter rows" />
        <QueryState :loading="rows.loading.value" :error="rows.error.value" :status="rows.status.value" :has-data="!!rows.data.value" feature="Import rows" @retry="rows.reload">
          <Table :columns="rcols" :rows="rows.data.value?.items ?? []">
            <template #cell-status="{ row }"><StatusBadge :status="row.status" size="sm" /></template>
            <template #cell-error="{ row }"><router-link v-if="row.postId" :to="`/posts/${row.postId}`">Open post</router-link><span v-else class="small prewrap">{{ row.error }}</span></template>
            <template #empty><EmptyState compact title="No rows to show" /></template>
          </Table>
          <Pager v-if="rows.data.value" :total="rows.data.value.total" :limit="25" v-model:offset="rOffset" class="mt-16" />
        </QueryState>
      </div>
    </Drawer>
  </div>
</template>

<style scoped>
.bar { height: 4px; background: var(--bg-muted); border-radius: 2px; margin-top: 4px; overflow: hidden; }
.bar i { display: block; height: 100%; background: var(--accent); }
</style>
