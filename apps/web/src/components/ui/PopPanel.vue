<script setup lang="ts">
import { ref } from 'vue';
import type { PopPos } from '@/lib/popover';

/** The floating panel behind every dropdown and picker: anchored on wide screens, a bottom sheet on narrow ones. */
defineProps<{ open: boolean; pos: PopPos; sheet: boolean; title?: string }>();
defineEmits<{ close: [] }>();
const el = ref<HTMLElement | null>(null);
defineExpose({ el });
</script>

<template>
  <Teleport to="body">
    <Transition name="ui-pop-scrim"><div v-if="open && sheet" class="ui-pop-scrim" aria-hidden="true" /></Transition>
    <Transition :name="sheet ? 'ui-pop-sheet' : 'ui-pop'">
      <div
        v-if="open"
        ref="el"
        class="ui-pop"
        :class="{ up: pos.up && !sheet, sheet }"
        :style="sheet ? undefined : { top: `${pos.top}px`, left: `${pos.left}px`, width: `${pos.width}px`, maxHeight: `${pos.maxH}px` }"
      >
        <div v-if="sheet" class="ui-pop-grab"><span class="ui-pop-title">{{ title }}</span><button type="button" class="ui-pop-done" @click="$emit('close')">Done</button></div>
        <slot />
      </div>
    </Transition>
  </Teleport>
</template>

<style>
.ui-pop { position: fixed; z-index: calc(var(--z-modal) + 50); display: flex; flex-direction: column; border-radius: var(--radius-lg); background: var(--bg-elevated); border: 1px solid var(--border); box-shadow: var(--shadow); overflow: hidden; }
.ui-pop.up { transform: translateY(-100%); }
.ui-pop.sheet { left: 0; right: 0; bottom: 0; top: auto; width: auto; max-height: min(78dvh, 560px); border-radius: 16px 16px 0 0; border-bottom: 0; padding-bottom: max(12px, env(safe-area-inset-bottom)); box-shadow: var(--shadow-lg); }
.ui-pop-scrim { position: fixed; inset: 0; z-index: calc(var(--z-modal) + 40); background: rgba(11, 11, 10, .4); }
.ui-pop-grab { display: flex; align-items: center; gap: 12px; padding: 12px 16px; flex: none; border-bottom: 1px solid var(--border-soft); }
.ui-pop-title { flex: 1; min-width: 0; font-weight: 600; font-size: var(--fs-15); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ui-pop-done { border: 0; background: none; padding: 6px 4px; font-weight: 600; color: var(--text); cursor: pointer; }
.ui-pop-enter-active { transition: opacity 140ms, translate 180ms var(--ease-out); }
.ui-pop-leave-active { transition: opacity 100ms; }
.ui-pop-enter-from { opacity: 0; translate: 0 -4px; }
.ui-pop.up.ui-pop-enter-from { translate: 0 4px; }
.ui-pop-leave-to { opacity: 0; }
.ui-pop-sheet-enter-active { transition: transform 320ms var(--ease-out); }
.ui-pop-sheet-leave-active { transition: transform 200ms ease-in; }
.ui-pop-sheet-enter-from, .ui-pop-sheet-leave-to { transform: translateY(100%); }
.ui-pop-scrim-enter-active, .ui-pop-scrim-leave-active { transition: opacity 200ms; }
.ui-pop-scrim-enter-from, .ui-pop-scrim-leave-to { opacity: 0; }
@media (prefers-reduced-motion: reduce) { .ui-pop-enter-active, .ui-pop-leave-active, .ui-pop-sheet-enter-active, .ui-pop-sheet-leave-active { transition: none; } }
</style>
