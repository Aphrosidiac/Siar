<script setup lang="ts">
/**
 * First-login welcome for the person who made the organization: name the workspace and its first team,
 * connect a channel, pick dashboard or API. Signup already made a team, so skipping at any point
 * still lands on a working dashboard; finishing or skipping both call /user/me/onboarding.
 */
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Check, Code2, ExternalLink, PenLine } from 'lucide-vue-next';
import AuthShell from '@/components/AuthShell.vue';
import NetworkIcon from '@/components/NetworkIcon.vue';
import CopyField from '@/components/CopyField.vue';
import Input from '@/components/ui/Input.vue';
import Select from '@/components/ui/Select.vue';
import Button from '@/components/ui/Button.vue';
import Modal from '@/components/ui/Modal.vue';
import { api, errorMessage, isApiError, issuesByPath } from '@/lib/api';
import { currentTeam, loadOrg, loadSession, loadTeams, platforms, loadPlatforms, refreshTeam, selectTeam, session } from '@/lib/store';
import { NETWORKS, META, mastodonServer, needsChannel } from '@/lib/networks';
import MastodonField from '@/components/MastodonField.vue';
import { TIMEZONES, browserTz } from '@/lib/format';
import { toast } from '@/lib/toast';
import type { AuthMe, NetworkType } from '@/lib/types';

const route = useRoute(); const router = useRouter();
const step = computed(() => Math.min(3, Math.max(1, Number(route.query.step) || 1)));
const go = (n: number) => router.replace({ query: { step: String(n) } });

const STEPS = [
  { n: 1, title: 'Workspace', eyebrow: 'Workspace' },
  { n: 2, title: 'First channel', eyebrow: 'Channels' },
  { n: 3, title: 'How you publish', eyebrow: 'Publishing' },
];
const COPY: Record<number, { title: string; subtitle: string }> = {
  1: { title: 'Set up your workspace.', subtitle: 'Everything in Siar lives in a team: one brand or client, with its own accounts, posts and media. Start with one and add more any time.' },
  2: { title: 'Connect your first channel.', subtitle: 'Sign in to a network once and Siar posts as that account from then on. Add the others whenever you are ready.' },
  3: { title: 'How will you publish?', subtitle: 'Both work from day one, and you can use both. Pick where you want to start.' },
};

// ── 1. workspace ──
const f = reactive({ org: '', team: '', tz: '' });
const fields = ref<Record<string, string>>({}); const error = ref(''); const busy = ref<string | null>(null);
function fill() {
  const first = (session.me?.user.firstName ?? '').split(/\s+/)[0] ?? '';
  const org = session.org?.name ?? '';
  // the organization and team names signup made up are placeholders; only keep what the person typed
  f.org = org && org !== `${first}'s organization` ? org : '';
  f.team = currentTeam.value && currentTeam.value.name !== 'Main' ? currentTeam.value.name : '';
  f.tz = session.me?.user.timezone || browserTz();
}
async function saveWorkspace() {
  fields.value = {}; error.value = '';
  if (!f.org.trim()) fields.value.org = 'Name your organization';
  if (!f.team.trim()) fields.value.team = 'Name your first team';
  if (Object.keys(fields.value).length) return;
  busy.value = 'workspace';
  try {
    const team = currentTeam.value;
    await Promise.all([
      api.patch('/organization/settings', { name: f.org.trim() }),
      api.patch('/user/me', { timezone: f.tz }),
      team ? api.patch(`/team/${team.id}`, { name: f.team.trim() }) : api.post<{ id: string }>('/team/', { name: f.team.trim() }).then((t) => selectTeam(t.id)),
    ]);
    await Promise.all([loadSession(true), loadOrg(), loadTeams()]);
    void go(2);
  } catch (e) {
    error.value = errorMessage(e);
    if (isApiError(e)) { const by = issuesByPath(e.issues); fields.value = { ...(by.name ? { team: by.name } : {}), ...(by.timezone ? { tz: by.timezone } : {}) }; }
  } finally { busy.value = null; }
}
const localTime = computed(() => { try { return new Intl.DateTimeFormat('en-GB', { timeZone: f.tz || undefined, hour: '2-digit', minute: '2-digit', weekday: 'short' }).format(new Date()); } catch { return ''; } });

