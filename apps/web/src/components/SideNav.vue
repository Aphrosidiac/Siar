<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import {
  BarChart3, Bell, Bot, Calendar, Check, ChevronsUpDown, CreditCard, FileUp, Image, Inbox, KeyRound, Link2, LogOut, MapPin, Monitor, Moon,
  PenSquare, Plus, Send, Settings, Share2, Sun, UserCircle, Webhook, Cog,
} from 'lucide-vue-next';
import Dropdown from './ui/Dropdown.vue';
import Logo from './Logo.vue';
import Avatar from './ui/Avatar.vue';
import Button from './ui/Button.vue';
import Modal from './ui/Modal.vue';
import Input from './ui/Input.vue';
import { api } from '@/lib/api';
import { currentTeam, loadSession, loadTeams, logout, selectTeam, session, setTheme, switchOrganization, theme } from '@/lib/store';
import { toast } from '@/lib/toast';
import { fullName } from '@/lib/format';

defineProps<{ unread: number }>();
const route = useRoute();
const router = useRouter();

const groups = [
  { title: 'General', items: [
    { to: '/posts', label: 'Posts', icon: Send }, { to: '/compose', label: 'Composer', icon: PenSquare }, { to: '/calendar', label: 'Calendar', icon: Calendar },
    { to: '/social-accounts', label: 'Social accounts', icon: Share2 }, { to: '/media', label: 'Media library', icon: Image },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 }, { to: '/inbox', label: 'Inbox', icon: Inbox },
  ] },
  { title: 'Team', items: [
    { to: '/bio', label: 'Link in bio', icon: Link2 }, { to: '/google-business', label: 'Google Business', icon: MapPin },
    { to: '/bots', label: 'Bots', icon: Bot }, { to: '/team-settings', label: 'Team settings', icon: Cog },
  ] },
  { title: 'Organization', items: [
    { to: '/api-keys', label: 'API keys', icon: KeyRound }, { to: '/webhooks', label: 'Webhooks', icon: Webhook },
    { to: '/bulk', label: 'Bulk post', icon: FileUp }, { to: '/billing', label: 'Billing', icon: CreditCard }, { to: '/organization', label: 'Settings', icon: Settings },
  ] },
  { title: 'Personal', items: [
    { to: '/notifications', label: 'Notifications', icon: Bell }, { to: '/settings', label: 'Settings', icon: UserCircle },
  ] },
];
const isActive = (to: string) => route.path === to || route.path.startsWith(to + '/');

const newOrg = ref(false); const orgName = ref('');
const newTeam = ref(false); const teamName = ref('');
const busy = ref(false);
async function pickOrg(id: string) {
  if (id === session.me?.currentOrganizationId) return;
  try { await switchOrganization(id); toast.success('Switched organization'); await router.replace('/posts'); } catch (e) { toast.fail(e); }
}
async function createOrg() {
  busy.value = true;
  try {
    const m = await api.post<{ organizationId: string }>('/organization/create', { name: orgName.value.trim() });
    await switchOrganization(m.organizationId); await loadSession(true);
    newOrg.value = false; orgName.value = ''; toast.success('Organization created'); await router.replace('/posts');
  } catch (e) { toast.fail(e); } finally { busy.value = false; }
}
async function createTeam() {
  busy.value = true;
  try {
    const t = await api.post<{ id: string }>('/team/', { name: teamName.value.trim() });
    await loadTeams(); selectTeam(t.id); newTeam.value = false; teamName.value = ''; toast.success('Team created');
  } catch (e) { toast.fail(e); } finally { busy.value = false; }
}
async function signOut() { await logout(); await router.replace('/login'); }
const orgLabel = computed(() => session.org?.name ?? session.me?.memberships.find((m) => m.organizationId === session.me?.currentOrganizationId)?.organizationName ?? 'Organization');
const themes = [{ v: 'system', icon: Monitor, label: 'System' }, { v: 'light', icon: Sun, label: 'Light' }, { v: 'dark', icon: Moon, label: 'Dark' }] as const;
</script>

