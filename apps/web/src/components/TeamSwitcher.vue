<script setup lang="ts">
import { ref } from 'vue';
import { Check, ChevronDown, Plus } from 'lucide-vue-next';
import Dropdown from './ui/Dropdown.vue';
import Avatar from './ui/Avatar.vue';
import Button from './ui/Button.vue';
import Modal from './ui/Modal.vue';
import Input from './ui/Input.vue';
import { api } from '@/lib/api';
import { currentTeam, loadTeams, selectTeam, session } from '@/lib/store';
import { toast } from '@/lib/toast';

/** The team (social set) everything on screen is scoped to — the first thing in the top bar. */
const newTeam = ref(false); const teamName = ref(''); const busy = ref(false);
async function createTeam() {
  busy.value = true;
  try {
    const t = await api.post<{ id: string }>('/team/', { name: teamName.value.trim() });
    await loadTeams(); selectTeam(t.id); newTeam.value = false; teamName.value = ''; toast.success('Team created');
  } catch (e) { toast.fail(e); } finally { busy.value = false; }
}
</script>
<template>
  <Dropdown :width="260">
    <template #trigger="{ toggle }">
      <button type="button" class="ts" aria-label="Switch team" @click="toggle">
        <Avatar :name="currentTeam?.name ?? '?'" :src="currentTeam?.avatarUrl" :size="22" />
        <span class="nm">{{ currentTeam?.name ?? 'No team yet' }}</span><ChevronDown :size="14" class="chev" />
      </button>
    </template>
    <div class="menu-label">Teams</div>
    <button v-for="t in session.teams" :key="t.id" type="button" class="menu-item" data-close @click="selectTeam(t.id)">
      <Avatar :name="t.name" :src="t.avatarUrl" :size="20" /><span class="grow truncate">{{ t.name }}</span><Check v-if="t.id === session.teamId" :size="14" />
    </button>
    <div class="menu-sep" />
    <button type="button" class="menu-item" data-close @click="newTeam = true"><Plus :size="14" />New team</button>
  </Dropdown>
  <Modal :open="newTeam" title="New team" description="A team groups the social accounts of one brand or client." size="sm" @close="newTeam = false">
    <form class="stack-16" @submit.prevent="createTeam">
      <Input v-model="teamName" label="Team name" required autofocus :max="80" />
      <div class="row" style="justify-content: flex-end"><Button variant="secondary" @click="newTeam = false">Cancel</Button><Button type="submit" variant="primary" :loading="busy" :disabled="!teamName.trim()">Create team</Button></div>
    </form>
  </Modal>
</template>
<style scoped>
.ts { display: inline-flex; align-items: center; gap: 8px; height: 38px; padding: 0 12px 0 8px; border: 1px solid var(--border); border-radius: var(--radius-pill); background: var(--bg-elevated); color: var(--text); font-size: var(--fs-14); font-weight: 500; cursor: pointer; max-width: 240px; transition: border-color 200ms, box-shadow 300ms var(--ease-out); }
.ts:hover { border-color: var(--border-strong); box-shadow: var(--shadow-sm); }
.nm { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.chev { color: var(--text-subtle); flex: none; }
</style>
