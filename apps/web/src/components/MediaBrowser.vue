<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { Check, FileText, Film, Link as LinkIcon, Trash2 } from 'lucide-vue-next';
import QueryState from './QueryState.vue';
import FileDrop from './ui/FileDrop.vue';
import Tabs from './ui/Tabs.vue';
import Button from './ui/Button.vue';
import Input from './ui/Input.vue';
import EmptyState from './ui/EmptyState.vue';
import Spinner from './ui/Spinner.vue';
import { api } from '@/lib/api';
import { useQuery } from '@/lib/query';
import { session } from '@/lib/store';
import { duration, formatBytes } from '@/lib/format';
import { confirm } from '@/lib/confirm';
import { toast } from '@/lib/toast';
import type { Upload } from '@/lib/types';

/**
 * The media library grid: filter, upload (files or URL), select, delete.
 * In picker mode (`pick`) clicking toggles selection and nothing is deletable.
 */
const props = defineProps<{ pick?: boolean; selected?: string[]; accept?: string; max?: number }>();
const emit = defineEmits<{ 'update:selected': [ids: string[]]; picked: [items: Upload[]] }>();

const kind = ref('all'); const unusedOnly = ref(false); const limit = ref(48);
const tabs = [{ value: 'all', label: 'All' }, { value: 'image', label: 'Images' }, { value: 'video', label: 'Videos' }, { value: 'document', label: 'Documents' }];
const list = useQuery(() => api.get<Upload[]>('/upload/', { teamId: session.teamId, type: kind.value === 'all' ? undefined : kind.value, status: unusedOnly.value ? 'UNUSED' : undefined, limit: limit.value }),
  { deps: [kind, unusedOnly, limit, () => session.teamId], enabled: () => !!session.teamId });
watch([kind, unusedOnly], () => { limit.value = 48; });
const items = computed(() => list.data.value ?? []);

// ── upload ──
const uploading = ref(0); const url = ref(''); const adding = ref(false);
async function upload(files: File[]) {
  for (const f of files) {
    uploading.value++;
    try {
      const form = new FormData();
      if (session.teamId) form.append('teamId', session.teamId);
      form.append('file', f);
      const u = await api.upload<Upload>('/upload/', form);
      await list.reload();
      if (props.pick) select(u, true);
    } catch (e) { toast.fail(e, `Could not upload ${f.name}`); } finally { uploading.value--; }
  }
  if (files.length) toast.success(files.length === 1 ? 'Uploaded' : `${files.length} files processed`);
}
async function addUrl() {
  if (!url.value.trim()) return;
  adding.value = true;
  try { const u = await api.post<Upload>('/upload/from-url', { teamId: session.teamId, url: url.value.trim() }); url.value = ''; await list.reload(); if (props.pick) select(u, true); toast.success('Imported from URL'); }
  catch (e) { toast.fail(e); } finally { adding.value = false; }
}

// ── selection ──
const sel = computed(() => new Set(props.selected ?? []));
function select(u: Upload, force?: boolean) {
  const cur = [...sel.value];
  const i = cur.indexOf(u.id);
  let next: string[];
  if (i >= 0 && !force) next = cur.filter((x) => x !== u.id);
  else if (i >= 0) next = cur;
  else next = props.max === 1 ? [u.id] : [...cur, u.id];
  if (props.max && next.length > props.max) next = next.slice(-props.max);
  emit('update:selected', next);
  emit('picked', items.value.filter((x) => next.includes(x.id)));
}
const marked = ref<Set<string>>(new Set());
function mark(u: Upload) { const s = new Set(marked.value); if (s.has(u.id)) s.delete(u.id); else s.add(u.id); marked.value = s; }
function click(u: Upload) { if (props.pick) select(u); else mark(u); }
async function removeMarked() {
  const ids = [...marked.value];
  if (!ids.length || !(await confirm({ title: `Delete ${ids.length} file${ids.length === 1 ? '' : 's'}?`, message: 'Files used by scheduled posts are refused. This cannot be undone.', confirmLabel: 'Delete', danger: true }))) return;
  try { await api.del('/upload/', { ids }); marked.value = new Set(); await list.reload(); toast.success('Deleted'); } catch (e) { toast.fail(e); }
}
defineExpose({ reload: list.reload });
</script>

