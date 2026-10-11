<script setup lang="ts">
import { ref } from 'vue';
import { Plus, Users } from 'lucide-vue-next';
import EmptyState from './ui/EmptyState.vue';
import Button from './ui/Button.vue';
import Modal from './ui/Modal.vue';
import Input from './ui/Input.vue';
import { api } from '@/lib/api';
import { isAdmin, loadTeams, selectTeam } from '@/lib/store';
import { toast } from '@/lib/toast';

const open = ref(false); const name = ref(''); const busy = ref(false);
async function create() {
  busy.value = true;
  try {
    const t = await api.post<{ id: string }>('/team/', { name: name.value.trim() });
    await loadTeams(); selectTeam(t.id); open.value = false; name.value = ''; toast.success('Team created');
  } catch (e) { toast.fail(e); } finally { busy.value = false; }
}
</script>
<template>
  <EmptyState :icon="Users" title="Create a team first" :description="isAdmin ? 'Social accounts, posts and media belong to a team, usually one per brand or client.' : 'Social accounts, posts and media belong to a team. Ask an owner or admin of this organization to create one.'">
    <Button v-if="isAdmin" variant="primary" :icon="Plus" @click="open = true">Create a team</Button>
  </EmptyState>
  <Modal :open="open" title="New team" description="A team holds one brand's social accounts, posts and media." size="sm" @close="open = false">
    <form class="stack-16" @submit.prevent="create">
      <Input v-model="name" label="Name" placeholder="e.g. Halo Fitness" required autofocus />
      <div class="row" style="justify-content: flex-end"><Button variant="secondary" @click="open = false">Cancel</Button><Button type="submit" variant="primary" :loading="busy" :disabled="!name.trim()">Create team</Button></div>
    </form>
  </Modal>
</template>