<template>
  <div class="sn">
    <div class="brand"><Logo /></div>

    <div class="switchers">
      <Dropdown width="100%" class="sw">
        <template #trigger="{ toggle }">
          <button type="button" class="sw-btn" aria-label="Switch organization" @click="toggle">
            <Avatar :name="orgLabel" :size="24" square /><span class="grow truncate"><span class="tiny faint d-block">Organization</span>{{ orgLabel }}</span><ChevronsUpDown :size="14" class="faint" />
          </button>
        </template>
        <div class="menu-label">Organizations</div>
        <button v-for="m in session.me?.memberships ?? []" :key="m.organizationId" type="button" class="menu-item" data-close @click="pickOrg(m.organizationId)">
          <span class="grow truncate">{{ m.organizationName ?? m.organizationId }}</span><Check v-if="m.organizationId === session.me?.currentOrganizationId" :size="14" />
        </button>
        <div class="menu-sep" />
        <button type="button" class="menu-item" data-close @click="newOrg = true"><Plus :size="14" />New organization</button>
      </Dropdown>

      <Dropdown width="100%" class="sw">
        <template #trigger="{ toggle }">
          <button type="button" class="sw-btn" aria-label="Switch team" @click="toggle">
            <Avatar :name="currentTeam?.name ?? '?'" :src="currentTeam?.avatarUrl" :size="24" /><span class="grow truncate"><span class="tiny faint d-block">Team</span>{{ currentTeam?.name ?? 'No team yet' }}</span><ChevronsUpDown :size="14" class="faint" />
          </button>
        </template>
        <div class="menu-label">Teams</div>
        <button v-for="t in session.teams" :key="t.id" type="button" class="menu-item" data-close @click="selectTeam(t.id)">
          <Avatar :name="t.name" :src="t.avatarUrl" :size="20" /><span class="grow truncate">{{ t.name }}</span><Check v-if="t.id === session.teamId" :size="14" />
        </button>
        <div class="menu-sep" />
        <button type="button" class="menu-item" data-close @click="newTeam = true"><Plus :size="14" />New team</button>
      </Dropdown>
    </div>

    <nav class="nav" aria-label="Main">
      <div v-for="g in groups" :key="g.title" class="grp">
        <div class="gt">{{ g.title }}</div>
        <RouterLink v-for="i in g.items" :key="i.to" :to="i.to" class="ni-link" :class="{ on: isActive(i.to) }">
          <component :is="i.icon" :size="16" aria-hidden="true" /><span class="grow">{{ i.label }}</span>
          <span v-if="i.to === '/notifications' && unread" class="count">{{ unread > 99 ? '99+' : unread }}</span>
        </RouterLink>
      </div>
    </nav>

    <Dropdown up width="100%" class="me">
      <template #trigger="{ toggle }">
        <button type="button" class="sw-btn" aria-label="Account menu" @click="toggle">
          <Avatar :name="fullName(session.me?.user)" :src="session.me?.user.avatarUrl" :size="28" /><span class="grow truncate">{{ fullName(session.me?.user) }}<span class="tiny faint d-block truncate">{{ session.me?.user.email }}</span></span><ChevronsUpDown :size="14" class="faint" />
        </button>
      </template>
      <div class="menu-label">Theme</div>
      <div class="row" style="padding: 4px 6px 8px">
        <button v-for="t in themes" :key="t.v" type="button" class="th" :class="{ on: theme.pref === t.v }" :aria-label="t.label" :title="t.label" @click="setTheme(t.v)"><component :is="t.icon" :size="16" /></button>
      </div>
      <div class="menu-sep" />
      <RouterLink to="/settings" class="menu-item" data-close><UserCircle :size="16" />Account settings</RouterLink>
      <button type="button" class="menu-item" @click="signOut"><LogOut :size="16" />Sign out</button>
    </Dropdown>

    <Modal :open="newOrg" title="New organization" size="sm" @close="newOrg = false">
      <form class="stack-16" @submit.prevent="createOrg">
        <Input v-model="orgName" label="Organization name" required autofocus />
        <div class="row" style="justify-content: flex-end"><Button variant="secondary" @click="newOrg = false">Cancel</Button><Button type="submit" variant="primary" :loading="busy" :disabled="!orgName.trim()">Create</Button></div>
      </form>
    </Modal>
    <Modal :open="newTeam" title="New team" description="A team groups the social accounts of one brand or client." size="sm" @close="newTeam = false">
      <form class="stack-16" @submit.prevent="createTeam">
        <Input v-model="teamName" label="Team name" required autofocus :max="80" />
        <div class="row" style="justify-content: flex-end"><Button variant="secondary" @click="newTeam = false">Cancel</Button><Button type="submit" variant="primary" :loading="busy" :disabled="!teamName.trim()">Create team</Button></div>
      </form>
    </Modal>
  </div>
</template>

<style scoped>
.sn { display: flex; flex-direction: column; height: 100%; min-height: 0; padding: 16px 12px 12px; gap: 14px; }
.brand { display: flex; align-items: center; padding: 2px 10px 6px; }
.switchers { display: flex; flex-direction: column; gap: 2px; padding-bottom: 12px; border-bottom: 1px solid var(--border); }
.sw, .me { display: block; width: 100%; }
.sw-btn { display: flex; align-items: center; gap: 10px; width: 100%; padding: 6px 8px; border: 0; border-radius: var(--radius); background: none; cursor: pointer; text-align: left; font-size: var(--fs-14); line-height: 18px; font-weight: 500; color: var(--text); transition: background var(--t-micro); }
.sw-btn:hover { background: var(--bg-hover); }
.switchers .sw-btn .tiny { font-family: var(--mono); font-size: var(--fs-11); letter-spacing: .06em; text-transform: uppercase; font-weight: 400; color: var(--text-subtle); }
.d-block { display: block; }
.nav { flex: 1; overflow-y: auto; min-height: 0; display: flex; flex-direction: column; gap: 18px; }
.gt { padding: 0 10px 6px; font-family: var(--mono); font-size: var(--fs-11); line-height: 16px; font-weight: 500; letter-spacing: .06em; text-transform: uppercase; color: var(--text-subtle); }
.ni-link { position: relative; display: flex; align-items: center; gap: 10px; padding: 6px 10px; border-radius: var(--radius); color: var(--text-subtle); font-size: var(--fs-14); line-height: 20px; text-decoration: none; transition: background var(--t-micro), color var(--t-micro); }
.ni-link:hover { background: var(--bg-hover); color: var(--text); }
.ni-link.on { background: var(--bg-elevated); color: var(--text); font-weight: 500; box-shadow: inset 0 0 0 1px var(--border); }
.ni-link.on::before { content: ''; position: absolute; left: -12px; top: 8px; bottom: 8px; width: 2px; border-radius: 0 2px 2px 0; background: var(--text); }
.count { font-family: var(--mono); font-size: var(--fs-11); line-height: 16px; padding: 0 5px; border-radius: var(--radius-sm); background: var(--text); color: var(--bg); font-variant-numeric: tabular-nums; }
.me { padding-top: 10px; border-top: 1px solid var(--border); }
.th { width: 36px; height: 30px; border: 0; background: none; color: var(--text-subtle); border-radius: var(--radius-sm); display: grid; place-items: center; cursor: pointer; margin-right: 2px; transition: background var(--t-micro), color var(--t-micro); }
.th:hover { color: var(--text); }
.th.on { background: var(--bg-muted); color: var(--text); }
</style>
