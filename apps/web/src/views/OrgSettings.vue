<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useDraft } from '@/lib/dirty';
import { MailPlus, Trash2, UserMinus } from 'lucide-vue-next';
import PageHead from '@/components/PageHead.vue';
import QueryState from '@/components/QueryState.vue';
import SettingsSection from '@/components/settings/SettingsSection.vue';
import SaveBar from '@/components/settings/SaveBar.vue';
import Tabs from '@/components/ui/Tabs.vue';
import Button from '@/components/ui/Button.vue';
import Input from '@/components/ui/Input.vue';
import CopyField from '@/components/CopyField.vue';
import Select from '@/components/ui/Select.vue';
import Toggle from '@/components/ui/Toggle.vue';
import Avatar from '@/components/ui/Avatar.vue';
import Badge from '@/components/ui/Badge.vue';
import Table from '@/components/ui/Table.vue';
import Pager from '@/components/ui/Pager.vue';
import EmptyState from '@/components/ui/EmptyState.vue';
import { api, isApiError, issuesByPath } from '@/lib/api';
import { useQuery } from '@/lib/query';
import { isAdmin, isOwner, loadOrg, loadSession, session, timezone } from '@/lib/store';
import { formatDateTime, fullName } from '@/lib/format';
import { confirm } from '@/lib/confirm';
import { toast } from '@/lib/toast';
import { useRouter } from 'vue-router';

type Role = 'OWNER' | 'ADMIN' | 'MEMBER';
const router = useRouter();
const tab = ref('general');
const tabs = computed(() => [{ value: 'general', label: 'General' }, { value: 'members', label: 'Members' }, { value: 'audit', label: 'Audit log' }, ...(isOwner.value ? [{ value: 'danger', label: 'Danger zone' }] : [])]);

// ── general ──
const { form: f, dirty, reset: resetForm, discard, commit } = useDraft({ name: '', uploadsCompression: true, verboseErrors: true, remoteDisconnectChecks: true, deleteDisconnectedAfterHours: 72, portalBrandName: '', portalLogoUrl: '', portalAccentColor: '#161615' });
function fill() {
  const org = session.org as any; if (!org) return;
  resetForm({ name: org.name ?? '', uploadsCompression: org.uploadsCompressionEnabled !== false, verboseErrors: org.showVerboseErrors !== false, remoteDisconnectChecks: org.disconnectCheckEnabled !== false, deleteDisconnectedAfterHours: org.deleteAccountAfter ?? 72, portalBrandName: org.portalBrandName ?? '', portalLogoUrl: org.portalLogoUrl ?? '', portalAccentColor: org.portalAccentColor ?? '#161615' });
}
watch(() => session.org, fill, { immediate: true });
const busy = ref<string | null>(null); const errs = ref<Record<string, string>>({});
async function saveGeneral() {
  busy.value = 'general'; errs.value = {};
  try {
    await api.patch('/organization/settings', { name: f.name.trim(), uploadsCompression: f.uploadsCompression, verboseErrors: f.verboseErrors, remoteDisconnectChecks: f.remoteDisconnectChecks, deleteDisconnectedAfterHours: f.deleteDisconnectedAfterHours, portalBrandName: f.portalBrandName.trim(), portalLogoUrl: f.portalLogoUrl.trim(), portalAccentColor: f.portalAccentColor });
    commit(); await Promise.all([loadOrg(), loadSession(true)]); toast.success('Settings saved');
  } catch (e) { if (isApiError(e)) errs.value = issuesByPath(e.issues); toast.fail(e); } finally { busy.value = null; }
}

