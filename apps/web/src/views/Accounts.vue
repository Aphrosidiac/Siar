<script setup lang="ts">
import { handle } from '@/lib/format';
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Link2, MoreHorizontal, Plus, RefreshCw, TriangleAlert, Unplug, Plug, Activity, Mail, ExternalLink } from 'lucide-vue-next';
import PageHead from '@/components/PageHead.vue';
import NoTeam from '@/components/NoTeam.vue';
import NetworkIcon from '@/components/NetworkIcon.vue';
import CopyField from '@/components/CopyField.vue';
import Avatar from '@/components/ui/Avatar.vue';
import Button from '@/components/ui/Button.vue';
import Badge from '@/components/ui/Badge.vue';
import Modal from '@/components/ui/Modal.vue';
import Input from '@/components/ui/Input.vue';
import Select from '@/components/ui/Select.vue';
import Checkbox from '@/components/ui/Checkbox.vue';
import Dropdown from '@/components/ui/Dropdown.vue';
import { api } from '@/lib/api';
import { currentTeam, isAdmin, refreshTeam, session } from '@/lib/store';
import { META, NETWORKS, needsChannel, SET_CHANNEL_TYPES } from '@/lib/networks';
import { confirm } from '@/lib/confirm';
import { toast } from '@/lib/toast';
import type { NetworkType, SocialAccount } from '@/lib/types';

const route = useRoute(); const router = useRouter();
const accounts = computed(() => new Map((currentTeam.value?.socialAccounts ?? []).map((a) => [a.type, a])));
const connected = computed(() => NETWORKS.filter((n) => accounts.value.has(n.type)));
const rows = computed(() => connected.value.map((n) => ({ n, a: accounts.value.get(n.type)! })));
const available = computed(() => NETWORKS.filter((n) => !accounts.value.has(n.type)));
const busy = ref<string | null>(null);

// ── connect ──
const connectFor = ref<NetworkType | null>(null);
const opts = reactive({ serverUrl: '', instagramConnectionMethod: 'FACEBOOK' as 'FACEBOOK' | 'INSTAGRAM' });
function startConnect(type: NetworkType) {
  if (type === 'MASTODON' || type === 'BLUESKY' || type === 'INSTAGRAM') { opts.serverUrl = ''; connectFor.value = type; return; }
  void go(type);
}
async function go(type: NetworkType) {
  if (!session.teamId) return;
  busy.value = type;
  try {
    const body: Record<string, unknown> = { type, teamId: session.teamId, redirectUrl: `${location.origin}/social-accounts` };
    if (opts.serverUrl.trim() && (type === 'MASTODON' || type === 'BLUESKY')) body.serverUrl = opts.serverUrl.trim();
    if (type === 'INSTAGRAM') body.instagramConnectionMethod = opts.instagramConnectionMethod;
    const { url } = await api.post<{ url: string }>('/social-account/connect', body);
    location.href = url;
  } catch (e) { toast.fail(e); busy.value = null; }
}

// ── return from the network ──
const channelFor = ref<SocialAccount | null>(null);
const retryOffer = ref<{ type: NetworkType; total: number } | null>(null);
onMounted(async () => {
  const q = route.query;
  if (q.success === undefined) return;
  const type = String(q.type ?? '') as NetworkType;
  void router.replace({ path: '/social-accounts' });
  if (q.success === 'true') {
    await refreshTeam();
    toast.success(`${META[type]?.name ?? 'Account'} connected`);
    const acc = currentTeam.value?.socialAccounts.find((a) => a.type === type);
    if (acc && (q.needsChannel === 'true' || needsChannel(acc))) openChannel(acc);
    else if (acc) void offerRetry(acc);
  } else {
    toast.error(`Could not connect ${META[type]?.name ?? 'the account'}`, String(q.error ?? 'The connection was cancelled.'));
  }
});
async function offerRetry(acc: SocialAccount) {
  try {
    const r = await api.get<{ total: number }>('/post/reconnect-social-account/candidates', { teamId: acc.teamId, type: acc.type, limit: 1 });
    if (r.total > 0) retryOffer.value = { type: acc.type, total: r.total };
  } catch { /* optional */ }
}
async function requeue() {
  if (!retryOffer.value || !session.teamId) return;
  busy.value = 'requeue';
  try {
    const r = await api.post<{ succeeded: number; failed: number }>('/post/reconnect-social-account', { teamId: session.teamId, type: retryOffer.value.type });
    toast.success(`${r.succeeded} post${r.succeeded === 1 ? '' : 's'} re-queued`, r.failed ? `${r.failed} could not be re-queued.` : undefined);
    retryOffer.value = null;
  } catch (e) { toast.fail(e); } finally { busy.value = null; }
}