// ── 2. channels ──
const connectedTypes = computed(() => new Set((currentTeam.value?.socialAccounts ?? []).map((a) => a.type)));
const unpicked = computed(() => (currentTeam.value?.socialAccounts ?? []).filter(needsChannel));
const ready = (t: NetworkType) => platforms.value?.[t]?.available !== false;
const open = computed(() => NETWORKS.filter((n) => ready(n.type)));
const soon = computed(() => NETWORKS.filter((n) => !ready(n.type)));
const connectFor = ref<NetworkType | null>(null); const mastodon = ref(''); const mastodonError = ref<string | null>(null);
// Bluesky goes straight to Bluesky's sign-in; only Mastodon asks which server first.
function startConnect(type: NetworkType) {
  if (connectedTypes.value.has(type)) return;
  if (type === 'MASTODON') { mastodon.value = ''; mastodonError.value = null; connectFor.value = type; return; }
  void connect(type);
}
function submitMastodon() {
  if (!mastodonServer(mastodon.value)) { mastodonError.value = 'Enter your address like @you@mastodon.social, or a server name.'; return; }
  void connect('MASTODON'); connectFor.value = null;
}
async function connect(type: NetworkType) {
  if (!session.teamId) return;
  busy.value = type;
  try {
    const body: Record<string, unknown> = { type, teamId: session.teamId, redirectUrl: `${location.origin}/welcome?step=2` };
    if (type === 'MASTODON') body.serverUrl = mastodonServer(mastodon.value);
    const { url } = await api.post<{ url: string }>('/social-account/connect', body);
    location.href = url;
  } catch (e) { toast.fail(e); busy.value = null; }
}

// ── 3. publishing ──
const how = ref<'dashboard' | 'api'>('dashboard');
const key = ref<string | null>(null);
async function createKey() {
  busy.value = 'key';
  try { const k = await api.post<{ key: string }>('/api-key', { name: 'First key' }); key.value = k.key; }
  catch (e) { toast.fail(e); } finally { busy.value = null; }
}
const apiBase = computed(() => (location.hostname.startsWith('app.') ? `${location.protocol}//api.${location.hostname.slice(4)}` : `${location.protocol}//${location.hostname}:3290`));
const site = location.hostname.startsWith('app.') ? `${location.protocol}//${location.hostname.slice(4)}` : `${location.protocol}//${location.hostname}:4290`;
const curl = computed(() => `curl ${apiBase.value}/api/v1/team \\\n  -H "x-api-key: ${key.value ?? 'sk_live_…'}"`);

async function finish(to: string) {
  busy.value = 'finish';
  try {
    const me = await api.post<AuthMe>('/user/me/onboarding');
    session.me = me;
    await loadTeams();
    await router.replace(to);
  } catch (e) { toast.fail(e); busy.value = null; }
}

// ── the ink panel: where they are and what is set ──
const summary = computed(() => [
  currentTeam.value && currentTeam.value.name !== 'Main' ? `${currentTeam.value.name} · ${(session.me?.user.timezone ?? f.tz).replace(/_/g, ' ')}` : 'Name it and set your timezone',
  connectedTypes.value.size ? [...connectedTypes.value].map((t) => META[t].name).join(', ') : 'Any of the 15 networks',
  step.value === 3 ? (how.value === 'api' ? 'From your code' : 'From the dashboard') : 'Dashboard, API or both',
]);
const done = (n: number) => (n === 1 ? !!currentTeam.value && currentTeam.value.name !== 'Main' && step.value > 1 : n === 2 ? connectedTypes.value.size > 0 : false);

