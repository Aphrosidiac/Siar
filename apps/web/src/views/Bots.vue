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
import { api, isApiError, issuesByPath } from '@/lib/api';
import { useQuery } from '@/lib/query';
import { session } from '@/lib/store';
import { relative } from '@/lib/format';
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
async function remove(b: Bot) {
  if (!(await confirm({ title: `Delete ${b.name}?`, confirmLabel: 'Delete bot', danger: true }))) return;
  try { await api.del(`/bot/${b.id}`); await list.reload(); toast.success('Bot deleted'); } catch (e) { toast.fail(e); }
}
</script>

<template>
  <div class="page narrow">
    <PageHead title="Bots" subtitle="Named identities this team’s automations and Discord/Slack messages can post as.">
      <Button v-if="session.teamId" variant="primary" :icon="Plus" @click="edit()">New bot</Button>
    </PageHead>
    <NoTeam v-if="!session.teamId" />
    <QueryState v-else :loading="list.loading.value" :error="list.error.value" :status="list.status.value" :has-data="!!list.data.value" feature="Bots" @retry="list.reload">
      <EmptyState v-if="!list.data.value?.items.length" :icon="BotIcon" title="No bots yet" description="Create a bot to give automated posts a name and avatar."><Button variant="primary" :icon="Plus" @click="edit()">Create a bot</Button></EmptyState>
      <div v-else class="panel-list">
        <div v-for="b in list.data.value.items" :key="b.id" class="item">
          <Avatar :src="b.avatarUrl" :name="b.name" :size="36" />
          <div class="grow"><div class="strong">{{ b.name }}</div><div class="tiny muted">Created {{ relative(b.createdAt) }}</div></div>
          <Button iconOnly size="sm" variant="ghost" label="Edit bot" :icon="Pencil" @click="edit(b)" />
          <Button iconOnly size="sm" variant="danger-ghost" label="Delete bot" :icon="Trash2" @click="remove(b)" />
        </div>
      </div>
    </QueryState>
    <Modal :open="open" :title="form.id ? 'Edit bot' : 'New bot'" size="sm" @close="open = false">
      <form class="stack-16" @submit.prevent="save">
        <Input v-model="form.name" label="Name" required autofocus :error="errs.name" />
        <Input v-model="form.avatarUrl" label="Avatar URL (optional)" type="url" placeholder="https://…" :error="errs.avatarUrl" />
        <div class="row" style="justify-content: flex-end"><Button variant="secondary" @click="open = false">Cancel</Button><Button type="submit" variant="primary" :loading="busy" :disabled="!form.name.trim()">{{ form.id ? 'Save' : 'Create' }}</Button></div>
      </form>
    </Modal>
  </div>
</template>
