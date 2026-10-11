<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue';
import { X } from 'lucide-vue-next';

const props = withDefaults(defineProps<{ open: boolean; title?: string; side?: 'left' | 'right'; width?: number }>(), { side: 'right', width: 480 });
const emit = defineEmits<{ close: [] }>();
const panel = ref<HTMLElement | null>(null);
let restore: HTMLElement | null = null;
const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && props.open) emit('close'); };
watch(() => props.open, async (o) => {
  if (o) { restore = document.activeElement as HTMLElement; document.addEventListener('keydown', onKey); await nextTick(); panel.value?.focus(); }
  else { document.removeEventListener('keydown', onKey); restore?.focus?.(); }
});
onBeforeUnmount(() => document.removeEventListener('keydown', onKey));
</script>

<template>
  <Teleport to="body">
    <Transition name="dr">
      <div v-if="open" class="overlay" @mousedown.self="emit('close')">
        <aside ref="panel" class="drawer" :class="side" :style="{ width: `min(${width}px, 100vw)` }" role="dialog" aria-modal="true" :aria-label="title" tabindex="-1">
          <header v-if="title" class="head">
            <h2 class="grow">{{ title }}</h2>
            <button type="button" class="x" aria-label="Close" @click="emit('close')"><X :size="18" /></button>
          </header>
          <div class="body"><slot /></div>
          <footer v-if="$slots.footer" class="foot"><slot name="footer" /></footer>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.overlay { position: fixed; inset: 0; background: var(--overlay); z-index: var(--z-drawer); }
.drawer { position: absolute; top: 0; bottom: 0; background: var(--bg-elevated); box-shadow: var(--shadow-lg); display: flex; flex-direction: column; outline: none; }
.drawer.right { right: 0; border-left: 1px solid var(--border); }
.drawer.left { left: 0; border-right: 1px solid var(--border); }
.head { display: flex; align-items: center; gap: 12px; padding: 16px 20px; border-bottom: 1px solid var(--border); }
.head h2 { font-size: var(--fs-16); line-height: 24px; }
.x { border: 0; background: none; color: var(--text-subtle); cursor: pointer; padding: 4px; border-radius: var(--radius-sm); }
.x:hover { background: var(--bg-hover); color: var(--text); }
.body { flex: 1; overflow-y: auto; padding: 16px 20px; min-height: 0; }
.foot { display: flex; justify-content: flex-end; gap: 8px; padding: 12px 20px; border-top: 1px solid var(--border); }
.dr-enter-active { transition: opacity 260ms var(--ease-out); }
.dr-leave-active { transition: opacity 180ms var(--ease-cut); }
.dr-enter-active .drawer { transition: transform 460ms var(--ease-out); }
.dr-leave-active .drawer { transition: transform 200ms var(--ease-cut); }
.dr-enter-from, .dr-leave-to { opacity: 0; }
.dr-enter-from .drawer.right, .dr-leave-to .drawer.right { transform: translateX(100%); }
.dr-enter-from .drawer.left, .dr-leave-to .drawer.left { transform: translateX(-100%); }
</style>