onMounted(async () => {
  void loadPlatforms();
  if (!session.teamsLoaded) await loadTeams();
  fill();
  const q = route.query;
  if (q.success !== undefined) {
    const type = String(q.type ?? '') as NetworkType;
    void router.replace({ query: { step: '2' } });
    if (q.success === 'true') { await refreshTeam(); toast.success(`${META[type]?.name ?? 'Account'} connected`); }
    else toast.error(`Could not connect ${META[type]?.name ?? 'the account'}`, String(q.error ?? 'The connection was cancelled.'));
  }
});
watch(step, (n) => { if (n === 1) fill(); });
</script>

<template>
  <AuthShell :title="COPY[step]!.title" :subtitle="COPY[step]!.subtitle" wide>
    <template #switch><button type="button" class="skip" :disabled="!!busy" @click="finish('/posts')">Skip for now</button></template>
    <template #eyebrow>
      <ol class="dots" aria-label="Progress">
        <li v-for="s in STEPS" :key="s.n" :class="{ on: s.n === step, past: s.n < step }" :aria-current="s.n === step ? 'step' : undefined"><span>{{ String(s.n).padStart(2, '0') }}</span>{{ s.eyebrow }}</li>
      </ol>
    </template>

    <!-- 1 · workspace -->
    <form v-if="step === 1" class="stack-16" novalidate @submit.prevent="saveWorkspace">
      <div v-if="error && !Object.keys(fields).length" class="callout danger" role="alert">{{ error }}</div>
      <Input v-model="f.org" label="Organization" placeholder="Your company or studio" :error="fields.org" help="Billing, members and API keys live here." autofocus />
      <Input v-model="f.team" label="First team" placeholder="e.g. Halo Fitness" :error="fields.team" help="Usually a brand or a client. Its accounts, posts and media stay together." />
      <Select v-model="f.tz" label="Timezone" :options="TIMEZONES" :error="fields.tz" :help="localTime ? `It is ${localTime} there. Schedules and the calendar use this timezone.` : 'Schedules and the calendar use this timezone.'" />
      <div class="actions"><Button type="submit" variant="primary" :loading="busy === 'workspace'">Continue <span aria-hidden="true">→</span></Button></div>
    </form>

    <!-- 2 · channels -->
    <div v-else-if="step === 2" class="stack-16">
      <div class="nets">
        <button v-for="n in open" :key="n.type" type="button" class="net" :class="{ on: connectedTypes.has(n.type) }" :disabled="busy === n.type" @click="startConnect(n.type)">
          <NetworkIcon :type="n.type" :size="28" :title="false" />
          <span class="grow"><span class="nm">{{ n.name }}</span><span class="st">{{ connectedTypes.has(n.type) ? 'Connected' : busy === n.type ? 'Opening…' : 'Connect' }}</span></span>
          <Check v-if="connectedTypes.has(n.type)" :size="16" class="ok" />
        </button>
      </div>
      <div v-for="a in unpicked" :key="a.id" class="callout warn small">
        <div class="grow">{{ META[a.type].name }} is connected. Choose the {{ META[a.type].channelNoun }} it posts to before publishing.</div>
        <router-link :to="`/social-accounts`">Choose</router-link>
      </div>
      <template v-if="soon.length">
        <p class="label soon-h">Opening soon <span class="num">{{ soon.length }}</span></p>
        <p class="small muted soon-p">These networks are reviewing Siar's app. They switch on here as each one approves, with nothing for you to change.</p>
        <div class="soon"><span v-for="n in soon" :key="n.type" class="chip"><NetworkIcon :type="n.type" :size="18" :title="false" />{{ n.name }}</span></div>
      </template>
      <p class="small muted">Connecting for a client? Send them a connect link from <router-link to="/social-accounts">Social accounts</router-link> later, so they sign in themselves.</p>
      <div class="actions">
        <Button variant="secondary" @click="go(1)">Back</Button>
        <Button :variant="connectedTypes.size ? 'primary' : 'secondary'" @click="go(3)">{{ connectedTypes.size ? 'Continue' : 'Skip this step' }} <span aria-hidden="true">→</span></Button>
      </div>
    </div>

    <!-- 3 · publishing -->
    <div v-else class="stack-16">
      <div class="ways" role="radiogroup" aria-label="How you publish">
        <button type="button" role="radio" class="way" :class="{ on: how === 'dashboard' }" :aria-checked="how === 'dashboard'" @click="how = 'dashboard'">
          <PenLine :size="20" /><span class="w-t">From the dashboard</span><span class="w-d">Write once, tailor it for each network, schedule it on the calendar.</span>
        </button>
        <button type="button" role="radio" class="way" :class="{ on: how === 'api' }" :aria-checked="how === 'api'" @click="how = 'api'">
          <Code2 :size="20" /><span class="w-t">From your code</span><span class="w-d">One request publishes to every connected account. Webhooks report back.</span>
        </button>
      </div>
      <div v-if="how === 'api'" class="api stack-16">
        <template v-if="key">
          <CopyField :value="key" label="Your API key" help="Shown once. Store it somewhere safe; you can make more under API keys." />
          <pre class="code"><code>{{ curl }}</code></pre>
        </template>
        <div v-else class="row wrap"><Button :loading="busy === 'key'" @click="createKey">Create an API key</Button><span class="small muted">Or later, under API keys.</span></div>
        <a class="small doc" :href="`${site}/docs`" target="_blank" rel="noopener">Read the API docs <ExternalLink :size="13" /></a>
      </div>
      <div class="actions">
        <Button variant="secondary" @click="go(2)">Back</Button>
        <Button v-if="how === 'dashboard'" variant="primary" :loading="busy === 'finish'" @click="finish('/compose')">Write your first post <span aria-hidden="true">→</span></Button>
        <Button v-else variant="primary" :loading="busy === 'finish'" @click="finish('/posts')">Go to the dashboard <span aria-hidden="true">→</span></Button>
      </div>
    </div>

    <template #kicker><span>Welcome</span> <i></i> step {{ step }} of 3</template>
    <template #pitch>
      <ol class="plan">
        <li v-for="(s, i) in STEPS" :key="s.n" :class="{ on: s.n === step, done: done(s.n) }">
          <span class="pn"><Check v-if="done(s.n)" :size="14" /><template v-else>{{ String(s.n).padStart(2, '0') }}</template></span>
          <span class="pb"><b>{{ s.title }}</b><span>{{ summary[i] }}</span></span>
        </li>
      </ol>
    </template>
  </AuthShell>

  <Modal :open="!!connectFor" :title="`Connect ${connectFor ? META[connectFor].name : ''}`" size="sm" @close="connectFor = null">
    <form v-if="connectFor" class="stack-16" novalidate @submit.prevent="submitMastodon">
      <MastodonField v-model="mastodon" :error="mastodonError" @update:model-value="mastodonError = null" />
      <div class="row" style="justify-content: flex-end"><Button variant="secondary" @click="connectFor = null">Cancel</Button><Button type="submit" variant="primary" :icon-right="ExternalLink">Continue</Button></div>
    </form>
  </Modal>