// ── channel picker ──
const pick = ref<string | null>(null);
function openChannel(a: SocialAccount) { channelFor.value = a; pick.value = a.channelId ?? a.channels?.[0]?.id ?? null; }
async function saveChannel() {
  const a = channelFor.value; if (!a || !pick.value) return;
  busy.value = 'channel';
  try { await api.post('/social-account/set-channel', { type: a.type, teamId: a.teamId, channelId: pick.value }); await refreshTeam(); toast.success(`${META[a.type].channelNoun[0]!.toUpperCase()}${META[a.type].channelNoun.slice(1)} selected`); const fresh = currentTeam.value?.socialAccounts.find((x) => x.id === a.id); channelFor.value = null; if (fresh) void offerRetry(fresh); }
  catch (e) { toast.fail(e); } finally { busy.value = null; }
}
async function refreshChannels(a: SocialAccount) {
  busy.value = 'refresh';
  try { await api.post('/social-account/refresh-channels', { type: a.type, teamId: a.teamId }); await refreshTeam(); channelFor.value = currentTeam.value?.socialAccounts.find((x) => x.id === a.id) ?? null; toast.success('Channels refreshed'); }
  catch (e) { toast.fail(e); } finally { busy.value = null; }
}
const REFRESHABLE = ['FACEBOOK', 'INSTAGRAM', 'LINKEDIN', 'YOUTUBE', 'GOOGLE_BUSINESS'];

// ── other actions ──
async function disconnect(a: SocialAccount) {
  if (!(await confirm({ title: `Disconnect ${META[a.type].name}?`, message: `Siar stops publishing to ${a.username ? handle(a.username) : META[a.type].name}. Scheduled posts for it are paused. You can connect it again later.`, confirmLabel: 'Disconnect', danger: true }))) return;
  busy.value = a.type;
  try { await api.del('/social-account/disconnect', { type: a.type, teamId: a.teamId }); await refreshTeam(); toast.success('Disconnected'); } catch (e) { toast.fail(e); } finally { busy.value = null; }
}
async function check(a: SocialAccount) {
  busy.value = a.type;
  try { const r = await api.post<{ success: boolean; message?: string }>('/social-account/connection-check', { type: a.type, teamId: a.teamId }); await refreshTeam(); if (r.success) toast.success('Connection is healthy', r.message); else toast.error('Connection problem', r.message); }
  catch (e) { toast.fail(e); } finally { busy.value = null; }
}
async function profile(a: SocialAccount) {
  busy.value = a.type;
  try { await api.post('/social-account/profile-refresh', { type: a.type, teamId: a.teamId }); await refreshTeam(); toast.success('Profile refreshed'); } catch (e) { toast.fail(e); } finally { busy.value = null; }
}
async function unsetChannel(a: SocialAccount) {
  busy.value = a.type;
  try { await api.post('/social-account/unset-channel', { type: a.type, teamId: a.teamId }); await refreshTeam(); toast.success('Channel cleared'); } catch (e) { toast.fail(e); } finally { busy.value = null; }
}
async function toggleMessaging(a: SocialAccount) {
  busy.value = a.type;
  try { await api.post(`/social-account/messaging/${a.messagingStatus === 'ENABLED' ? 'disable' : 'enable'}`, { type: a.type, teamId: a.teamId }); await refreshTeam(); toast.success(a.messagingStatus === 'ENABLED' ? 'Messaging disabled' : 'Messaging enabled'); }
  catch (e) { toast.fail(e); } finally { busy.value = null; }
}

