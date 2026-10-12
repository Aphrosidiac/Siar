<script setup lang="ts">
import { handle } from '@/lib/format';
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Link2, MoreHorizontal, Plus, RefreshCw, TriangleAlert, Unplug, Plug, Activity, Mail, ExternalLink, Flag, MapPin, MonitorPlay, Building2, UserRound, AtSign, LayoutGrid, Hash, MessagesSquare, Check } from 'lucide-vue-next';
import type { Component } from 'vue';
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
import { currentTeam, isAdmin, loadPlatforms, platforms, refreshTeam, session } from '@/lib/store';
import { META, NETWORKS, channelMode, needsChannel, SET_CHANNEL_TYPES } from '@/lib/networks';
import { confirm } from '@/lib/confirm';
import { toast } from '@/lib/toast';
import type { NetworkType, SocialAccount } from '@/lib/types';

const route = useRoute(); const router = useRouter();
const accounts = computed(() => new Map((currentTeam.value?.socialAccounts ?? []).map((a) => [a.type, a])));
const connected = computed(() => NETWORKS.filter((n) => accounts.value.has(n.type)));
const rows = computed(() => connected.value.map((n) => ({ n, a: accounts.value.get(n.type)! })));
const ready = (t: NetworkType) => platforms.value?.[t]?.available !== false;
// networks still waiting on their app review sort last and can't be started
const available = computed(() => NETWORKS.filter((n) => !accounts.value.has(n.type)).sort((a, b) => Number(!ready(a.type)) - Number(!ready(b.type))));
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
  void loadPlatforms();
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

// ── where each account publishes ──
const KIND_ICON: Record<string, Component> = { page: Flag, location: MapPin, channel: MonitorPlay, organization: Building2, account: AtSign };
/** Chosen per post in the composer, not on the account. */
const PER_POST: Partial<Record<NetworkType, { noun: string; icon: Component }>> = {
  PINTEREST: { noun: 'board', icon: LayoutGrid }, REDDIT: { noun: 'subreddit', icon: MessagesSquare },
  DISCORD: { noun: 'channel', icon: Hash }, SLACK: { noun: 'channel', icon: Hash },
};
/** The login, not the page/location picked (choosing one renames the account to it). */
const signedIn = (a: SocialAccount) => (a.userUsername ? handle(a.userUsername) : a.userDisplayName ?? (a.username ? handle(a.username) : a.displayName ?? ''));
const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? '' : 's'}`;
type Target = { tone: 'set' | 'self' | 'missing' | 'post'; icon: Component; name: string; sub: string; action?: string };
function target(a: SocialAccount): Target {
  const m = META[a.type]; const list = a.channels ?? [];
  const pp = PER_POST[a.type];
  if (pp) return { tone: 'post', icon: pp.icon, name: 'Chosen per post', sub: a.type === 'REDDIT' ? 'Pick the subreddit in the composer' : `${plural(list.length, pp.noun)} · pick in the composer` };
  if (!SET_CHANNEL_TYPES.includes(a.type)) return { tone: 'self', icon: UserRound, name: 'Own profile', sub: 'The account you signed in with' };
  const c = list.find((x) => x.id === a.channelId);
  if (a.channelId) return { tone: 'set', icon: KIND_ICON[m.channelNoun] ?? Flag, name: c?.name ?? c?.username ?? a.channelId, sub: c?.address ?? (list.length > 1 ? `${cap(m.channelNoun)} · ${list.length - 1} more on this login` : cap(m.channelNoun)), action: 'Change' };
  if (channelMode(a) === 'required') return { tone: 'missing', icon: TriangleAlert, name: `No ${m.channelNoun} chosen`, sub: `Posts can't publish until you pick one`, action: 'Choose' };
  return { tone: 'self', icon: UserRound, name: 'Own profile', sub: list.length ? `Or post as one of ${plural(list.length, m.channelNoun)}` : 'The account you signed in with', action: list.length ? 'Change' : undefined };
}
const cap = (w: string) => (w ? w[0]!.toUpperCase() + w.slice(1) : w);