</template>

<style scoped>
.skip { border: 0; background: none; padding: 0; font: inherit; color: var(--text-subtle); text-decoration: underline; text-underline-offset: 3px; cursor: pointer; }
.skip:hover { color: var(--text); }

.dots { list-style: none; margin: 0 0 22px; padding: 0; display: flex; gap: 18px; font-family: var(--mono); font-size: var(--fs-11); letter-spacing: .08em; text-transform: uppercase; color: var(--text-faint); }
.dots li { display: flex; gap: 6px; align-items: center; }
.dots li span { color: var(--text-faint); }
.dots li.past { color: var(--text-subtle); }
.dots li.on { color: var(--text); }
.dots li.on span::before { content: '/ '; }

.actions { display: flex; gap: 8px; justify-content: flex-end; padding-top: 8px; }

.nets { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.net { display: flex; align-items: center; gap: 12px; padding: 12px; border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--bg-elevated); color: var(--text); text-align: left; cursor: pointer; transition: border-color 200ms, transform 300ms var(--ease-out), box-shadow 300ms var(--ease-out); }
.net:hover:not(:disabled):not(.on) { border-color: var(--text); transform: translateY(-1px); box-shadow: var(--shadow-sm); }
.net:disabled { cursor: progress; opacity: .6; }
.net.on { cursor: default; border-color: var(--text); }
.nm { display: block; font-weight: 600; font-size: var(--fs-14); }
.st { display: block; font-size: var(--fs-12); color: var(--text-subtle); }
.net.on .st { color: var(--success); }
.ok { color: var(--success); flex: none; }
.soon-h { margin: 8px 0 0; display: flex; gap: 8px; align-items: center; }
.soon-p { margin: -8px 0 0; }
.soon { display: flex; flex-wrap: wrap; gap: 6px; }
.chip { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px 4px 5px; border: 1px solid var(--border); border-radius: var(--radius-pill); font-size: var(--fs-12); color: var(--text-subtle); }
.chip :deep(svg), .chip :deep(.ni) { opacity: .7; }