// ── portal link ──
const portal = ref(false); const portalTypes = ref<Set<string>>(new Set()); const portalHours = ref(24); const portalUrl = ref('');
function openPortal() { portal.value = true; portalUrl.value = ''; portalTypes.value = new Set(NETWORKS.map((n) => n.type)); }
function togglePortal(t: string, on: boolean) { const s = new Set(portalTypes.value); if (on) s.add(t); else s.delete(t); portalTypes.value = s; }
async function makePortal() {
  busy.value = 'portal';
  try { const r = await api.post<{ url: string }>('/social-account/create-portal-link', { teamId: session.teamId, socialAccountTypes: [...portalTypes.value], expiresIn: portalHours.value, redirectUrl: `${location.origin}/social-accounts` }); portalUrl.value = r.url; }
  catch (e) { toast.fail(e); } finally { busy.value = null; }
}
const connectedCount = computed(() => currentTeam.value?.socialAccounts.length ?? 0);
</script>

<template>
  <div class="page wide">
    <PageHead title="Social accounts" :subtitle="currentTeam ? `${connectedCount} of 15 networks connected for ${currentTeam.name}.` : 'Connect the networks this team posts to.'">
      <Button v-if="currentTeam" :icon="Link2" @click="openPortal">Share a connect link</Button>
    </PageHead>
    <NoTeam v-if="!currentTeam" />
    <template v-else>
      <div v-if="retryOffer" class="callout accent mb-16" role="status">
        <div class="grow">{{ retryOffer.total }} post{{ retryOffer.total === 1 ? '' : 's' }} for {{ META[retryOffer.type].name }} stopped while the account was disconnected. Re-queue them now?</div>
        <Button size="sm" variant="primary" :loading="busy === 'requeue'" @click="requeue">Re-queue</Button>
        <Button size="sm" variant="ghost" @click="retryOffer = null">Not now</Button>
      </div>
      <section v-if="rows.length" class="sec">
        <div class="grid-head label"><span /><span>Network</span><span>Account</span><span>Posts to</span><span>Status</span><span /></div>
        <article v-for="{ n, a } in rows" :key="n.type" class="acc">
          <NetworkIcon :type="n.type" :size="30" :title="false" />
          <div class="cell"><div class="net">{{ n.name }}</div><div class="tiny muted truncate">{{ a.username ? handle(a.username) : '' }}</div></div>
          <div class="cell row" style="gap: 8px"><Avatar :src="a.avatarUrl" :name="a.displayName ?? a.username" :size="22" /><span class="truncate">{{ a.displayName ?? a.username }}</span></div>
          <div class="cell row" :class="{ nochan: !SET_CHANNEL_TYPES.includes(n.type) }" style="gap: 8px">
            <template v-if="SET_CHANNEL_TYPES.includes(n.type)">
              <span v-if="a.channelId" class="truncate">{{ a.channels?.find((c) => c.id === a.channelId)?.name ?? a.channelId }}</span>
              <span v-else class="muted truncate">No {{ n.channelNoun }} chosen</span>
              <button type="button" class="link-btn small nowrap" @click="openChannel(a)">{{ a.channelId ? 'Change' : 'Choose' }}</button>
            </template>
            <span v-else class="faint">—</span>
          </div>
          <div class="cell">
            <Badge v-if="a.connectionState === 'NEEDS_RECONNECT'" tone="danger" size="sm">Needs reconnect</Badge>
            <Badge v-else-if="needsChannel(a)" tone="warn" size="sm">Choose a {{ n.channelNoun }}</Badge>
            <Badge v-else-if="a.deleteOn" tone="warn" size="sm">Removal pending</Badge>
            <Badge v-else tone="success" size="sm">Connected</Badge>
          </div>
          <Dropdown align="right">
            <template #trigger="{ toggle }"><Button iconOnly label="Account actions" variant="ghost" size="sm" :icon="MoreHorizontal" @click="toggle" /></template>
            <button type="button" class="menu-item" data-close @click="check(a)"><Activity :size="14" />Check connection</button>
            <button type="button" class="menu-item" data-close @click="profile(a)"><RefreshCw :size="14" />Refresh profile</button>
            <button v-if="SET_CHANNEL_TYPES.includes(n.type) && a.channelId" type="button" class="menu-item" data-close @click="unsetChannel(a)"><Unplug :size="14" />Clear {{ n.channelNoun }}</button>
            <button v-if="n.type === 'FACEBOOK' || n.type === 'INSTAGRAM'" type="button" class="menu-item" data-close @click="toggleMessaging(a)"><Mail :size="14" />{{ a.messagingStatus === 'ENABLED' ? 'Disable' : 'Enable' }} inbox messaging</button>
            <button type="button" class="menu-item" data-close @click="startConnect(n.type)"><Plug :size="14" />Reconnect</button>
            <div class="menu-sep" />
            <button v-if="isAdmin" type="button" class="menu-item danger" data-close @click="disconnect(a)"><Unplug :size="14" />Disconnect</button>
          </Dropdown>
          <div v-if="a.connectionState === 'NEEDS_RECONNECT' || a.deleteOn" class="alert">
            <div v-if="a.connectionState === 'NEEDS_RECONNECT'" class="callout danger small">
              <TriangleAlert :size="16" /><div class="grow">{{ a.connectionStateReason || 'The network rejected our access. Posts to this account will fail until you reconnect.' }}</div>
              <Button variant="primary" size="sm" :loading="busy === n.type" @click="startConnect(n.type)">Reconnect</Button>
            </div>
            <div v-else class="callout warn small"><div>Scheduled for removal on {{ new Date(a.deleteOn!).toLocaleDateString('en-GB') }} unless reconnected.</div></div>
          </div>
        </article>
      </section>
      <section class="sec">
        <div class="label sec-h">{{ connected.length ? 'Add a network' : 'Networks' }} <span class="num">{{ available.length }}</span></div>
        <div class="list avail">
          <button v-for="n in available" :key="n.type" type="button" class="av-row" :disabled="busy === n.type" @click="startConnect(n.type)">
            <NetworkIcon :type="n.type" :size="28" :title="false" />
            <span class="grow"><span class="net d-block">{{ n.name }}</span><span class="tiny muted truncate d-block">{{ n.blurb }}</span></span>
            <Plus :size="16" class="plus" />
          </button>
        </div>
      </section>
    </template>

    <!-- connect options -->
    <Modal :open="!!connectFor" :title="`Connect ${connectFor ? META[connectFor].name : ''}`" size="sm" @close="connectFor = null">
      <form v-if="connectFor" class="stack-16" @submit.prevent="go(connectFor!); connectFor = null">
        <Input v-if="connectFor === 'MASTODON'" v-model="opts.serverUrl" label="Server URL" placeholder="https://mastodon.social" type="url" required help="The Mastodon server your account lives on." autofocus />
        <Input v-if="connectFor === 'BLUESKY'" v-model="opts.serverUrl" label="PDS URL (optional)" placeholder="https://bsky.social" type="url" help="Leave empty for bsky.social." autofocus />
        <Select v-if="connectFor === 'INSTAGRAM'" v-model="opts.instagramConnectionMethod" label="Sign in with" :options="[{ value: 'FACEBOOK', label: 'Facebook (business account linked to a Page)' }, { value: 'INSTAGRAM', label: 'Instagram (professional account)' }]" />
        <div class="row" style="justify-content: flex-end"><Button variant="secondary" @click="connectFor = null">Cancel</Button><Button type="submit" variant="primary" :icon-right="ExternalLink">Continue</Button></div>
      </form>
    </Modal>

    <!-- channel picker -->
    <Modal :open="!!channelFor" :title="channelFor ? `Choose a ${META[channelFor.type].channelNoun || 'channel'}` : ''" :description="channelFor ? `Where should Siar publish for ${META[channelFor.type].name}?` : ''" @close="channelFor = null">
      <div v-if="channelFor" class="stack-16">
        <div v-if="!channelFor.channels?.length" class="callout warn">No {{ META[channelFor.type].channelNoun }}s were found on this login. Refresh the list or reconnect with more permissions.</div>
        <div class="stack">
          <label v-for="c in channelFor.channels ?? []" :key="c.id" class="chan" :class="{ on: pick === c.id }">
            <input v-model="pick" type="radio" name="channel" :value="c.id" class="sr-only" />
            <Avatar :src="c.avatarUrl" :name="c.name ?? c.username" :size="28" />
            <div class="grow"><div class="strong truncate">{{ c.name ?? c.username ?? c.id }}</div><div v-if="c.username || c.address" class="tiny muted truncate">{{ c.username ? handle(c.username) : c.address }}</div></div>
          </label>
        </div>
        <div class="row" style="justify-content: space-between">
          <Button v-if="REFRESHABLE.includes(channelFor.type)" variant="ghost" size="sm" :icon="RefreshCw" :loading="busy === 'refresh'" @click="refreshChannels(channelFor)">Refresh list</Button><span v-else />
          <div class="row"><Button variant="secondary" @click="channelFor = null">Later</Button><Button variant="primary" :disabled="!pick" :loading="busy === 'channel'" @click="saveChannel">Use this {{ META[channelFor.type].channelNoun || 'channel' }}</Button></div>
        </div>
      </div>
    </Modal>

    <!-- portal link -->
    <Modal :open="portal" title="Share a connect link" description="Send this link to a client. They connect their own accounts on a hosted page — no Siar login needed." @close="portal = false">
      <div class="stack-16">
        <div class="grid-3" style="grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 8px">
          <Checkbox v-for="n in NETWORKS" :key="n.type" :model-value="portalTypes.has(n.type)" :label="n.name" @update:model-value="togglePortal(n.type, $event)" />
        </div>
        <Select v-model="portalHours" label="Link expires after" :options="[{ value: 1, label: '1 hour' }, { value: 24, label: '1 day' }, { value: 72, label: '3 days' }, { value: 168, label: '7 days' }, { value: 720, label: '30 days' }]" />
        <CopyField v-if="portalUrl" :value="portalUrl" label="Connect link" />
        <div class="row" style="justify-content: flex-end"><Button variant="secondary" @click="portal = false">Close</Button><Button variant="primary" :disabled="!portalTypes.size" :loading="busy === 'portal'" @click="makePortal">{{ portalUrl ? 'Create another' : 'Create link' }}</Button></div>
      </div>
    </Modal>
  </div>
