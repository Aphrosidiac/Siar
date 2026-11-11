<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Check, KeyRound, Monitor, Moon, Sun } from 'lucide-vue-next';
import PageHead from '@/components/PageHead.vue';
import SettingsSection from '@/components/settings/SettingsSection.vue';
import SaveBar from '@/components/settings/SaveBar.vue';
import Button from '@/components/ui/Button.vue';
import Input from '@/components/ui/Input.vue';
import Select from '@/components/ui/Select.vue';
import Avatar from '@/components/ui/Avatar.vue';
import Badge from '@/components/ui/Badge.vue';
import Modal from '@/components/ui/Modal.vue';
import { api, isApiError, issuesByPath } from '@/lib/api';
import { loadSession, session, setTheme, theme, type ThemePref } from '@/lib/store';
import { TIMEZONES, browserTz, fullName } from '@/lib/format';
import { useDraft } from '@/lib/dirty';
import { toast } from '@/lib/toast';
import { googleError, useGoogleSignIn } from '@/lib/google';

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
// ── sign-in methods ──
interface Methods { password: boolean; google: { email: string | null; linkedAt: string | null } | null }
const route = useRoute(); const router = useRouter();
// first paint from the session (no jump), then the endpoint's answer
const methods = ref<Methods | null>(u.hasPassword === undefined ? null : { password: !!u.hasPassword, google: u.googleEmail != null ? { email: u.googleEmail || null, linkedAt: null } : null });
const googleOn = useGoogleSignIn();
async function loadMethods() { try { methods.value = await api.get<Methods>('/user/me/sign-in-methods'); void loadSession(true); } catch (e) { toast.fail(e); } }
onMounted(async () => {
  await loadMethods();
  // back from Google: ?google=linked or ?error=<code>
  if (route.query.google === 'linked') toast.success('Google connected', 'You can now sign in with Google.');
  else if (route.query.error) toast.error('Google not connected', googleError(route.query.error));
  if (route.query.google || route.query.error) void router.replace({ query: { ...route.query, google: undefined, error: undefined } });
});
// connecting or disconnecting Google asks for the password again (a borrowed session cannot change how the account signs in)
const gate = reactive({ open: false, mode: 'connect' as 'connect' | 'disconnect', password: '', error: '' });
function askPassword(mode: 'connect' | 'disconnect') { Object.assign(gate, { open: true, mode, password: '', error: '' }); }
async function confirmGate() {
  busy.value = 'google'; gate.error = '';
  try {
    if (gate.mode === 'connect') {
      const r = await api.post<{ url: string }>('/user/me/google/connect', { currentPassword: gate.password });
      location.assign(r.url); // off to Google; back here with ?google=linked or ?error=
      return;
    }
    methods.value = await api.del<Methods>('/user/me/google', { currentPassword: gate.password });
    void loadSession(true); gate.open = false; toast.success('Google disconnected');
  } catch (e) { gate.error = isApiError(e) ? (issuesByPath(e.issues).currentPassword ?? e.message) : String(e); }
  finally { busy.value = null; }
}
async function sendSetup() {
  busy.value = 'setup';
  try { await api.post('/user/me/password/setup'); toast.success('Check your email', `We sent a link to ${u.email} to set your password. It works for one hour.`); } catch (e) { toast.fail(e); } finally { busy.value = null; }
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

      <SettingsSection title="Sign-in methods" description="The ways you can sign in to this account.">
        <div v-if="!methods" class="methods"><div class="m-row"><span class="small muted">Loading…</span></div></div>
        <ul v-else class="methods">
          <li v-if="googleOn || methods.google" class="m-row">
            <span class="m-ico" aria-hidden="true">
              <svg viewBox="0 0 48 48" width="18" height="18"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" /><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" /><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" /><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" /></svg>
            </span>
            <div class="m-text min0">
              <div class="m-n">Google</div>
              <div class="small muted truncate">{{ methods.google ? `Connected as ${methods.google.email ?? 'your Google account'}` : 'Not connected' }}</div>
            </div>
            <Button v-if="methods.google" variant="secondary" size="sm" :disabled="!methods.password" @click="askPassword('disconnect')">Disconnect</Button>
            <Button v-else variant="secondary" size="sm" :disabled="!u.emailVerifiedAt" @click="askPassword('connect')">Connect</Button>
          </li>
          <li class="m-row">
            <span class="m-ico" aria-hidden="true"><KeyRound :size="16" /></span>
            <div class="m-text min0">
              <div class="m-n">Password</div>
              <div class="small muted">{{ methods.password ? `Sign in with ${u.email} and your password` : 'Not set: you sign in with Google' }}</div>
            </div>
            <Badge v-if="methods.password" size="sm" tone="success">Set</Badge>
            <Button v-else variant="secondary" size="sm" :loading="busy === 'setup'" @click="sendSetup">Set a password</Button>
          </li>
        </ul>
        <p v-if="methods?.google && !methods.password" class="small muted m-note">Set a password before you disconnect Google, so you can still sign in.</p>
        <p v-else-if="methods && !methods.google && googleOn && !u.emailVerifiedAt" class="small muted m-note">Confirm your email to connect Google.</p>
      </SettingsSection>

      <SettingsSection v-if="methods?.password !== false" title="Password" description="At least 10 characters. Other sessions stay signed in.">
        <form class="grid-2" @submit.prevent="changePassword">
          <div class="span-2"><div class="half"><Input v-model="pw.currentPassword" type="password" label="Current password" autocomplete="current-password" required :error="we.currentPassword" /></div></div>
          <Input v-model="pw.newPassword" type="password" label="New password" autocomplete="new-password" required :error="we.newPassword" />
          <Input v-model="pw.confirm" type="password" label="Confirm new password" autocomplete="new-password" required :error="we.confirm" />
          <div class="span-2"><Button type="submit" variant="primary" :loading="busy === 'pw'" :disabled="!pw.currentPassword || !pw.newPassword || !pw.confirm">Change password</Button></div>
        </form>
      </SettingsSection>
    </div>
    <Modal :open="gate.open" :title="gate.mode === 'connect' ? 'Connect Google' : 'Disconnect Google?'" :description="gate.mode === 'connect' ? 'Enter your password, then choose your Google account.' : `You will sign in with ${u.email} and your password.`" size="sm" @close="gate.open = false">
      <form class="stack-16" @submit.prevent="confirmGate">
        <Input v-model="gate.password" type="password" label="Your password" autocomplete="current-password" required autofocus :error="gate.error" />
        <div class="row" style="justify-content: flex-end"><Button variant="secondary" @click="gate.open = false">Cancel</Button><Button type="submit" :variant="gate.mode === 'connect' ? 'primary' : 'danger'" :loading="busy === 'google'" :disabled="!gate.password">{{ gate.mode === 'connect' ? 'Continue to Google' : 'Disconnect' }}</Button></div>
      </form>
    </Modal>
    <SaveBar :dirty="dirty" :busy="busy === 'profile'" :disabled="!p.firstName.trim()" @save="saveProfile" @discard="discard" />
  </div>
</template>

<style scoped>
.methods { list-style: none; margin: 0; padding: 0; border: 1px solid var(--border-soft); border-radius: var(--radius-lg); }
.m-row { display: flex; align-items: center; gap: 12px; padding: 12px 14px; min-height: 60px; }
.m-row + .m-row { border-top: 1px solid var(--border-soft); }
.m-ico { flex: none; display: grid; place-items: center; width: 32px; height: 32px; border: 1px solid var(--border-soft); border-radius: 999px; background: var(--bg); color: var(--text-muted); }
.m-text { flex: 1; }
.m-n { font-size: var(--fs-14); font-weight: 500; line-height: 20px; }
.m-note { margin: 10px 0 0; }
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
