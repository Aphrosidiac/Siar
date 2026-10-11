<script setup lang="ts">
import { handle } from '@/lib/format';
import { computed, reactive, ref, watch } from 'vue';
import { Copy, Trash2 } from 'lucide-vue-next';
import PageHead from '@/components/PageHead.vue';
import NoTeam from '@/components/NoTeam.vue';
import CopyField from '@/components/CopyField.vue';
import NetworkIcon from '@/components/NetworkIcon.vue';
import Card from '@/components/ui/Card.vue';
import Button from '@/components/ui/Button.vue';
import Input from '@/components/ui/Input.vue';
import Select from '@/components/ui/Select.vue';
import Checkbox from '@/components/ui/Checkbox.vue';
import Toggle from '@/components/ui/Toggle.vue';
import { api, isApiError, issuesByPath } from '@/lib/api';
import { currentTeam, isAdmin, loadTeams, session } from '@/lib/store';
import { META } from '@/lib/networks';
import { confirm } from '@/lib/confirm';
import { toast } from '@/lib/toast';
import type { NetworkType } from '@/lib/types';

const f = reactive({ name: '', avatarUrl: '' }); const errs = ref<Record<string, string>>({}); const busy = ref<string | null>(null);
watch(currentTeam, (t) => { if (t) { f.name = t.name; f.avatarUrl = t.avatarUrl ?? ''; } }, { immediate: true });
async function save() {
  if (!currentTeam.value) return;
  busy.value = 'save'; errs.value = {};
  try { await api.patch(`/team/${currentTeam.value.id}`, { name: f.name.trim(), avatarUrl: f.avatarUrl.trim() || null }); await loadTeams(); toast.success('Team updated'); }
  catch (e) { if (isApiError(e)) errs.value = issuesByPath(e.issues); toast.fail(e); } finally { busy.value = null; }
}
async function removeTeam() {
  const t = currentTeam.value; if (!t) return;
  if (!(await confirm({ title: `Delete ${t.name}?`, message: 'Its connected accounts, posts, media and bio page are removed. This cannot be undone.', confirmLabel: 'Delete team', danger: true, requireText: t.name }))) return;
  busy.value = 'delete';
  try { await api.del(`/team/${t.id}`); session.teamId = null; await loadTeams(); toast.success('Team deleted'); } catch (e) { toast.fail(e); } finally { busy.value = null; }
}

// copy accounts from another team
const from = ref<string | null>(null); const types = ref<Set<string>>(new Set()); const reset = ref(true);
const others = computed(() => session.teams.filter((t) => t.id !== session.teamId));
const fromAccounts = computed(() => session.teams.find((t) => t.id === from.value)?.socialAccounts ?? []);
watch(from, () => { types.value = new Set(fromAccounts.value.map((a) => a.type)); });
function tog(t: string, on: boolean) { const s = new Set(types.value); if (on) s.add(t); else s.delete(t); types.value = s; }
async function copy() {
  busy.value = 'copy';
  try { const r = await api.post<unknown[]>('/social-account/copy', { fromTeamId: from.value, toTeamId: session.teamId, resetChannel: reset.value, socialAccountTypes: [...types.value] }); await loadTeams(); toast.success(`${r.length} account${r.length === 1 ? '' : 's'} copied`); from.value = null; }
  catch (e) { toast.fail(e); } finally { busy.value = null; }
}
// accounts pending deletion
const doomed = computed(() => (currentTeam.value?.socialAccounts ?? []).filter((a) => a.deleteOn));
</script>

<template>
  <div class="page narrow">
    <PageHead title="Team settings" :subtitle="currentTeam ? `Settings for ${currentTeam.name}` : ''" />
    <NoTeam v-if="!currentTeam" />
    <div v-else class="stack-24">
      <Card title="General">
        <form class="stack-16" @submit.prevent="save">
          <Input v-model="f.name" label="Team name" required :max="80" :error="errs.name" :disabled="!isAdmin" />
          <Input v-model="f.avatarUrl" label="Avatar URL" type="url" placeholder="https://…" :error="errs.avatarUrl" :disabled="!isAdmin" />
          <CopyField :value="currentTeam!.id" label="Team ID" help="Use this as teamId in API calls." />
          <div><Button type="submit" variant="primary" :loading="busy === 'save'" :disabled="!isAdmin || !f.name.trim()">Save changes</Button></div>
        </form>
      </Card>

      <Card title="Copy accounts from another team" subtitle="Reuse the same login for a second brand without connecting again.">
        <div v-if="!others.length" class="muted small">Create another team to copy accounts between teams.</div>
        <div v-else class="stack-16">
          <Select v-model="from" label="Copy from" placeholder="Choose a team" :options="others.map((t) => ({ value: t.id, label: `${t.name} (${t.socialAccounts.length} accounts)` }))" />
          <div v-if="from" class="stack">
            <Checkbox v-for="a in fromAccounts" :key="a.id" :model-value="types.has(a.type)" @update:model-value="tog(a.type, $event)"><span class="row"><NetworkIcon :type="a.type" :size="18" :title="false" />{{ META[a.type as NetworkType].name }}<span class="muted small">{{ a.username ? handle(a.username) : '' }}</span></span></Checkbox>
            <Toggle v-model="reset" label="Reset the chosen channel" help="Pick the Page / location again for the new team." />
          </div>
          <div><Button :icon="Copy" :loading="busy === 'copy'" :disabled="!from || !types.size" @click="copy">Copy accounts</Button></div>
        </div>
      </Card>

      <Card v-if="doomed.length" title="Scheduled for removal" subtitle="Disconnected accounts are deleted automatically after the grace period in organization settings.">
        <div class="panel-list"><div v-for="a in doomed" :key="a.id" class="item"><NetworkIcon :type="a.type" :size="24" /><span class="grow">{{ META[a.type as NetworkType].name }} {{ a.username ? handle(a.username) : '' }}</span><span class="small muted">{{ new Date(a.deleteOn!).toLocaleDateString('en-GB') }}</span></div></div>
      </Card>

      <Card v-if="isAdmin" title="Danger zone" tone="danger">
        <div class="row between wrap"><div><div class="strong">Delete this team</div><div class="small muted">Removes its accounts, posts and media for good.</div></div><Button variant="danger" :icon="Trash2" :loading="busy === 'delete'" @click="removeTeam">Delete team</Button></div>
      </Card>
    </div>
  </div>
</template>