// ── channel picker ──
/** The two ways to connect Instagram, explained where the choice is made. */
const IG_METHODS = [
  { value: 'FACEBOOK' as const, label: 'Facebook', help: 'For an Instagram account linked to a Facebook Page. You sign in with Facebook. Adds location tagging and audio search.' },
  { value: 'INSTAGRAM' as const, label: 'Instagram', help: 'No Facebook Page needed. You sign in with the Instagram business or creator account itself.' },
];
const SELF = '__self';
const pick = ref<string | null>(null);
const pickerOptional = computed(() => !!channelFor.value && channelMode(channelFor.value) !== 'required');
const current = computed(() => channelFor.value?.channelId ?? (pickerOptional.value ? SELF : null));
function openChannel(a: SocialAccount) { channelFor.value = a; pick.value = a.channelId ?? (channelMode(a) !== 'required' ? SELF : a.channels?.[0]?.id ?? null); }
async function saveChannel() {
  const a = channelFor.value; if (!a || !pick.value) return;
  busy.value = 'channel';
  try {
    if (pick.value === SELF) await api.post('/social-account/unset-channel', { type: a.type, teamId: a.teamId });
    else await api.post('/social-account/set-channel', { type: a.type, teamId: a.teamId, channelId: pick.value });
    await refreshTeam(); toast.success(`${META[a.type].name} now publishes to ${pickName.value}`);
    const fresh = currentTeam.value?.socialAccounts.find((x) => x.id === a.id); channelFor.value = null; if (fresh) void offerRetry(fresh);
  } catch (e) { toast.fail(e); } finally { busy.value = null; }
}
const pickName = computed(() => {
  if (pick.value === SELF) return 'its own profile';
  const c = channelFor.value?.channels?.find((x) => x.id === pick.value); return c?.name ?? c?.username ?? 'the selection';
});
async function refreshChannels(a: SocialAccount) {
  busy.value = 'refresh';
  try { await api.post('/social-account/refresh-channels', { type: a.type, teamId: a.teamId }); await refreshTeam(); channelFor.value = currentTeam.value?.socialAccounts.find((x) => x.id === a.id) ?? null; const noun = META[a.type].channelNoun || 'channel'; toast.success(`${noun[0].toUpperCase()}${noun.slice(1)}s refreshed`); }
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
        <div class="grid-head label"><span /><span>Account</span><span>Publishes to</span><span>Status</span><span /></div>
        <article v-for="{ n, a } in rows" :key="n.type" class="acc">
          <NetworkIcon :type="n.type" :size="30" :title="false" />
          <div class="cell"><div class="net">{{ n.name }}</div><div class="tiny muted truncate">Signed in as {{ signedIn(a) }}</div></div>
          <div v-for="t in [target(a)]" :key="t.tone" class="cell tgt" :class="t.tone">
            <span class="tgt-ic"><component :is="t.icon" :size="14" /></span>
            <span class="tgt-tx"><span class="tgt-name truncate">{{ t.name }}</span><span class="tiny muted truncate">{{ t.sub }}</span></span>
            <Button v-if="t.action" size="sm" :variant="t.tone === 'missing' ? 'primary' : 'secondary'" @click="openChannel(a)">{{ t.action }}</Button>
          </div>
          <div class="cell">
            <Badge v-if="a.connectionState === 'NEEDS_RECONNECT'" tone="danger" size="sm">Needs reconnect</Badge>
            <Badge v-else-if="needsChannel(a)" tone="warn" size="sm">Choose {{ /^[aeiou]/.test(n.channelNoun) ? 'an' : 'a' }} {{ n.channelNoun }}</Badge>
            <Badge v-else-if="a.deleteOn" tone="warn" size="sm">Removal pending</Badge>
            <Badge v-else tone="success" size="sm">Connected</Badge>
          </div>
          <Dropdown align="right">
            <template #trigger="{ toggle }"><Button iconOnly label="Account actions" variant="ghost" size="sm" :icon="MoreHorizontal" @click="toggle" /></template>
            <button type="button" class="menu-item" data-close @click="check(a)"><Activity :size="14" />Check connection</button>
            <button type="button" class="menu-item" data-close @click="profile(a)"><RefreshCw :size="14" />Refresh profile</button>
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
          <button v-for="n in available" :key="n.type" type="button" class="av-row" :class="{ soon: !ready(n.type) }" :disabled="busy === n.type || !ready(n.type)" :title="ready(n.type) ? undefined : `${n.name} is reviewing Siar's app. It switches on here once approved.`" @click="startConnect(n.type)">
            <NetworkIcon :type="n.type" :size="28" :title="false" />
            <span class="grow"><span class="net d-block">{{ n.name }}</span><span class="tiny muted truncate d-block">{{ ready(n.type) ? n.blurb : 'Opening soon' }}</span></span>
            <Plus v-if="ready(n.type)" :size="16" class="plus" />
          </button>
        </div>
      </section>
    </template>

    <!-- connect options -->
    <Modal :open="!!connectFor" :title="`Connect ${connectFor ? META[connectFor].name : ''}`" size="sm" @close="connectFor = null">
      <form v-if="connectFor" class="stack-16" @submit.prevent="go(connectFor!); connectFor = null">
        <Input v-if="connectFor === 'MASTODON'" v-model="opts.serverUrl" label="Server URL" placeholder="https://mastodon.social" type="url" required help="The Mastodon server your account lives on." autofocus />
        <Input v-if="connectFor === 'BLUESKY'" v-model="opts.serverUrl" label="PDS URL (optional)" placeholder="https://bsky.social" type="url" help="Leave empty for bsky.social." autofocus />
        <div v-if="connectFor === 'INSTAGRAM'" class="opts" role="radiogroup" aria-label="Sign in with">
          <div class="label">Sign in with</div>
          <label v-for="m in IG_METHODS" :key="m.value" class="opt" :class="{ on: opts.instagramConnectionMethod === m.value }">
            <input v-model="opts.instagramConnectionMethod" type="radio" name="ig-method" :value="m.value" class="sr-only" />
            <span class="rd" aria-hidden="true" />
            <NetworkIcon :type="m.value" :size="28" :title="false" />
            <span class="opt-tx wrap"><span class="strong">{{ m.label }}</span><span class="tiny muted">{{ m.help }}</span></span>
          </label>
        </div>
        <div class="row" style="justify-content: flex-end"><Button variant="secondary" @click="connectFor = null">Cancel</Button><Button type="submit" variant="primary" :icon-right="ExternalLink">Continue</Button></div>
      </form>
    </Modal>

    <!-- channel picker -->
    <Modal :open="!!channelFor" :title="channelFor ? `Where ${META[channelFor.type].name} posts go` : ''" :description="channelFor ? `Signed in as ${signedIn(channelFor)}. Pick the ${META[channelFor.type].channelNoun} Siar publishes to.` : ''" @close="channelFor = null">
      <div v-if="channelFor" class="stack-16">
        <div v-if="!channelFor.channels?.length" class="callout warn">No {{ META[channelFor.type].channelNoun }}s were found on this login. Refresh the list or reconnect with more permissions.</div>
        <div v-else class="opts" role="radiogroup">
          <label v-if="pickerOptional" class="opt" :class="{ on: pick === SELF }">
            <input v-model="pick" type="radio" name="channel" :value="SELF" class="sr-only" />
            <span class="rd" aria-hidden="true" />
            <span class="opt-ic"><UserRound :size="16" /></span>
            <span class="opt-tx"><span class="strong">Own profile</span><span class="tiny muted">{{ signedIn(channelFor) }}, the account you signed in with</span></span>
            <Badge v-if="current === SELF" size="sm">In use</Badge>
          </label>
          <div class="label opt-group">{{ cap(META[channelFor.type].channelNoun) }}s on this login · {{ channelFor.channels.length }}</div>
          <label v-for="c in channelFor.channels" :key="c.id" class="opt" :class="{ on: pick === c.id }">
            <input v-model="pick" type="radio" name="channel" :value="c.id" class="sr-only" />
            <span class="rd" aria-hidden="true" />
            <Avatar v-if="c.avatarUrl" :src="c.avatarUrl" :name="c.name ?? c.username" :size="32" />
            <span v-else class="opt-ic"><component :is="KIND_ICON[META[channelFor.type].channelNoun] ?? Flag" :size="16" /></span>
            <span class="opt-tx"><span class="strong">{{ c.name ?? c.username ?? c.id }}</span><span v-if="c.address || c.username" class="tiny muted">{{ c.address ?? handle(c.username!) }}</span></span>
            <Badge v-if="current === c.id" size="sm">In use</Badge>
          </label>
        </div>
        <div class="row" style="justify-content: space-between">
          <Button v-if="REFRESHABLE.includes(channelFor.type)" variant="ghost" size="sm" :icon="RefreshCw" :loading="busy === 'refresh'" @click="refreshChannels(channelFor)">Refresh list</Button><span v-else />
          <div class="row"><Button variant="secondary" @click="channelFor = null">Cancel</Button><Button variant="primary" :icon="Check" :disabled="!pick || pick === current" :loading="busy === 'channel'" @click="saveChannel">Save</Button></div>
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
.grid-head, .acc { display: grid; grid-template-columns: 30px minmax(160px, 1fr) minmax(260px, 1.6fr) 150px 32px; column-gap: 16px; align-items: center; }
.tgt { display: flex; align-items: center; gap: 10px; }
.tgt-ic { flex: none; width: 28px; height: 28px; border-radius: 50%; display: grid; place-items: center; background: var(--bg-muted); color: var(--text); }
.tgt-tx { display: flex; flex-direction: column; min-width: 0; flex: 1; }
.tgt-name { font-weight: 500; line-height: 20px; }
.tgt.self .tgt-ic, .tgt.post .tgt-ic { background: transparent; box-shadow: inset 0 0 0 1px var(--border); color: var(--text-subtle); }
.tgt.self .tgt-name, .tgt.post .tgt-name { font-weight: 400; color: var(--text-muted); }
.tgt.missing .tgt-ic { background: var(--warn-soft); color: var(--warn); }
.tgt.missing .tgt-name { color: var(--warn); }
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
.av-row.soon { opacity: .55; cursor: default; background: transparent; }
.plus { color: var(--text-subtle); flex: none; }
.av-row:hover .plus { color: var(--text); }
@media (max-width: 900px) {
  .grid-head { display: none; }
  .acc { grid-template-columns: 30px minmax(0, 1fr) auto 32px; row-gap: 4px; }
  .acc > :first-child { grid-row: 1; grid-column: 1; }
  .acc > .cell:nth-of-type(1) { grid-row: 1; grid-column: 2; }
  .acc > .cell:nth-of-type(2) { grid-column: 2 / 5; }
  .acc > .cell:nth-of-type(3) { grid-row: 1; grid-column: 3; }
  .acc > :deep(.dd) { grid-row: 1; grid-column: 4; }
}
.opts { display: flex; flex-direction: column; gap: 6px; }
.opt-group { margin: 10px 0 2px; color: var(--text-subtle); }
.opt { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--bg-elevated); cursor: pointer; transition: background var(--t-micro), border-color var(--t-micro); }
.opt:hover { border-color: var(--border-strong); }
.opt.on { border-color: var(--text); box-shadow: inset 0 0 0 1px var(--text); }
.opt:has(input:focus-visible) { box-shadow: var(--focus); }
.rd { flex: none; width: 18px; height: 18px; border-radius: 50%; border: 1.5px solid var(--border-strong); display: grid; place-items: center; transition: border-color var(--t-micro); }
.rd::after { content: ''; width: 8px; height: 8px; border-radius: 50%; background: var(--text); transform: scale(0); transition: transform 160ms var(--ease-out); }
.opt.on .rd { border-color: var(--text); }
.opt.on .rd::after { transform: scale(1); }
.opt-ic { flex: none; width: 32px; height: 32px; border-radius: 50%; display: grid; place-items: center; background: var(--bg-muted); color: var(--text); }
.opt-tx { display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1; }
.opt-tx > * { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.opt-tx.wrap > * { white-space: normal; }
</style>