// ── members ──
const mOffset = ref(0);
const members = useQuery(() => api.get<{ items: { id: string; userId: string; email: string; firstName?: string | null; lastName?: string | null; role: Role; createdAt?: string }[]; total: number }>('/user/members', { limit: 25, offset: mOffset.value }), { deps: [mOffset] });
const invites = useQuery(() => api.get<{ items: { id: string; email: string; role: Role; expiresAt?: string | null; createdAt?: string | null }[]; total: number }>('/user/invitations'));
const inv = reactive({ email: '', role: 'MEMBER' as Role }); const invErr = ref('');
async function invite() {
  busy.value = 'invite'; invErr.value = '';
  try { await api.post('/user/invitations', { email: inv.email.trim(), role: inv.role }); toast.success('Invitation sent', inv.email); inv.email = ''; await invites.reload(); }
  catch (e) { invErr.value = isApiError(e) ? (e.issues[0]?.message ?? e.message) : (e as Error).message; } finally { busy.value = null; }
}
async function revoke(id: string) { try { await api.del(`/user/invitations/${id}`); await invites.reload(); toast.success('Invitation revoked'); } catch (e) { toast.fail(e); } }
async function setRole(id: string, role: Role) { try { await api.patch(`/user/members/${id}`, { role }); await members.reload(); toast.success('Role updated'); } catch (e) { toast.fail(e); await members.reload(); } }
async function removeMember(m: { id: string; email: string }) {
  if (!(await confirm({ title: `Remove ${m.email}?`, message: 'They lose access to this organization immediately.', confirmLabel: 'Remove', danger: true }))) return;
  try { await api.del(`/user/members/${m.id}`); await members.reload(); toast.success('Member removed'); } catch (e) { toast.fail(e); }
}
const roleOptions = computed(() => [{ value: 'MEMBER', label: 'Member' }, { value: 'ADMIN', label: 'Admin' }, ...(isOwner.value ? [{ value: 'OWNER', label: 'Owner' }] : [])]);

// ── audit ──
const aOffset = ref(0);
const audit = useQuery(() => api.get<{ items: { id: string; actorType?: string; actorName?: string; action?: string; entity?: string; summary: string; createdAt?: string }[]; total: number }>('/organization/audit-log', { limit: 25, offset: aOffset.value }), { deps: [aOffset], enabled: () => tab.value === 'audit' });
watch(tab, (t) => { if (t === 'audit') void audit.reload(); });

// ── danger ──
async function deleteOrg() {
  const name = session.org?.name ?? '';
  if (!(await confirm({ title: 'Delete this organization?', message: 'Every team, account, post and file in it is removed for good. Active subscriptions are cancelled.', confirmLabel: 'Delete organization', danger: true, requireText: name }))) return;
  busy.value = 'delete';
  try { await api.post('/organization/delete', { confirmName: name }); await loadSession(true); toast.success('Organization deleted'); await router.replace('/posts'); location.reload(); } catch (e) { toast.fail(e); } finally { busy.value = null; }
}
const mcols = [{ key: 'member', label: 'Member' }, { key: 'role', label: 'Role', width: '160px' }, { key: 'createdAt', label: 'Joined', width: '150px', hideSm: true }, { key: 'actions', label: '', width: '60px', align: 'right' as const }];
const icols = [{ key: 'email', label: 'Pending invitation' }, { key: 'role', label: 'Role', width: '100px' }, { key: 'expiresAt', label: 'Expires', width: '150px', hideSm: true }, { key: 'actions', label: '', width: '100px', align: 'right' as const }];
const acols = [{ key: 'createdAt', label: 'When', width: '160px' }, { key: 'actorName', label: 'Who', width: '160px', hideSm: true }, { key: 'summary', label: 'What' }];
</script>

