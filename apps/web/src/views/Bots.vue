<script setup lang="ts">
import { reactive, ref } from 'vue';
import { Bot as BotIcon, Pencil, Plus, Trash2 } from 'lucide-vue-next';
import PageHead from '@/components/PageHead.vue';
import NoTeam from '@/components/NoTeam.vue';
import QueryState from '@/components/QueryState.vue';
import Avatar from '@/components/ui/Avatar.vue';
import Button from '@/components/ui/Button.vue';
import Input from '@/components/ui/Input.vue';
import Modal from '@/components/ui/Modal.vue';
import EmptyState from '@/components/ui/EmptyState.vue';
import Table from '@/components/ui/Table.vue';
import CopyField from '@/components/CopyField.vue';
import { api, isApiError, issuesByPath } from '@/lib/api';
import { useQuery } from '@/lib/query';
import { session, timezone } from '@/lib/store';
import { formatDateTime } from '@/lib/format';
import { confirm } from '@/lib/confirm';
import { toast } from '@/lib/toast';
import type { Bot } from '@/lib/types';

const list = useQuery(() => api.get<{ items: Bot[]; total: number }>('/bot', { teamId: session.teamId }), { deps: [() => session.teamId], enabled: () => !!session.teamId });
const form = reactive({ id: '' as string, name: '', avatarUrl: '' }); const open = ref(false); const busy = ref(false); const errs = ref<Record<string, string>>({});
function edit(b?: Bot) { Object.assign(form, { id: b?.id ?? '', name: b?.name ?? '', avatarUrl: b?.avatarUrl ?? '' }); errs.value = {}; open.value = true; }
async function save() {
  busy.value = true; errs.value = {};
  try {
    const body = { name: form.name.trim(), ...(form.avatarUrl.trim() ? { avatarUrl: form.avatarUrl.trim() } : {}) };
    if (form.id) await api.patch(`/bot/${form.id}`, body); else await api.post('/bot', { teamId: session.teamId, ...body });
    open.value = false; await list.reload(); toast.success(form.id ? 'Bot updated' : 'Bot created');
  } catch (e) { if (isApiError(e)) errs.value = issuesByPath(e.issues); toast.fail(e); } finally { busy.value = false; }
}
const cols = [{ key: 'name', label: 'Bot' }, { key: 'id', label: 'Bot ID', hideSm: true }, { key: 'createdAt', label: 'Created', width: '180px', hideSm: true }, { key: 'actions', label: '', width: '100px', align: 'right' as const }];
async function remove(b: Bot) {
  if (!(await confirm({ title: `Delete ${b.name}?`, confirmLabel: 'Delete bot', danger: true }))) return;
  try { await api.del(`/bot/${b.id}`); await list.reload(); toast.success('Bot deleted'); } catch (e) { toast.fail(e); }
}
</script>

<template>
  <div class="page wide">
    <PageHead title="Bots" subtitle="Named identities this team’s automations and Discord/Slack messages post as. Up to 50 per team.">
      <Button v-if="session.teamId" variant="primary" :icon="Plus" @click="edit()">New bot</Button>
    </PageHead>
    <NoTeam v-if="!session.teamId" />
    <QueryState v-else :loading="list.loading.value" :error="list.error.value" :status="list.status.value" :has-data="!!list.data.value" feature="Bots" @retry="list.reload">
      <Table :columns="cols" :rows="list.data.value?.items ?? []" :loading="list.loading.value">
        <template #cell-name="{ row }"><div class="row bot"><Avatar :src="row.avatarUrl" :name="row.name" :size="28" /><span class="strong">{{ row.name }}</span></div></template>
        <template #cell-id="{ row }"><code>{{ row.id }}</code></template>
        <template #cell-createdAt="{ row }"><span class="small muted">{{ formatDateTime(row.createdAt, timezone) }}</span></template>
        <template #cell-actions="{ row }"><div class="row" style="justify-content: flex-end"><Button iconOnly size="sm" variant="ghost" label="Edit bot" :icon="Pencil" @click="edit(row)" /><Button iconOnly size="sm" variant="danger-ghost" label="Delete bot" :icon="Trash2" @click="remove(row)" /></div></template>
        <template #empty><EmptyState :icon="BotIcon" title="No bots yet" description="Create a bot to give automated posts their own name and avatar."><Button variant="primary" :icon="Plus" @click="edit()">Create a bot</Button></EmptyState></template>
      </Table>
    </QueryState>
    <Modal :open="open" :title="form.id ? 'Edit bot' : 'New bot'" description="A name and avatar for this team’s automated posts." size="sm" @close="open = false">
      <form class="stack-16" @submit.prevent="save">
        <div class="row preview"><Avatar :src="form.avatarUrl.trim() || null" :name="form.name.trim() || '?'" :size="40" /><div><div class="strong">{{ form.name.trim() || 'Bot name' }}</div><div class="tiny muted">Preview</div></div></div>
        <Input v-model="form.name" label="Name" placeholder="e.g. Halo Support" required autofocus :error="errs.name" />
        <Input v-model="form.avatarUrl" label="Avatar URL" type="url" placeholder="https://…" help="Optional. A square image works best." :error="errs.avatarUrl" />
        <CopyField v-if="form.id" :value="form.id" label="Bot ID" help="Use this ID with the API’s bot endpoints." />
        <div class="row" style="justify-content: flex-end"><Button variant="secondary" @click="open = false">Cancel</Button><Button type="submit" variant="primary" :loading="busy" :disabled="!form.name.trim()">{{ form.id ? 'Save' : 'Create bot' }}</Button></div>
      </form>
    </Modal>
  </div>
</template>

<style scoped>
.bot { gap: 10px; }
.preview { gap: 12px; padding: 12px; border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--bg-subtle); }
</style>
