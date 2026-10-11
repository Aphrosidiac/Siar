<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, useId, watch } from 'vue';
import { X } from 'lucide-vue-next';

const props = withDefaults(defineProps<{ open: boolean; title?: string; description?: string; size?: 'sm' | 'md' | 'lg' | 'xl'; dismissable?: boolean }>(), { size: 'md', dismissable: true });
const emit = defineEmits<{ close: [] }>();
const panel = ref<HTMLElement | null>(null);
const tid = `m-${useId()}`;
let restore: HTMLElement | null = null;

const focusables = () => Array.from(panel.value?.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])') ?? []);
function onKey(e: KeyboardEvent) {
  if (!props.open) return;
  if (e.key === 'Escape' && props.dismissable) { e.stopPropagation(); emit('close'); }
  if (e.key === 'Tab') {
    const f = focusables(); if (!f.length) return;
    const first = f[0]!, last = f[f.length - 1]!;
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
}
watch(() => props.open, async (o) => {
  if (o) {
    restore = document.activeElement as HTMLElement;
    document.addEventListener('keydown', onKey, true);
    document.body.style.overflow = 'hidden';
    await nextTick();
    const auto = panel.value?.querySelector<HTMLElement>('[autofocus]') ?? focusables().find((el) => !el.classList.contains('x')) ?? panel.value;
    auto?.focus();
  } else {
    document.removeEventListener('keydown', onKey, true);
    document.body.style.overflow = '';
    restore?.focus?.();
  }
}, { immediate: true });
onBeforeUnmount(() => { document.removeEventListener('keydown', onKey, true); document.body.style.overflow = ''; });
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="overlay" @mousedown.self="dismissable && emit('close')">
        <div ref="panel" class="panel" :class="size" role="dialog" aria-modal="true" :aria-labelledby="title ? tid : undefined" tabindex="-1">
          <header v-if="title || dismissable" class="head">
            <div class="grow">
              <h2 v-if="title" :id="tid">{{ title }}</h2>
              <p v-if="description" class="muted small mt-8">{{ description }}</p>
            </div>
            <button v-if="dismissable" type="button" class="x" aria-label="Close" @click="emit('close')"><X :size="18" /></button>
          </header>
          <div class="body"><slot /></div>
          <footer v-if="$slots.footer" class="foot"><slot name="footer" /></footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.overlay { position: fixed; inset: 0; background: var(--overlay); z-index: var(--z-modal); display: flex; align-items: flex-start; justify-content: center; padding: 72px 16px 16px; overflow-y: auto; }
.panel { background: var(--bg-elevated); border: 1px solid var(--border); border-radius: var(--radius-lg); box-shadow: var(--shadow-lg); width: 100%; display: flex; flex-direction: column; max-height: calc(100vh - 104px); outline: none; }
.panel.sm { max-width: 420px; } .panel.md { max-width: 560px; } .panel.lg { max-width: 760px; } .panel.xl { max-width: 1040px; }
.head { display: flex; align-items: flex-start; gap: 12px; padding: 20px 24px 0; }
.head h2 { font-size: var(--fs-18); line-height: 26px; }
.x { border: 0; background: none; color: var(--text-subtle); cursor: pointer; padding: 4px; border-radius: var(--radius-sm); margin: -2px -6px 0 0; transition: background var(--t-micro), color var(--t-micro); }
.x:hover { background: var(--bg-hover); color: var(--text); }
.body { padding: 16px 24px 24px; overflow-y: auto; min-height: 0; }
.foot { display: flex; justify-content: flex-end; gap: 8px; padding: 14px 24px; border-top: 1px solid var(--border); flex-wrap: wrap; }
.fade-enter-active { transition: opacity 260ms var(--ease-out); }
.fade-leave-active { transition: opacity 140ms var(--ease-cut); }
.fade-enter-active .panel { transition: transform 420ms var(--ease-out), opacity 300ms var(--ease-out); }
.fade-leave-active .panel { transition: transform 140ms var(--ease-cut), opacity 140ms var(--ease-cut); }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.fade-enter-from .panel { transform: translateY(14px) scale(.98); opacity: 0; }
.fade-leave-to .panel { transform: translateY(6px); opacity: 0; }
@media (max-width: 640px) {
  .overlay { padding: 0; align-items: flex-end; }
  .panel { border-radius: var(--radius-lg) var(--radius-lg) 0 0; max-height: calc(100dvh - 32px); }
  .head { padding: 16px 16px 0; } .body { padding: 12px 16px 16px; } .foot { padding: 12px 16px; }
  .fade-enter-from .panel, .fade-leave-to .panel { transform: translateY(100%); opacity: 1; }
}
</style>