<template>
  <div class="page">
    <PageHead title="Organization settings" :subtitle="session.org?.name ?? ''" />
    <Tabs v-model="tab" :tabs="tabs" class="mb-16" />

    <div v-if="tab === 'general'" class="sections">
      <SettingsSection title="Organization" description="The workspace that holds your teams, members and billing.">
        <div class="grid-2">
          <Input v-model="f.name" label="Organization name" required :error="errs.name" :disabled="!isAdmin" />
          <CopyField :value="session.org?.id ?? ''" label="Organization ID" />
        </div>
      </SettingsSection>
      <SettingsSection title="Publishing" description="How Siar handles uploads, errors and accounts that lose access.">
        <div class="toggles">
          <Toggle v-model="f.uploadsCompression" label="Compress uploaded images" help="Smaller files publish faster. Video is never re-encoded." :disabled="!isAdmin" />
          <Toggle v-model="f.verboseErrors" label="Show the network's own error" help="Failed posts include the raw response from the network, for debugging." :disabled="!isAdmin" />
          <Toggle v-model="f.remoteDisconnectChecks" label="Check connections in the background" help="Spot revoked access early and flag the account for reconnecting." :disabled="!isAdmin" />
        </div>
        <div class="hours"><Input v-model.number="f.deleteDisconnectedAfterHours" type="number" label="Remove disconnected accounts after (hours)" help="Hours, 0 to 168. Their scheduled posts stay paused until then." :error="errs.deleteDisconnectedAfterHours" :disabled="!isAdmin" /></div>
      </SettingsSection>
      <SettingsSection title="Hosted connect page" description="What clients see when you share a connect link. Leave empty to use Siar's defaults.">
        <div class="portal">
          <div class="stack-16">
            <Input v-model="f.portalBrandName" label="Brand name" :placeholder="session.org?.name ?? ''" :disabled="!isAdmin" />
            <Input v-model="f.portalLogoUrl" type="url" label="Logo URL" placeholder="https://…" :disabled="!isAdmin" />
            <div class="field"><label class="field-label" for="pa">Accent colour</label><div class="row"><input id="pa" v-model="f.portalAccentColor" type="color" class="swatch" :disabled="!isAdmin" /><code>{{ f.portalAccentColor }}</code></div></div>
          </div>
          <div class="pv" aria-label="Preview">
            <div class="label">Preview</div>
            <div class="pv-card">
              <div class="pv-brand"><img v-if="f.portalLogoUrl" :src="f.portalLogoUrl" alt="" /><span v-else class="pv-mark" :style="{ background: f.portalAccentColor }">{{ (f.portalBrandName || session.org?.name || 'S').slice(0, 1) }}</span><span class="strong truncate">{{ f.portalBrandName || session.org?.name }}</span></div>
              <div class="small muted">Connect your accounts</div>
              <span class="pv-btn" :style="{ background: f.portalAccentColor }">Connect Instagram</span>
            </div>
          </div>
        </div>
      </SettingsSection>
      <SaveBar :dirty="dirty && isAdmin" :busy="busy === 'general'" :disabled="!f.name.trim()" @save="saveGeneral" @discard="discard" />
    </div>

    <div v-else-if="tab === 'members'" class="stack-24">
      <SettingsSection v-if="isAdmin" title="Invite someone" description="They get an email with a link to join. Admins can manage teams, accounts and billing.">
        <form class="row wrap" style="align-items: flex-end" @submit.prevent="invite">
          <div class="grow" style="min-width: 220px"><Input v-model="inv.email" type="email" label="Email" required :error="invErr" /></div>
          <div style="width: 160px"><Select v-model="inv.role" label="Role" :options="roleOptions" /></div>
          <Button type="submit" variant="primary" :icon="MailPlus" :loading="busy === 'invite'" :disabled="!inv.email.trim()">Send invite</Button>
        </form>
      </SettingsSection>
      <QueryState :loading="members.loading.value" :error="members.error.value" :status="members.status.value" :has-data="!!members.data.value" feature="Members" @retry="members.reload">
        <Table :columns="mcols" :rows="members.data.value?.items ?? []">
          <template #cell-member="{ row }"><div class="row"><Avatar :name="fullName(row)" :size="32" /><div><div class="strong">{{ fullName(row) }}</div><div class="tiny muted">{{ row.email }}</div></div><Badge v-if="row.userId === session.me?.user.id" size="sm">You</Badge></div></template>
          <template #cell-role="{ row }"><Select v-if="isAdmin && row.userId !== session.me?.user.id" :model-value="row.role" size="sm" :options="roleOptions" :aria-label="`Role of ${row.email}`" @update:model-value="setRole(row.id, $event)" /><Badge v-else>{{ row.role.toLowerCase() }}</Badge></template>
          <template #cell-createdAt="{ row }"><span class="small muted">{{ formatDateTime(row.createdAt, timezone) }}</span></template>
          <template #cell-actions="{ row }"><Button v-if="isAdmin && row.userId !== session.me?.user.id" iconOnly size="sm" variant="danger-ghost" label="Remove member" :icon="UserMinus" @click="removeMember(row)" /></template>
        </Table>
        <Pager v-if="members.data.value" :total="members.data.value.total" :limit="25" v-model:offset="mOffset" class="mt-16" />
      </QueryState>
      <Table v-if="invites.data.value?.items.length" :columns="icols" :rows="invites.data.value.items">
        <template #cell-role="{ row }"><Badge>{{ row.role.toLowerCase() }}</Badge></template>
        <template #cell-expiresAt="{ row }"><span class="small muted">{{ formatDateTime(row.expiresAt, timezone) }}</span></template>
        <template #cell-actions="{ row }"><Button v-if="isAdmin" size="sm" variant="ghost" @click="revoke(row.id)">Revoke</Button></template>
      </Table>
    </div>

    <QueryState v-else-if="tab === 'audit'" :loading="audit.loading.value" :error="audit.error.value" :status="audit.status.value" :has-data="!!audit.data.value" feature="The audit log" @retry="audit.reload">
      <Table :columns="acols" :rows="audit.data.value?.items ?? []">
        <template #cell-createdAt="{ row }"><span class="small">{{ formatDateTime(row.createdAt, timezone) }}</span></template>
        <template #cell-actorName="{ row }"><span class="small">{{ row.actorName ?? row.actorType ?? 'System' }}</span></template>
        <template #cell-summary="{ row }">{{ row.summary }} <code v-if="row.action" class="tiny">{{ row.action }}</code></template>
        <template #empty><EmptyState compact title="No activity yet" /></template>
      </Table>
      <Pager v-if="audit.data.value" :total="audit.data.value.total" :limit="25" v-model:offset="aOffset" class="mt-16" />
    </QueryState>

    <div v-else-if="tab === 'danger'" class="sections">
      <SettingsSection :title="`Delete ${session.org?.name ?? 'this organization'}`" tone="danger" description="Removes every team, account, post and file, and cancels the subscription. This cannot be undone.">
        <template #actions><Button variant="danger" :icon="Trash2" :loading="busy === 'delete'" @click="deleteOrg">Delete organization</Button></template>
      </SettingsSection>
    </div>
  </div>