.ways { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.way { display: flex; flex-direction: column; align-items: flex-start; gap: 6px; padding: 18px; border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--bg-elevated); color: var(--text-muted); text-align: left; cursor: pointer; transition: border-color 200ms, box-shadow 300ms var(--ease-out); }
.way:hover { border-color: var(--border-strong); }
.way.on { border-color: var(--text); box-shadow: inset 0 0 0 1px var(--text); color: var(--text); }
.w-t { margin-top: 8px; font-weight: 600; font-size: var(--fs-15); color: var(--text); }
.w-d { font-size: var(--fs-13); line-height: 19px; color: var(--text-subtle); }
.code { margin: 0; padding: 14px 16px; border-radius: var(--radius-lg); background: #0b0b0a; color: #f3efe4; font-family: var(--mono); font-size: var(--fs-12); line-height: 19px; white-space: pre; overflow-x: auto; }
.code code { background: none; color: inherit; padding: 0; border: 0; font: inherit; }
.doc { display: inline-flex; gap: 6px; align-items: center; color: var(--text); font-weight: 500; }

/* ink panel */
.plan { list-style: none; margin: 0; padding: 0; border-top: 1px solid rgba(243, 239, 228, .9); }
.plan li { display: flex; gap: 16px; padding: 16px 0; border-bottom: 1px solid #2a2a27; color: #75736c; transition: color 300ms; }
.plan li.on, .plan li.done { color: #f3efe4; }
.pn { flex: none; width: 26px; height: 26px; border-radius: 50%; border: 1px solid currentColor; display: grid; place-items: center; font-family: var(--mono); font-size: var(--fs-11); opacity: .9; }
.plan li.done .pn { background: #f3efe4; color: #0b0b0a; border-color: #f3efe4; }
.pb { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.pb b { font-size: var(--fs-16); font-weight: 600; letter-spacing: -0.01em; }
.pb span { font-size: var(--fs-13); color: #a19d92; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.plan li:not(.on):not(.done) .pb span { color: #5d5b55; }

@media (max-width: 560px) {
  .ways { grid-template-columns: minmax(0, 1fr); }
  .net { padding: 10px; gap: 10px; }
  .dots { gap: 12px; }
  .dots li:not(.on) { font-size: 0; gap: 0; }
  .dots li:not(.on) span { font-size: var(--fs-11); }
}
</style>
