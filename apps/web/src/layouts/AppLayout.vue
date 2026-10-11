<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router';
import { Bell, Menu, Plus, Search } from 'lucide-vue-next';
import SideNav from '@/components/SideNav.vue';
import TeamSwitcher from '@/components/TeamSwitcher.vue';
import CommandPalette from '@/components/CommandPalette.vue';
import NotificationsModal from '@/components/NotificationsModal.vue';
import Button from '@/components/ui/Button.vue';
import { api } from '@/lib/api';
import { session } from '@/lib/store';
import { toast } from '@/lib/toast';

const route = useRoute();
const router = useRouter();
const bell = ref(false);
// /notifications (old links, emails) lands here with ?notifications=1 and opens the modal.
watch(() => route.query.notifications, (v) => { if (v) { bell.value = true; const { notifications: _n, ...rest } = route.query; void router.replace({ query: rest }); } }, { immediate: true });
const mobileOpen = ref(false);
const palette = ref(false);
const unread = ref(0);
let timer = 0;
async function pollUnread() {
  try { const r = await api.get<{ unread?: number }>('/notification', { limit: 1, unread: true }); unread.value = r.unread ?? 0; } catch { /* the bell is optional */ }
}
function onKey(e: KeyboardEvent) { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); palette.value = !palette.value; } }
onMounted(() => { void pollUnread(); timer = window.setInterval(pollUnread, 60000); window.addEventListener('keydown', onKey); });
onBeforeUnmount(() => { clearInterval(timer); window.removeEventListener('keydown', onKey); });
watch(() => route.fullPath, () => { mobileOpen.value = false; void pollUnread(); });

const unverified = computed(() => !!session.me && !session.me.user.emailVerifiedAt);
const resent = ref(false);
async function resend() { try { await api.post('/auth/resend-verification'); resent.value = true; toast.success('Verification email sent'); } catch (e) { toast.fail(e); } }
const trial = computed(() => { const t = session.org?.trialEndsAt; if (!t) return null; const d = Math.ceil((new Date(t).getTime() - Date.now()) / 86400000); return d > 0 ? d : null; });
</script>

<template>
  <div class="shell">
    <aside class="side" :class="{ open: mobileOpen }"><SideNav :counts="{}" @navigate="mobileOpen = false" /></aside>
    <Transition name="fade"><div v-if="mobileOpen" class="scrim" @click="mobileOpen = false" /></Transition>
    <div class="main">
      <header class="top">
        <button type="button" class="ib hamb" aria-label="Open menu" @click="mobileOpen = true"><Menu :size="20" /></button>
        <TeamSwitcher />
        <button type="button" class="search" aria-label="Search or jump to" @click="palette = true">
          <Search :size="16" /><span class="grow search-t">Search or jump to…</span><kbd class="kbd">⌘K</kbd>
        </button>
        <span class="spacer" />
        <Button variant="primary" size="sm" :icon="Plus" to="/compose" class="new">New post</Button>
        <button type="button" class="ib bell" aria-label="Notifications" @click="bell = true">
          <Bell :size="18" /><Transition name="fade"><span v-if="unread" class="bc">{{ unread > 99 ? '99+' : unread }}</span></Transition>
        </button>
      </header>
      <div v-if="unverified" class="banner warn">
        <span>Confirm your email address to keep receiving publishing alerts.</span>
        <button type="button" class="link-btn" :disabled="resent" @click="resend">{{ resent ? 'Sent' : 'Resend email' }}</button>
      </div>
      <div v-if="trial" class="banner"><span>{{ trial }} day{{ trial === 1 ? '' : 's' }} left in your trial.</span><RouterLink to="/billing">Choose a plan</RouterLink></div>
      <main class="content"><RouterView v-slot="{ Component, route: r }"><component :is="Component" :key="`${session.me?.currentOrganizationId ?? 'none'}:${(r.meta.key as string) ?? r.path}`" /></RouterView></main>
      <footer class="foot">Siar by FF Dev Studio</footer>
    </div>
    <CommandPalette v-model:open="palette" />
    <NotificationsModal :open="bell" @close="bell = false" @changed="pollUnread" />
  </div>
</template>

<style scoped>
.shell { min-height: 100vh; }
.side { position: fixed; inset: 0 auto 0 0; z-index: var(--z-side); width: var(--sidebar); border-right: 1px solid var(--side-line); transition: transform 420ms var(--ease-out); }
.main { margin-left: var(--sidebar); min-width: 0; min-height: 100vh; display: flex; flex-direction: column; overflow-x: clip; }
.content { flex: 1; min-width: 0; }
.top { position: sticky; top: 0; z-index: var(--z-top); height: var(--topbar); display: flex; align-items: center; gap: 12px; padding: 0 28px; background: var(--bg); border-bottom: 1px solid var(--border-soft); }
.search { display: flex; align-items: center; gap: 10px; width: min(380px, 34vw); height: 38px; padding: 0 8px 0 14px; border-radius: var(--radius-pill); border: 1px solid var(--border); background: var(--bg-elevated); color: var(--text-subtle); font-size: var(--fs-14); text-align: left; cursor: pointer; transition: border-color 200ms, box-shadow 300ms var(--ease-out); }
.search:hover { border-color: var(--border-strong); box-shadow: var(--shadow-sm); }
.ib { position: relative; width: 38px; height: 38px; display: grid; place-items: center; border: 0; border-radius: 50%; background: none; color: var(--text-muted); cursor: pointer; transition: background-color 200ms, color 200ms; text-decoration: none; }
.ib:hover { background: var(--bg-muted); color: var(--text); }
.hamb { display: none; }
.bc { position: absolute; top: 3px; right: 1px; min-width: 18px; height: 17px; padding: 0 5px; border-radius: 99px; display: grid; place-items: center; background: var(--text); color: var(--bg); font-family: var(--mono); font-size: var(--fs-11); box-shadow: 0 0 0 2px var(--bg); }
.banner { display: flex; gap: 12px; align-items: center; justify-content: center; padding: 8px 16px; font-size: var(--fs-13); line-height: 18px; flex-wrap: wrap; border-bottom: 1px solid var(--border-soft); color: var(--text-muted); }
.banner.warn { background: var(--warn-soft); color: var(--warn-soft-text); }
.banner a, .banner .link-btn { color: inherit; }
.scrim { position: fixed; inset: 0; z-index: var(--z-scrim); background: var(--overlay); }
.foot { padding: 16px 40px; font-size: var(--fs-12); line-height: 16px; color: var(--text-subtle); border-top: 1px solid var(--border-soft); }
@media (max-width: 900px) {
  .side { width: min(290px, 86vw); transform: translateX(-102%); }
  .side.open { transform: none; box-shadow: var(--shadow-lg); }
  .main { margin-left: 0; }
  .hamb { display: grid; }
  .top { padding: 0 12px; gap: 6px; }
  .search { width: 38px; flex: none; padding: 0; justify-content: center; border-radius: 50%; }
  .search-t, .search .kbd { display: none; }
  .foot { padding: 16px; }
}
@media (max-width: 560px) { .new :deep(.btn-label) { display: none; } .new { width: 36px; padding: 0; } }
</style>
