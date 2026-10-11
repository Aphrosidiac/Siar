<script setup lang="ts">
import { handle } from '@/lib/format';
import { computed, ref, watch } from 'vue';
import { useDraft } from '@/lib/dirty';
import { Copy, Trash2 } from 'lucide-vue-next';
import PageHead from '@/components/PageHead.vue';
import NoTeam from '@/components/NoTeam.vue';
import CopyField from '@/components/CopyField.vue';
import NetworkIcon from '@/components/NetworkIcon.vue';
import SettingsSection from '@/components/settings/SettingsSection.vue';
import SaveBar from '@/components/settings/SaveBar.vue';
import Avatar from '@/components/ui/Avatar.vue';
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

const { form: f, dirty, reset: resetForm, discard } = useDraft({ name: '', avatarUrl: '' }); const errs = ref<Record<string, string>>({}); const busy = ref<string | null>(null);
watch(currentTeam, (t) => { if (t) resetForm({ name: t.name, avatarUrl: t.avatarUrl ?? '' }); }, { immediate: true });
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
  <div class="page">
    <PageHead title="Team settings" :subtitle="currentTeam ? `${currentTeam.name} · one brand's accounts, posts and media` : ''" />
    <NoTeam v-if="!currentTeam" />
    <div v-else class="sections">
      <SettingsSection title="Team profile" description="How this team shows in the team switcher. Each team has its own accounts, posts, media and bio page.">
        <form class="tp" @submit.prevent="save">
          <Avatar :src="f.avatarUrl" :name="f.name || currentTeam!.name" :size="56" class="tp-av" />
          <div class="grid-2 grow">
            <Input v-model="f.name" label="Team name" required :max="80" :error="errs.name" :disabled="!isAdmin" />
            <Input v-model="f.avatarUrl" label="Avatar URL" type="url" placeholder="https://…" :error="errs.avatarUrl" :disabled="!isAdmin" />
            <div class="span-2"><CopyField :value="currentTeam!.id" label="Team ID" help="Pass this as teamId in API calls." /></div>
          </div>
        </form>
      </SettingsSection>

      <SettingsSection title="Copy accounts from another team" description="Reuse a login you already connected for a second brand, without signing in to the network again.">
        <div v-if="!others.length" class="muted small">Create another team to copy accounts between teams.</div>
        <div v-else class="stack-16">
          <div class="half"><Select v-model="from" label="Copy from" placeholder="Choose a team" :options="others.map((t) => ({ value: t.id, label: `${t.name} (${t.socialAccounts.length} accounts)` }))" /></div>
          <template v-if="from">
            <div v-if="!fromAccounts.length" class="muted small">That team has no connected accounts.</div>
            <div v-else class="picks">
              <Checkbox v-for="a in fromAccounts" :key="a.id" class="pk" :class="{ on: types.has(a.type) }" :model-value="types.has(a.type)" @update:model-value="tog(a.type, $event)">
                <span class="pk-in"><NetworkIcon :type="a.type" :size="18" :title="false" /><span class="min0"><span class="strong d-block">{{ META[a.type as NetworkType].name }}</span><span class="tiny muted truncate d-block">{{ a.username ? handle(a.username) : '' }}</span></span></span>
              </Checkbox>
            </div>
            <Toggle v-model="reset" label="Pick the page or location again" help="Off keeps the same Facebook page, Google location, etc. as the source team." />
          </template>
          <div><Button :icon="Copy" :loading="busy === 'copy'" :disabled="!from || !types.size" @click="copy">Copy {{ types.size ? `${types.size} account${types.size === 1 ? '' : 's'}` : 'accounts' }}</Button></div>
        </div>
      </SettingsSection>

      <SettingsSection v-if="doomed.length" title="Scheduled for removal" description="Disconnected accounts are deleted after the grace period set in organization settings. Reconnect one to keep it.">
        <div class="panel-list"><div v-for="a in doomed" :key="a.id" class="item"><NetworkIcon :type="a.type" :size="24" /><span class="grow">{{ META[a.type as NetworkType].name }} {{ a.username ? handle(a.username) : '' }}</span><span class="small muted">{{ new Date(a.deleteOn!).toLocaleDateString('en-GB') }}</span></div></div>
      </SettingsSection>

      <SettingsSection v-if="isAdmin" title="Delete this team" tone="danger" description="Removes its connected accounts, posts, media and bio page for good. This cannot be undone.">
        <template #actions><Button variant="danger" :icon="Trash2" :loading="busy === 'delete'" @click="removeTeam">Delete team</Button></template>
      </SettingsSection>
    </div>
    <SaveBar :dirty="dirty && isAdmin" :busy="busy === 'save'" :disabled="!f.name.trim()" @save="save" @discard="discard" />
  </div>
</template>

<style scoped>
.tp { display: flex; gap: 20px; align-items: flex-start; }
.tp > .grid-2 { flex: 1; min-width: 0; align-self: stretch; }
.tp :deep(.tp-av) { margin-top: 22px; flex: none; }
.half { max-width: 420px; }
.picks { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 8px; }
.pk-in { display: flex; align-items: center; gap: 10px; min-width: 0; }
.picks :deep(.pk) { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border: 1px solid var(--border); border-radius: var(--radius-lg); cursor: pointer; min-width: 0; transition: border-color var(--t-micro), background var(--t-micro); }
.picks :deep(.pk:hover) { border-color: var(--border-strong); }
.picks :deep(.pk.on) { border-color: var(--text); background: var(--bg-subtle); }
.d-block { display: block; }
@media (max-width: 640px) { .tp { flex-direction: column; } .tp :deep(.tp-av) { margin-top: 0; } }
</style>