<template>
  <div class="stack-16">
    <FileDrop :accept="accept ?? 'image/*,video/*,application/pdf'" compact title="Drop files here or click to upload" hint="Images, video and documents" @files="upload" />
    <div v-if="uploading" class="row small muted"><Spinner :size="14" /> Uploading {{ uploading }} file{{ uploading === 1 ? '' : 's' }}…</div>
    <form class="row" @submit.prevent="addUrl">
      <div class="grow"><Input v-model="url" size="sm" type="url" placeholder="…or paste a file URL" aria-label="Import from URL" /></div>
      <Button type="submit" size="sm" :icon="LinkIcon" :loading="adding" :disabled="!url.trim()">Import</Button>
    </form>
    <div class="row wrap between">
      <Tabs v-model="kind" :tabs="tabs" size="sm" variant="pill" />
      <div class="row">
        <label class="row small gap-4"><input v-model="unusedOnly" type="checkbox" /> Unused only</label>
        <Button v-if="!pick && marked.size" size="sm" variant="danger" :icon="Trash2" @click="removeMarked">Delete {{ marked.size }}</Button>
      </div>
    </div>
    <QueryState :loading="list.loading.value" :error="list.error.value" :status="list.status.value" :has-data="!!list.data.value" feature="The media library" skeleton="cards" @retry="list.reload">
      <EmptyState v-if="!items.length" title="No media yet" description="Upload an image or video, then attach it to any post." compact />
      <div v-else class="grid">
        <button v-for="u in items" :key="u.id" type="button" class="m" :class="{ on: pick ? sel.has(u.id) : marked.has(u.id) }" :aria-pressed="pick ? sel.has(u.id) : marked.has(u.id)" @click="click(u)">
          <img v-if="u.type === 'image' && (u.thumbnailUrl || u.url)" :src="(u.thumbnailUrl || u.url)!" alt="" loading="lazy" />
          <img v-else-if="u.thumbnailUrl" :src="u.thumbnailUrl" alt="" loading="lazy" />
          <span v-else class="ph"><Film v-if="u.type === 'video'" :size="24" /><FileText v-else :size="24" /></span>
          <span class="meta"><span class="truncate">{{ u.ext?.toUpperCase() ?? u.type }}</span><span>{{ u.type === 'video' && u.videoLength ? duration(u.videoLength) : formatBytes(u.fileSize) }}</span></span>
          <span v-if="(pick ? sel.has(u.id) : marked.has(u.id))" class="tick"><Check :size="14" /></span>
        </button>
      </div>
      <div v-if="items.length >= limit" class="row" style="justify-content: center"><Button size="sm" @click="limit += 48">Load more</Button></div>
    </QueryState>
  </div>
</template>

<style scoped>
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px; }
.m { position: relative; aspect-ratio: 1; border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; padding: 0; background: var(--bg-muted); cursor: pointer; display: block; }
.m:hover { border-color: var(--border-strong); }
.m.on { outline: 2px solid var(--accent); outline-offset: -2px; }
.m img { width: 100%; height: 100%; object-fit: cover; display: block; }
.ph { width: 100%; height: 100%; display: grid; place-items: center; color: var(--text-subtle); }
.meta { position: absolute; left: 0; right: 0; bottom: 0; display: flex; justify-content: space-between; gap: 4px; padding: 4px 8px; font-size: var(--fs-12); line-height: 16px; background: rgba(0, 0, 0, 0.6); color: #fff; }
.tick { position: absolute; top: 6px; right: 6px; width: 22px; height: 22px; border-radius: 50%; background: var(--accent); color: var(--accent-fg); display: grid; place-items: center; }
</style>
