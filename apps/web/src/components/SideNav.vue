<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { Check, ChevronsUpDown, LogOut, Monitor, Moon, Plus, Sun, UserCircle } from 'lucide-vue-next';
import Dropdown from './ui/Dropdown.vue';
import Avatar from './ui/Avatar.vue';
import Button from './ui/Button.vue';
import Modal from './ui/Modal.vue';
import Input from './ui/Input.vue';
import Logo from './Logo.vue';
import { api } from '@/lib/api';
import { NAV, NAV_FOOT, type NavItem } from '@/lib/nav';
import { loadSession, logout, session, setTheme, switchOrganization, theme } from '@/lib/store';
import { toast } from '@/lib/toast';
import { fullName } from '@/lib/format';

/** Always ink. A marker slides to the active item; the account menu at the foot holds organizations, theme and sign-out. */
const props = defineProps<{ counts: Record<string, number> }>();
const emit = defineEmits<{ navigate: [] }>();
const route = useRoute();
const router = useRouter();
const nav = ref<HTMLElement | null>(null);
const marker = ref({ y: 0, h: 0, show: false });
const isActive = (it: NavItem) => route.path === it.to || route.path.startsWith(`${it.to}/`);
function place() {
  const el = nav.value?.querySelector<HTMLElement>('a.on');
  marker.value = el ? { y: el.offsetTop, h: el.offsetHeight, show: true } : { ...marker.value, show: false };
}
watch(() => route.path, () => nextTick(place));
onMounted(() => { void nextTick(place); document.fonts?.ready.then(place); });

const newOrg = ref(false); const orgName = ref(''); const busy = ref(false);
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
async function signOut() { await logout(); await router.replace('/login'); }
const orgName_ = () => session.org?.name ?? session.me?.memberships.find((m) => m.organizationId === session.me?.currentOrganizationId)?.organizationName ?? 'Organization';
const themes = [{ v: 'light', icon: Sun, label: 'Light' }, { v: 'dark', icon: Moon, label: 'Dark' }, { v: 'system', icon: Monitor, label: 'System' }] as const;
void props;
</script>

<template>
  <div class="sn">
    <div class="brand"><RouterLink to="/posts" class="logo" aria-label="Siar — Posts" @click="emit('navigate')"><Logo :size="20" /></RouterLink></div>

    <nav ref="nav" class="nav" aria-label="Main">
      <span class="marker" :class="{ show: marker.show }" :style="{ transform: `translateY(${marker.y}px)`, height: `${marker.h}px` }" />
      <template v-for="(g, gi) in NAV" :key="gi">
        <div v-if="g.group" class="group">{{ g.group }}</div>
        <RouterLink v-for="(it, i) in g.items" :key="it.to" :to="it.to" :class="{ on: isActive(it) }" :style="{ '--i': gi * 3 + i }" @click="emit('navigate')">
          <component :is="it.icon" :size="18" :stroke-width="1.75" aria-hidden="true" /><span class="txt">{{ it.label }}</span>
          <span v-if="it.badge && counts[it.badge]" class="badge">{{ counts[it.badge] }}</span>
        </RouterLink>
      </template>
    </nav>

    <div class="foot">
      <RouterLink v-for="it in NAV_FOOT" :key="it.to" :to="it.to" :class="{ on: isActive(it) }" @click="emit('navigate')">
        <component :is="it.icon" :size="18" :stroke-width="1.75" aria-hidden="true" /><span class="txt">{{ it.label }}</span>
      </RouterLink>
      <Dropdown up width="100%" class="me-dd">
        <template #trigger="{ toggle }">
          <button type="button" class="me" aria-label="Account menu" @click="toggle">
            <Avatar :name="fullName(session.me?.user)" :src="session.me?.user.avatarUrl" :size="30" />
            <span class="who"><span class="nm">{{ fullName(session.me?.user) }}</span><span class="em">{{ orgName_() }}</span></span>
            <ChevronsUpDown :size="14" class="chev" />
          </button>
        </template>
        <div class="menu-label">Organizations</div>
        <button v-for="m in session.me?.memberships ?? []" :key="m.organizationId" type="button" class="menu-item" data-close @click="pickOrg(m.organizationId)">
          <span class="grow truncate">{{ m.organizationName ?? m.organizationId }}</span><Check v-if="m.organizationId === session.me?.currentOrganizationId" :size="14" />
        </button>
        <button type="button" class="menu-item" data-close @click="newOrg = true"><Plus :size="14" />New organization</button>
        <div class="menu-sep" />
        <div class="menu-label">Theme</div>
        <button v-for="t in themes" :key="t.v" type="button" class="menu-item" @click="setTheme(t.v)">
          <component :is="t.icon" :size="14" /><span class="grow">{{ t.label }}</span><Check v-if="theme.pref === t.v" :size="14" />
        </button>
        <div class="menu-sep" />
        <RouterLink to="/settings" class="menu-item" data-close><UserCircle :size="14" />Your account</RouterLink>
        <button type="button" class="menu-item" @click="signOut"><LogOut :size="14" />Sign out</button>
      </Dropdown>
    </div>

    <Modal :open="newOrg" title="New organization" size="sm" @close="newOrg = false">
      <form class="stack-16" @submit.prevent="createOrg">
        <Input v-model="orgName" label="Organization name" required autofocus />
        <div class="row" style="justify-content: flex-end"><Button variant="secondary" @click="newOrg = false">Cancel</Button><Button type="submit" variant="primary" :loading="busy" :disabled="!orgName.trim()">Create</Button></div>
      </form>
    </Modal>
  </div>
