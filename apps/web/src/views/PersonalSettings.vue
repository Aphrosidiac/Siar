<script setup lang="ts">
import { reactive, ref } from 'vue';
import { Check, Monitor, Moon, Sun } from 'lucide-vue-next';
import PageHead from '@/components/PageHead.vue';
import SettingsSection from '@/components/settings/SettingsSection.vue';
import SaveBar from '@/components/settings/SaveBar.vue';
import Button from '@/components/ui/Button.vue';
import Input from '@/components/ui/Input.vue';
import Select from '@/components/ui/Select.vue';
import Avatar from '@/components/ui/Avatar.vue';
import Badge from '@/components/ui/Badge.vue';
import { api, isApiError, issuesByPath } from '@/lib/api';
import { loadSession, session, setTheme, theme, type ThemePref } from '@/lib/store';
import { TIMEZONES, browserTz, fullName } from '@/lib/format';
import { useDraft } from '@/lib/dirty';
import { toast } from '@/lib/toast';

const u = session.me!.user;
const { form: p, dirty, discard, commit } = useDraft({ firstName: u.firstName ?? '', lastName: u.lastName ?? '', timezone: u.timezone ?? browserTz(), avatarUrl: u.avatarUrl ?? '' });
const pe = ref<Record<string, string>>({}); const busy = ref<string | null>(null);
async function saveProfile() {
  busy.value = 'profile'; pe.value = {};
  try { await api.patch('/user/me', { firstName: p.firstName.trim(), lastName: p.lastName.trim(), timezone: p.timezone, ...(p.avatarUrl.trim() ? { avatarUrl: p.avatarUrl.trim() } : {}) }); await loadSession(true); commit(); toast.success('Profile saved'); }
  catch (e) { if (isApiError(e)) pe.value = issuesByPath(e.issues); toast.fail(e); } finally { busy.value = null; }
}
const pw = reactive({ currentPassword: '', newPassword: '', confirm: '' }); const we = ref<Record<string, string>>({});
async function changePassword() {
  we.value = {};
  if (pw.newPassword !== pw.confirm) { we.value = { confirm: 'The passwords do not match.' }; return; }
  busy.value = 'pw';
  try { await api.post('/user/me/password', { currentPassword: pw.currentPassword, newPassword: pw.newPassword }); Object.assign(pw, { currentPassword: '', newPassword: '', confirm: '' }); toast.success('Password changed'); }
  catch (e) { if (isApiError(e)) we.value = issuesByPath(e.issues); toast.fail(e); } finally { busy.value = null; }
}
const themes: { value: ThemePref; label: string; icon: typeof Sun }[] = [{ value: 'light', label: 'Light', icon: Sun }, { value: 'dark', label: 'Dark', icon: Moon }, { value: 'system', label: 'Match system', icon: Monitor }];
</script>

