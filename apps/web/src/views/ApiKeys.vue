<script setup lang="ts">
import { ref } from 'vue';
import { KeyRound, Plus, RefreshCw, Trash2 } from 'lucide-vue-next';
import PageHead from '@/components/PageHead.vue';
import QueryState from '@/components/QueryState.vue';
import CopyField from '@/components/CopyField.vue';
import Button from '@/components/ui/Button.vue';
import Input from '@/components/ui/Input.vue';
import Modal from '@/components/ui/Modal.vue';
import Table from '@/components/ui/Table.vue';
import Pager from '@/components/ui/Pager.vue';
import EmptyState from '@/components/ui/EmptyState.vue';
import { api } from '@/lib/api';
import { useQuery } from '@/lib/query';
import { formatDateTime, relative } from '@/lib/format';
import { timezone } from '@/lib/store';
import { confirm } from '@/lib/confirm';
import { toast } from '@/lib/toast';

interface Key { id: string; name: string; prefix: string; lastUsedAt?: string | null; createdAt?: string | null }
const offset = ref(0); const limit = 20;
const list = useQuery(() => api.get<{ items: Key[]; total: number }>('/api-key', { limit, offset: offset.value }), { deps: [offset] });
const creating = ref(false); const name = ref(''); const busy = ref(false);
const shown = ref<{ name: string; key: string } | null>(null);
async function create() {
  busy.value = true;
  try { const k = await api.post<{ name?: string; key: string }>('/api-key', { name: name.value.trim() }); creating.value = false; shown.value = { name: k.name ?? name.value, key: k.key }; name.value = ''; await list.reload(); }
  catch (e) { toast.fail(e); } finally { busy.value = false; }
}
async function roll(k: Key) {
  if (!(await confirm({ title: `Roll “${k.name}”?`, message: 'A new key replaces the old one immediately. Anything still using the old key stops working.', confirmLabel: 'Roll key', danger: true }))) return;
  try { const r = await api.post<{ key: string }>(`/api-key/${k.id}/roll`); shown.value = { name: k.name, key: r.key }; await list.reload(); } catch (e) { toast.fail(e); }
}
async function remove(k: Key) {
  if (!(await confirm({ title: `Delete “${k.name}”?`, message: 'Requests using this key start failing immediately.', confirmLabel: 'Delete key', danger: true }))) return;
  try { await api.del(`/api-key/${k.id}`); await list.reload(); toast.success('Key deleted'); } catch (e) { toast.fail(e); }
}
const cols = [{ key: 'name', label: 'Name' }, { key: 'prefix', label: 'Key', hideSm: true }, { key: 'lastUsedAt', label: 'Last used', width: '150px', hideSm: true }, { key: 'createdAt', label: 'Created', width: '150px', hideSm: true }, { key: 'actions', label: '', width: '100px', align: 'right' as const }];
</script>

<template>
  <div class="page">
    <PageHead title="API keys" subtitle="Authenticate server-to-server calls with the x-api-key header. Keys act for the whole organization.">
      <Button variant="primary" :icon="Plus" @click="creating = true">Create key</Button>
    </PageHead>
    <QueryState :loading="list.loading.value" :error="list.error.value" :status="list.status.value" :has-data="!!list.data.value" feature="API keys" @retry="list.reload">
      <Table :columns="cols" :rows="list.data.value?.items ?? []" :loading="list.loading.value">
        <template #cell-name="{ row }"><span class="strong">{{ row.name }}</span></template>
        <template #cell-prefix="{ row }"><code>{{ row.prefix }}…</code></template>
        <template #cell-lastUsedAt="{ row }"><span class="small muted">{{ row.lastUsedAt ? relative(row.lastUsedAt) : 'Never' }}</span></template>
        <template #cell-createdAt="{ row }"><span class="small muted">{{ formatDateTime(row.createdAt, timezone) }}</span></template>
        <template #cell-actions="{ row }"><div class="row" style="justify-content: flex-end"><Button iconOnly size="sm" variant="ghost" label="Roll key" :icon="RefreshCw" @click="roll(row)" /><Button iconOnly size="sm" variant="danger-ghost" label="Delete key" :icon="Trash2" @click="remove(row)" /></div></template>
        <template #empty><EmptyState :icon="KeyRound" title="No API keys" description="Create a key to call the Siar API from your own code."><Button variant="primary" :icon="Plus" @click="creating = true">Create key</Button></EmptyState></template>
      </Table>
      <Pager v-if="list.data.value" :total="list.data.value.total" :limit="limit" v-model:offset="offset" class="mt-16" />
    </QueryState>

    <Modal :open="creating" title="Create API key" size="sm" @close="creating = false">
      <form class="stack-16" @submit.prevent="create">
        <Input v-model="name" label="Name" placeholder="Production server" required autofocus help="So you can tell keys apart later." />
        <div class="row" style="justify-content: flex-end"><Button variant="secondary" @click="creating = false">Cancel</Button><Button type="submit" variant="primary" :loading="busy" :disabled="!name.trim()">Create</Button></div>
      </form>
    </Modal>
    <Modal :open="!!shown" :title="`Key “${shown?.name}”`" size="md" :dismissable="false" @close="shown = null">
      <div class="stack-16">
        <div class="callout warn">Copy this key now. For your security it is shown only once.</div>
        <CopyField :value="shown?.key ?? ''" label="API key" />
        <div class="row" style="justify-content: flex-end"><Button variant="primary" @click="shown = null">I have copied it</Button></div>
      </div>
    </Modal>
  </div>
</template>