</template>

<style scoped>
.toggles { display: flex; flex-direction: column; gap: 16px; }
.hours { max-width: 420px; margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--border-soft); }
.portal { display: grid; grid-template-columns: minmax(0, 1fr) 280px; gap: 24px; align-items: start; }
.pv { display: flex; flex-direction: column; gap: 8px; }
.pv-card { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 24px 16px; border-radius: var(--radius-lg); background: var(--bg-subtle); border: 1px solid var(--border-soft); text-align: center; }
.pv-brand { display: flex; align-items: center; gap: 8px; max-width: 100%; }
.pv-brand img { height: 24px; max-width: 120px; object-fit: contain; }
.pv-mark { width: 24px; height: 24px; border-radius: 6px; display: grid; place-items: center; color: #fff; font-size: var(--fs-12); font-weight: 600; flex: none; }
.pv-btn { margin-top: 6px; padding: 8px 16px; border-radius: var(--radius-pill); color: #fff; font-size: var(--fs-13); font-weight: 500; }
@media (max-width: 760px) { .portal { grid-template-columns: minmax(0, 1fr); } }
.swatch { width: 40px; height: 36px; padding: 2px; border: 1px solid var(--border-strong); border-radius: var(--radius); background: var(--bg-elevated); cursor: pointer; }
</style>
