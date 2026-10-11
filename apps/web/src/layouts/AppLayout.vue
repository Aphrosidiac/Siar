<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { RouterLink, RouterView, useRoute } from 'vue-router';
import { Bell, Menu } from 'lucide-vue-next';
import Drawer from '@/components/ui/Drawer.vue';
import SideNav from '@/components/SideNav.vue';
import { api } from '@/lib/api';
import { session } from '@/lib/store';
import { toast } from '@/lib/toast';

const route = useRoute();
const mobile = ref(window.innerWidth < 900);
const drawer = ref(false);
const unread = ref(0);
let timer = 0;
function measure() { mobile.value = window.innerWidth < 900; if (!mobile.value) drawer.value = false; }
async function pollUnread() {
  try { const r = await api.get<{ unread?: number }>('/notification', { limit: 1, unread: true }); unread.value = r.unread ?? 0; } catch { /* the bell is optional */ }
}
onMounted(() => { window.addEventListener('resize', measure); void pollUnread(); timer = window.setInterval(pollUnread, 60000); });
onBeforeUnmount(() => { window.removeEventListener('resize', measure); clearInterval(timer); });
watch(() => route.fullPath, () => { drawer.value = false; void pollUnread(); });

const unverified = computed(() => !!session.me && !session.me.user.emailVerifiedAt);
const resent = ref(false);
async function resend() { try { await api.post('/auth/resend-verification'); resent.value = true; toast.success('Verification email sent'); } catch (e) { toast.fail(e); } }
const trial = computed(() => { const t = session.org?.trialEndsAt; if (!t) return null; const d = Math.ceil((new Date(t).getTime() - Date.now()) / 86400000); return d > 0 ? d : null; });
</script>

<template>
  <div class="shell" :class="{ mobile }">
    <aside v-if="!mobile" class="side"><SideNav :unread="unread" /></aside>
    <div class="main">
      <header v-if="mobile" class="topbar">
        <button type="button" class="icon-btn" aria-label="Open menu" @click="drawer = true"><Menu :size="20" /></button>
        <span class="brand-name">Siar</span>
        <span class="spacer" />
        <RouterLink to="/notifications" class="icon-btn" aria-label="Notifications"><Bell :size="20" /><span v-if="unread" class="dotbadge">{{ unread > 9 ? '9+' : unread }}</span></RouterLink>
      </header>
      <div v-if="unverified" class="banner warn">
        <span>Confirm your email address to keep receiving publishing alerts.</span>
        <button type="button" class="link-btn" :disabled="resent" @click="resend">{{ resent ? 'Sent' : 'Resend email' }}</button>
      </div>
      <div v-if="trial" class="banner accent"><span>{{ trial }} day{{ trial === 1 ? '' : 's' }} left in your trial.</span><RouterLink to="/billing">Choose a plan</RouterLink></div>
      <main class="content"><RouterView v-slot="{ Component, route: r }"><component :is="Component" :key="`${session.me?.currentOrganizationId ?? 'none'}:${(r.meta.key as string) ?? r.path}`" /></RouterView></main>
      <footer class="foot">Siar by FF Dev Studio</footer>
    </div>
    <Drawer v-if="mobile" :open="drawer" side="left" :width="300" @close="drawer = false"><div class="dn"><SideNav :unread="unread" /></div></Drawer>
  </div>
</template>

<style scoped>
.shell { display: grid; grid-template-columns: 260px minmax(0, 1fr); min-height: 100vh; }
.shell.mobile { display: block; }
.side { position: sticky; top: 0; height: 100vh; border-right: 1px solid var(--border); background: var(--bg-subtle); }
.main { min-width: 0; display: flex; flex-direction: column; min-height: 100vh; }
.content { flex: 1; min-width: 0; }
.topbar { position: sticky; top: 0; z-index: 30; display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: var(--bg); border-bottom: 1px solid var(--border); }
.brand-name { font-weight: 700; font-size: var(--fs-18); }
.icon-btn { position: relative; width: 36px; height: 36px; display: grid; place-items: center; border: 0; background: none; border-radius: var(--radius); color: var(--text); cursor: pointer; }
.icon-btn:hover { background: var(--bg-hover); }
.dotbadge { position: absolute; top: 2px; right: 0; background: var(--accent); color: var(--accent-fg); border-radius: 999px; font-size: var(--fs-12); line-height: 16px; padding: 0 5px; font-weight: 600; }
.banner { display: flex; gap: 12px; align-items: center; justify-content: center; padding: 8px 16px; font-size: var(--fs-13); line-height: 18px; flex-wrap: wrap; }
.banner.warn { background: var(--warn-soft); color: var(--warn-soft-text); }
.banner.accent { background: var(--accent-soft); color: var(--accent-soft-text); }
.dn { margin: -16px -20px; height: 100dvh; background: var(--bg-subtle); }
.foot { padding: 16px 32px; font-size: var(--fs-12); line-height: 16px; color: var(--text-faint); border-top: 1px solid var(--border); }
</style>