</template>

<style scoped>
.sn { display: flex; flex-direction: column; height: 100%; min-height: 0; background: var(--side-bg); color: var(--side-fg); }
.brand { display: flex; align-items: center; height: var(--topbar); padding: 0 22px; border-bottom: 1px solid var(--side-line); flex: none; }
.logo { color: var(--side-fg); text-decoration: none; }
.logo :deep(.logo) { color: var(--side-fg); }
.nav { position: relative; flex: 1; overflow-y: auto; overflow-x: hidden; padding: 10px 10px 24px; scrollbar-color: #2a2a27 transparent; }
.group { margin: 18px 12px 6px; font-family: var(--mono); font-size: var(--fs-11); line-height: 12px; letter-spacing: .12em; text-transform: uppercase; color: var(--side-muted); }
.nav a, .foot a { position: relative; z-index: 1; display: flex; align-items: center; gap: 12px; height: 38px; padding: 0 12px; border-radius: 8px; font-size: var(--fs-14); font-weight: 500; color: rgba(243, 239, 228, .7); text-decoration: none; white-space: nowrap; transition: color 220ms, background-color 220ms; animation: rise 600ms var(--ease-out) backwards; animation-delay: calc(var(--i, 0) * 22ms + 80ms); }
.nav a:hover, .foot a:hover { color: var(--side-fg); background: var(--side-hover); }
.nav a.on, .foot a.on { color: var(--side-fg); }
.foot a.on { background: var(--side-active); }
.txt { flex: 1; overflow: hidden; text-overflow: ellipsis; }
.marker { position: absolute; left: 10px; right: 10px; top: 0; z-index: 0; border-radius: 8px; background: var(--side-active); opacity: 0; transition: transform 520ms var(--ease-out), height 400ms var(--ease-out), opacity 200ms; pointer-events: none; }
.marker::before { content: ''; position: absolute; left: -10px; top: 10px; bottom: 10px; width: 3px; border-radius: 0 3px 3px 0; background: var(--side-fg); }
.marker.show { opacity: 1; }
.badge { min-width: 20px; height: 18px; padding: 0 6px; border-radius: 99px; display: grid; place-items: center; font-family: var(--mono); font-size: var(--fs-11); background: rgba(243, 239, 228, .12); color: var(--side-fg); }
.foot { padding: 10px; border-top: 1px solid var(--side-line); display: flex; flex-direction: column; gap: 2px; flex: none; }
.me-dd { display: block; width: 100%; }
.me { display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px 8px 6px; border: 0; background: none; color: var(--side-fg); text-align: left; cursor: pointer; border-radius: 8px; transition: background 200ms; }
.me:hover { background: var(--side-hover); }
.me :deep(.av) { background: #2a2a27; color: var(--side-fg); }
.who { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.nm { font-size: var(--fs-13); font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.em { font-size: var(--fs-12); color: var(--side-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.chev { color: var(--side-muted); flex: none; }
</style>