<template>
  <div class="page">
    <PageHead title="Your account" :subtitle="`Signed in as ${u.email}`" />
    <div class="sections">
      <SettingsSection title="Profile" description="Your name is shown to teammates and in the audit log.">
        <div class="who">
          <Avatar :src="p.avatarUrl" :name="fullName({ firstName: p.firstName, lastName: p.lastName, email: u.email })" :size="56" />
          <div class="min0"><div class="who-n">{{ [p.firstName, p.lastName].filter(Boolean).join(' ') || u.email }}</div><div class="row" style="gap: 8px"><span class="small muted truncate">{{ u.email }}</span><Badge size="sm" :tone="u.emailVerifiedAt ? 'success' : 'warn'">{{ u.emailVerifiedAt ? 'Confirmed' : 'Not confirmed' }}</Badge></div></div>
        </div>
        <form class="grid-2" @submit.prevent="saveProfile">
          <Input v-model="p.firstName" label="First name" required :error="pe.firstName" />
          <Input v-model="p.lastName" label="Last name" :error="pe.lastName" />
          <Select v-model="p.timezone" label="Timezone" :options="TIMEZONES" help="Schedules and the calendar use this timezone." :error="pe.timezone" />
          <Input v-model="p.avatarUrl" type="url" label="Avatar URL" placeholder="https://…" :error="pe.avatarUrl" />
        </form>
      </SettingsSection>

      <SettingsSection title="Appearance" description="Applies on this device straight away.">
        <div class="themes" role="radiogroup" aria-label="Theme">
          <button v-for="t in themes" :key="t.value" type="button" role="radio" class="th" :class="[t.value, { on: theme.pref === t.value }]" :aria-checked="theme.pref === t.value" @click="setTheme(t.value)">
            <span class="th-prev" aria-hidden="true"><i class="s" /><i class="m"><b /><b /><b /></i></span>
            <span class="th-l"><component :is="t.icon" :size="14" />{{ t.label }}<Check v-if="theme.pref === t.value" :size="14" class="th-c" /></span>
          </button>
        </div>
      </SettingsSection>

      <SettingsSection title="Password" description="At least 10 characters. Other sessions stay signed in.">
        <form class="grid-2" @submit.prevent="changePassword">
          <div class="span-2"><div class="half"><Input v-model="pw.currentPassword" type="password" label="Current password" autocomplete="current-password" required :error="we.currentPassword" /></div></div>
          <Input v-model="pw.newPassword" type="password" label="New password" autocomplete="new-password" required :error="we.newPassword" />
          <Input v-model="pw.confirm" type="password" label="Confirm new password" autocomplete="new-password" required :error="we.confirm" />
          <div class="span-2"><Button type="submit" variant="primary" :loading="busy === 'pw'" :disabled="!pw.currentPassword || !pw.newPassword || !pw.confirm">Change password</Button></div>
        </form>
      </SettingsSection>
    </div>
    <SaveBar :dirty="dirty" :busy="busy === 'profile'" :disabled="!p.firstName.trim()" @save="saveProfile" @discard="discard" />
  </div>
</template>

<style scoped>
.who { display: flex; align-items: center; gap: 14px; padding-bottom: 20px; margin-bottom: 20px; border-bottom: 1px solid var(--border-soft); }
.who-n { font-size: var(--fs-16); font-weight: 600; line-height: 24px; }
.half { max-width: calc(50% - 8px); }
@media (max-width: 640px) { .half { max-width: none; } }
.themes { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; max-width: 560px; }
.th { display: flex; flex-direction: column; gap: 10px; padding: 8px 8px 10px; border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--bg-elevated); color: var(--text); cursor: pointer; text-align: left; transition: border-color var(--t-micro), box-shadow var(--t-micro); }
.th:hover { border-color: var(--border-strong); }
.th.on { border-color: var(--text); box-shadow: inset 0 0 0 1px var(--text); }
.th:focus-visible { box-shadow: var(--focus); }
.th-prev { display: flex; height: 64px; border-radius: 6px; overflow: hidden; border: 1px solid var(--border-soft); }
.th-prev .s { width: 28%; background: #0b0b0a; }
.th-prev .m { flex: 1; display: flex; flex-direction: column; gap: 5px; padding: 8px; background: #f3efe4; }
.th-prev b { height: 6px; border-radius: 3px; background: #d7d2c6; }
.th-prev b:first-child { width: 60%; background: #0b0b0a; }
.th-prev b:nth-child(2) { width: 85%; } .th-prev b:nth-child(3) { width: 45%; }
.th.dark .th-prev .m { background: #191917; } .th.dark .th-prev b { background: #33322f; } .th.dark .th-prev b:first-child { background: #f3efe4; }
.th.system .th-prev .m { background: linear-gradient(135deg, #f3efe4 50%, #191917 50%); }
.th-l { display: flex; align-items: center; gap: 6px; padding: 0 4px; font-size: var(--fs-13); font-weight: 500; }
.th-c { margin-left: auto; }
@media (max-width: 640px) { .themes { gap: 8px; } .th-prev { height: 48px; } }
</style>
