<script setup lang="ts">
import { ref, watch } from 'vue';
import { Bell, CheckCheck } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import PageHead from '@/components/PageHead.vue';
import QueryState from '@/components/QueryState.vue';
import Button from '@/components/ui/Button.vue';
import Input from '@/components/ui/Input.vue';
import Tabs from '@/components/ui/Tabs.vue';
import Pager from '@/components/ui/Pager.vue';
import EmptyState from '@/components/ui/EmptyState.vue';
import { api } from '@/lib/api';
import { useQuery } from '@/lib/query';
import { relative } from '@/lib/format';
import { toast } from '@/lib/toast';

interface N { id: string; title?: string | null; body?: string | null; link?: string | null; kind?: string | null; readAt?: string | null; createdAt?: string | null }
const router = useRouter();
const filter = ref('all'); const q = ref(''); const dq = ref(''); const offset = ref(0); const limit = 20;
let t = 0;
watch(q, (v) => { clearTimeout(t); t = window.setTimeout(() => { dq.value = v.trim(); }, 300); });
watch([filter, dq], () => { offset.value = 0; });
const list = useQuery(() => api.get<{ items: N[]; total: number; unread?: number }>('/notification', { limit, offset: offset.value, q: dq.value, unread: filter.value === 'unread' ? true : undefined }), { deps: [filter, dq, offset] });
async function open(n: N) {
  if (!n.readAt) { try { await api.post(`/notification/${n.id}/read`); n.readAt = new Date().toISOString(); } catch { /* keep going */ } }
  if (n.link?.startsWith('/')) void router.push(n.link);
}
async function readAll() { try { await api.post('/notification/read-all'); await list.reload(); toast.success('All caught up'); } catch (e) { toast.fail(e); } }
const tone = (k?: string | null) => (k?.includes('error') || k?.includes('fail') ? 'var(--danger)' : k?.includes('success') || k?.includes('published') ? 'var(--success)' : 'var(--accent)');
</script>

<template>
  <div class="page narrow">
    <PageHead title="Notifications" subtitle="Failed posts, reconnect requests and other things that need you.">
      <Button :icon="CheckCheck" :disabled="!list.data.value?.unread" @click="readAll">Mark all as read</Button>
    </PageHead>
    <div class="toolbar"><Tabs variant="pill" v-model="filter" :tabs="[{ value: 'all', label: 'All' }, { value: 'unread', label: 'Unread', badge: list.data.value?.unread || null }]" size="sm" /><span class="spacer" /><div style="width: 240px"><Input v-model="q" size="sm" placeholder="Search" aria-label="Search notifications" /></div></div>
    <QueryState :loading="list.loading.value" :error="list.error.value" :status="list.status.value" :has-data="!!list.data.value" feature="Notifications" @retry="list.reload">
      <EmptyState v-if="!list.data.value?.items.length" :icon="Bell" :title="filter === 'unread' ? 'Nothing unread' : 'No notifications'" description="When something needs your attention it shows up here." />
      <template v-else>
        <div class="panel-list">
          <button v-for="n in list.data.value.items" :key="n.id" type="button" class="item nt" :class="{ unread: !n.readAt }" @click="open(n)">
            <span class="dot" :style="{ background: n.readAt ? 'transparent' : tone(n.kind) }" />
            <span class="grow" style="min-width: 0; text-align: left"><span class="strong d-block">{{ n.title ?? n.body }}</span><span v-if="n.title && n.body" class="small muted prewrap d-block">{{ n.body }}</span></span>
            <span class="tiny muted nowrap">{{ relative(n.createdAt) }}</span>
          </button>
        </div>
        <Pager :total="list.data.value.total" :limit="limit" v-model:offset="offset" class="mt-16" />
      </template>
    </QueryState>
  </div>
</template>

<style scoped>
.nt { width: 100%; border: 0; border-top: 1px solid var(--border); background: var(--bg-elevated); cursor: pointer; color: var(--text); align-items: flex-start !important; }
.nt:first-child { border-top: 0; }
.nt:hover { background: var(--bg-hover); }
.nt.unread { background: var(--bg-subtle); }
.d-block { display: block; }
.dot { margin-top: 6px; }
</style>