</template>

<style scoped>
.sec + .sec { margin-top: 40px; }
.sec-h { display: flex; gap: 8px; padding-bottom: 10px; border-bottom: 1px solid var(--text); }
.sec-h .num { color: var(--text-faint); }
.d-block { display: block; }
.grid-head, .acc { display: grid; grid-template-columns: 30px minmax(130px, 1fr) minmax(150px, 1.2fr) minmax(180px, 1.5fr) 150px 32px; column-gap: 16px; align-items: center; }
.grid-head { padding: 0 4px 10px; border-bottom: 1px solid var(--text); }
.acc { padding: 10px 4px; border-bottom: 1px solid var(--border-soft); min-height: 58px; transition: background 180ms; }
.acc:hover { background: var(--bg-hover); }
.cell { min-width: 0; }
.net { font-weight: 500; line-height: 20px; }
.alert { grid-column: 2 / -1; margin-top: 8px; }
.alert .callout { align-items: center; }
.avail { margin-top: 14px; display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 8px; }
.av-row { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--bg-elevated); min-width: 0; text-align: left; color: var(--text); cursor: pointer; transition: border-color 200ms, transform 300ms var(--ease-out), box-shadow 300ms var(--ease-out); }
.av-row:hover:not(:disabled) { border-color: var(--text); transform: translateY(-1px); box-shadow: var(--shadow-sm); }
.av-row:disabled { opacity: .5; cursor: progress; }
.plus { color: var(--text-subtle); flex: none; }
.av-row:hover .plus { color: var(--text); }
@media (max-width: 900px) {
  .grid-head { display: none; }
  .acc { grid-template-columns: 30px minmax(0, 1fr) auto 32px; row-gap: 4px; }
  .acc > :first-child { grid-row: 1; grid-column: 1; }
  .acc > .cell:nth-of-type(1) { grid-row: 1; grid-column: 2; }
  .acc > .cell:nth-of-type(2), .acc > .cell:nth-of-type(3) { grid-column: 2 / 5; }
  .acc > .cell:nth-of-type(4) { grid-row: 1; grid-column: 3; }
  .acc > :deep(.dd) { grid-row: 1; grid-column: 4; }
  .nochan { display: none; }
}
.chan { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border: 1px solid var(--border); border-radius: var(--radius); cursor: pointer; transition: background var(--t-micro), border-color var(--t-micro); }
.chan:hover { background: var(--bg-hover); }
.chan.on { border-color: var(--text); background: var(--bg-hover); }
.chan:has(input:focus-visible) { box-shadow: var(--focus); }
</style>
