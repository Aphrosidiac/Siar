<script setup lang="ts">
import { ref, watch } from 'vue';
import { Bell, CheckCheck } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import Modal from './ui/Modal.vue';
import QueryState from './QueryState.vue';
import Button from './ui/Button.vue';
import Input from './ui/Input.vue';
import Tabs from './ui/Tabs.vue';
import Pager from './ui/Pager.vue';
import EmptyState from './ui/EmptyState.vue';
import { api } from '@/lib/api';
import { useQuery } from '@/lib/query';
import { relative } from '@/lib/format';
import { toast } from '@/lib/toast';

/** Opened from the bell: failed posts, reconnect requests and other things that need you. */
interface N { id: string; title?: string | null; body?: string | null; link?: string | null; kind?: string | null; readAt?: string | null; createdAt?: string | null }
const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{ close: []; changed: [] }>();
const router = useRouter();
const filter = ref('all'); const q = ref(''); const dq = ref(''); const offset = ref(0); const limit = 20;
let t = 0;
watch(q, (v) => { clearTimeout(t); t = window.setTimeout(() => { dq.value = v.trim(); }, 300); });
watch([filter, dq], () => { offset.value = 0; });
const list = useQuery(() => api.get<{ items: N[]; total: number; unread?: number }>('/notification', { limit, offset: offset.value, q: dq.value, unread: filter.value === 'unread' ? true : undefined }), { deps: [filter, dq, offset, () => props.open], enabled: () => props.open });
async function openItem(n: N) {
  if (!n.readAt) { try { await api.post(`/notification/${n.id}/read`); n.readAt = new Date().toISOString(); emit('changed'); } catch { /* keep going */ } }
  if (n.link?.startsWith('/')) { emit('close'); void router.push(n.link); }
}
async function readAll() { try { await api.post('/notification/read-all'); await list.reload(); emit('changed'); toast.success('All caught up'); } catch (e) { toast.fail(e); } }
const tone = (k?: string | null) => (k?.includes('error') || k?.includes('fail') ? 'var(--danger)' : k?.includes('success') || k?.includes('published') ? 'var(--success)' : 'var(--text)');
</script>

<template>
  <Modal :open="open" title="Notifications" description="Failed posts, reconnect requests and other things that need you." size="xl" @close="emit('close')">
    <div class="toolbar">
      <Tabs v-model="filter" variant="pill" size="sm" :tabs="[{ value: 'all', label: 'All' }, { value: 'unread', label: 'Unread', badge: list.data.value?.unread || null }]" />
      <span class="spacer" />
      <div class="search"><Input v-model="q" size="sm" placeholder="Search" aria-label="Search notifications" /></div>
      <Button size="sm" :icon="CheckCheck" :disabled="!list.data.value?.unread" @click="readAll">Mark all read</Button>
    </div>
    <QueryState :loading="list.loading.value" :error="list.error.value" :status="list.status.value" :has-data="!!list.data.value" feature="Notifications" @retry="list.reload">
      <EmptyState v-if="!list.data.value?.items.length" :icon="Bell" :title="filter === 'unread' ? 'Nothing unread' : 'No notifications'" description="When something needs your attention it shows up here." compact />
      <template v-else>
        <div class="list">
          <button v-for="n in list.data.value.items" :key="n.id" type="button" class="nt" :class="{ unread: !n.readAt }" @click="openItem(n)">
            <span class="dot" :style="{ background: n.readAt ? 'transparent' : tone(n.kind) }" />
            <span class="grow body"><span class="t">{{ n.title ?? n.body }}</span><span v-if="n.title && n.body" class="small muted prewrap d-block">{{ n.body }}</span></span>
            <span class="tiny muted nowrap">{{ relative(n.createdAt) }}</span>
          </button>
        </div>
        <Pager :total="list.data.value.total" :limit="limit" v-model:offset="offset" />
      </template>
    </QueryState>
  </Modal>
</template>

<style scoped>
.toolbar { margin-bottom: 12px; }
.search { width: 260px; }
.list { border-top: 1px solid var(--text); }
.nt { display: flex; align-items: flex-start; gap: 12px; width: 100%; padding: 14px 4px; border: 0; border-bottom: 1px solid var(--border-soft); background: none; cursor: pointer; color: var(--text); text-align: left; transition: background 180ms; }
.nt:hover { background: var(--bg-hover); }
.body { min-width: 0; }
.t { display: block; font-weight: 500; }
.nt:not(.unread) .t { font-weight: 400; color: var(--text-muted); }
.d-block { display: block; }
.dot { margin-top: 7px; }
@media (max-width: 640px) { .search { width: 100%; order: 5; } }
</style>
