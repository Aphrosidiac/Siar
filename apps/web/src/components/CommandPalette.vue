<script setup lang="ts">
import { computed, nextTick, ref, watch, type Component } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowRight, CalendarPlus, FileUp, KeyRound, PenSquare, Plug, Search, Upload, Webhook } from 'lucide-vue-next';
import { NAV, NAV_FOOT } from '@/lib/nav';

/** ⌘K: jump to any screen or start any common action. */
const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{ 'update:open': [v: boolean] }>();
const router = useRouter();
const q = ref('');
const active = ref(0);
const input = ref<HTMLInputElement | null>(null);
interface It { label: string; icon: Component; to: string; hint: string }
const ACTIONS: It[] = [
  { label: 'New post', icon: PenSquare, to: '/compose', hint: 'Create' },
  { label: 'Schedule from the calendar', icon: CalendarPlus, to: '/calendar', hint: 'Go' },
  { label: 'Connect a social account', icon: Plug, to: '/social-accounts', hint: 'Connect' },
  { label: 'Upload media', icon: Upload, to: '/media', hint: 'Upload' },
  { label: 'Create an API key', icon: KeyRound, to: '/api-keys', hint: 'Create' },
  { label: 'Add a webhook endpoint', icon: Webhook, to: '/webhooks', hint: 'Create' },
  { label: 'Import posts from CSV', icon: FileUp, to: '/bulk', hint: 'Import' },
];
const PAGES: It[] = [...NAV.flatMap((g) => g.items), ...NAV_FOOT].map((i) => ({ label: i.label, icon: i.icon, to: i.to, hint: 'Go to' }));
const groups = computed(() => {
  const t = q.value.trim().toLowerCase();
  const m = (s: string) => !t || s.toLowerCase().includes(t);
  return [{ group: 'Actions', items: ACTIONS.filter((a) => m(a.label)) }, { group: 'Go to', items: PAGES.filter((p) => m(p.label)) }].filter((g) => g.items.length);
});
const flat = computed(() => groups.value.flatMap((g) => g.items));
watch(q, () => { active.value = 0; });
watch(() => props.open, async (o) => { if (o) { q.value = ''; active.value = 0; await nextTick(); input.value?.focus(); } });
function go(it?: It) { if (!it) return; emit('update:open', false); void router.push(it.to); }
function onKey(e: KeyboardEvent) {
  if (e.key === 'ArrowDown') { e.preventDefault(); active.value = Math.min(active.value + 1, flat.value.length - 1); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); active.value = Math.max(active.value - 1, 0); }
  else if (e.key === 'Enter') { e.preventDefault(); go(flat.value[active.value]); }
  else if (e.key === 'Escape') emit('update:open', false);
}
const idx = (it: It) => flat.value.indexOf(it);
</script>
<template>
  <Teleport to="body">
    <Transition name="cp">
      <div v-if="open" class="cp-root" @mousedown.self="emit('update:open', false)">
        <div class="cp" role="dialog" aria-modal="true" aria-label="Search or jump to">
          <div class="bar"><Search :size="18" /><input ref="input" v-model="q" placeholder="Search or jump to…" aria-label="Search" @keydown="onKey" /><kbd class="kbd">esc</kbd></div>
          <div class="res">
            <template v-for="g in groups" :key="g.group">
              <div class="label gh">{{ g.group }}</div>
              <button v-for="it in g.items" :key="it.label" type="button" class="it" :class="{ act: idx(it) === active }" :style="{ '--i': idx(it) }" @mouseenter="active = idx(it)" @click="go(it)">
                <span class="ic"><component :is="it.icon" :size="15" /></span><span class="l grow">{{ it.label }}</span><span class="label hint">{{ it.hint }}</span><ArrowRight :size="14" class="go" />
              </button>
            </template>
            <div v-if="!flat.length" class="none muted">Nothing matches “{{ q }}”.</div>
          </div>
          <div class="foot label"><span>↑↓ move</span><span>↵ open</span><span>esc close</span></div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
<style scoped>
.cp-root { position: fixed; inset: 0; z-index: var(--z-palette); display: flex; justify-content: center; padding: 12vh 16px 16px; background: var(--overlay); backdrop-filter: blur(4px); }
.cp { position: relative; width: min(640px, 100%); max-height: 70vh; display: flex; flex-direction: column; border-radius: 14px; background: var(--bg-elevated); border: 1px solid var(--border); box-shadow: var(--shadow-lg); overflow: hidden; align-self: flex-start; }
.bar { display: flex; align-items: center; gap: 12px; padding: 16px 18px; border-bottom: 1px solid var(--border); color: var(--text-subtle); }
.bar input { flex: 1; min-width: 0; border: 0; background: none; outline: none; font-size: var(--fs-16); color: var(--text); }
.res { overflow-y: auto; padding: 6px 8px 10px; }
.gh { padding: 12px 10px 6px; }
.it { width: 100%; display: flex; align-items: center; gap: 12px; padding: 9px 10px; border: 0; background: none; border-radius: 8px; text-align: left; color: var(--text); cursor: pointer; animation: rise .35s var(--ease-out) backwards; animation-delay: calc(var(--i) * 12ms); transition: background-color 120ms; }
.it.act { background: var(--bg-muted); }
.ic { width: 30px; height: 30px; flex: none; display: grid; place-items: center; border-radius: 8px; border: 1px solid var(--border); color: var(--text-muted); transition: background-color 200ms, color 200ms, border-color 200ms; }
.it.act .ic { background: var(--text); color: var(--bg); border-color: var(--text); }
.l { font-size: var(--fs-14); font-weight: 500; }
.hint { color: var(--text-faint); }
.go { opacity: 0; transform: translateX(-6px); transition: opacity 150ms, transform 300ms var(--ease-out); }
.it.act .go { opacity: 1; transform: none; }
.none { padding: 24px 12px; }
.foot { display: flex; gap: 18px; padding: 10px 18px; border-top: 1px solid var(--border); background: var(--bg-subtle); }
.cp-enter-active { transition: opacity 240ms var(--ease-out); }
.cp-leave-active { transition: opacity 140ms var(--ease-cut); }
.cp-enter-active .cp { transition: transform 360ms var(--ease-out); }
.cp-enter-from, .cp-leave-to { opacity: 0; }
.cp-enter-from .cp { transform: translateY(-8px) scale(.98); }
@media (max-width: 560px) { .cp-root { padding: 10px; } }
</style>
