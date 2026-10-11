<script setup lang="ts">
import { reactive, ref } from 'vue';
import PageHead from '@/components/PageHead.vue';
import Card from '@/components/ui/Card.vue';
import Button from '@/components/ui/Button.vue';
import Input from '@/components/ui/Input.vue';
import Select from '@/components/ui/Select.vue';
import Avatar from '@/components/ui/Avatar.vue';
import { api, isApiError, issuesByPath } from '@/lib/api';
import { loadSession, session, setTheme, theme, type ThemePref } from '@/lib/store';
import { TIMEZONES, browserTz, fullName } from '@/lib/format';
import { toast } from '@/lib/toast';

const u = session.me!.user;
const p = reactive({ firstName: u.firstName ?? '', lastName: u.lastName ?? '', timezone: u.timezone ?? browserTz(), avatarUrl: u.avatarUrl ?? '' });
const pe = ref<Record<string, string>>({}); const busy = ref<string | null>(null);
async function saveProfile() {
  busy.value = 'profile'; pe.value = {};
  try { await api.patch('/user/me', { firstName: p.firstName.trim(), lastName: p.lastName.trim(), timezone: p.timezone, ...(p.avatarUrl.trim() ? { avatarUrl: p.avatarUrl.trim() } : {}) }); await loadSession(true); toast.success('Profile saved'); }
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
const themes = [{ value: 'system', label: 'Match my system' }, { value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }];
</script>

<template>
  <div class="page narrow">
    <PageHead title="Settings" subtitle="Your profile, password and appearance." />
    <div class="stack-24">
      <Card title="Profile">
        <form class="stack-16" @submit.prevent="saveProfile">
          <div class="row"><Avatar :src="p.avatarUrl" :name="fullName(session.me!.user)" :size="48" /><div><div class="strong">{{ session.me!.user.email }}</div><div class="tiny muted">{{ session.me!.user.emailVerifiedAt ? 'Email confirmed' : 'Email not confirmed yet' }}</div></div></div>
          <div class="grid-2"><Input v-model="p.firstName" label="First name" required :error="pe.firstName" /><Input v-model="p.lastName" label="Last name" :error="pe.lastName" /></div>
          <Select v-model="p.timezone" label="Timezone" :options="TIMEZONES" help="Schedules and the calendar are shown in this timezone." :error="pe.timezone" />
          <Input v-model="p.avatarUrl" type="url" label="Avatar URL" placeholder="https://…" :error="pe.avatarUrl" />
          <div><Button type="submit" variant="primary" :loading="busy === 'profile'">Save profile</Button></div>
        </form>
      </Card>
      <Card title="Appearance"><Select :model-value="theme.pref" label="Theme" :options="themes" @update:model-value="setTheme($event as ThemePref)" /></Card>
      <Card title="Password">
        <form class="stack-16" @submit.prevent="changePassword">
          <Input v-model="pw.currentPassword" type="password" label="Current password" autocomplete="current-password" required :error="we.currentPassword" />
          <Input v-model="pw.newPassword" type="password" label="New password" autocomplete="new-password" required :error="we.newPassword" help="At least 10 characters." />
          <Input v-model="pw.confirm" type="password" label="Confirm new password" autocomplete="new-password" required :error="we.confirm" />
          <div><Button type="submit" variant="primary" :loading="busy === 'pw'" :disabled="!pw.currentPassword || !pw.newPassword">Change password</Button></div>
        </form>
      </Card>
    </div>
  </div>
</template>
