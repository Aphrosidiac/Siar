<script setup lang="ts">
import { Check } from 'lucide-vue-next';
import Button from '@/components/ui/Button.vue';
defineProps<{ dirty: boolean; busy?: boolean; disabled?: boolean; label?: string }>();
defineEmits<{ save: []; discard: [] }>();
</script>

<template>
  <Transition name="sb">
    <div v-if="dirty" class="sb-bar" role="status">
      <span class="sb-dot" aria-hidden="true" /><span class="sb-tx">{{ label ?? 'Unsaved changes' }}</span>
      <Button size="sm" variant="ghost" class="sb-discard" :disabled="busy" @click="$emit('discard')">Discard</Button>
      <Button size="sm" variant="secondary" class="sb-save" :icon="Check" :loading="busy" :disabled="disabled" @click="$emit('save')">Save</Button>
    </div>
  </Transition>
</template>

<style scoped>
/* centred on the content column, not the window (the sidebar is fixed on the left) */
.sb-bar { position: fixed; left: calc(var(--sidebar) + (100vw - var(--sidebar)) / 2); bottom: 24px; z-index: var(--z-drawer); transform: translateX(-50%); display: flex; align-items: center; gap: 10px; width: min(520px, calc(100vw - var(--sidebar) - 32px)); padding: 8px 8px 8px 18px; border-radius: var(--radius-pill); background: var(--side-bg); color: var(--side-fg); box-shadow: var(--shadow-lg); }
.sb-dot { width: 8px; height: 8px; border-radius: 2px; background: var(--side-fg); animation: sb-pulse 1.8s var(--ease-out) infinite; }
.sb-tx { flex: 1; font-size: var(--fs-14); font-weight: 500; }
.sb-bar :deep(.sb-discard) { color: var(--side-fg); }
.sb-bar :deep(.sb-discard:hover) { background: var(--side-hover); }
.sb-bar :deep(.sb-save) { background: var(--side-fg); color: var(--side-bg); border-color: var(--side-fg); }
@keyframes sb-pulse { 50% { opacity: .35; } }
.sb-enter-active { transition: transform 520ms var(--ease-out), opacity 300ms; }
.sb-leave-active { transition: transform 240ms ease-in, opacity 200ms; }
.sb-enter-from, .sb-leave-to { transform: translate(-50%, 120%); opacity: 0; }
@media (max-width: 900px) { .sb-bar { left: 50%; width: calc(100vw - 32px); bottom: 16px; } }
@media (prefers-reduced-motion: reduce) { .sb-dot { animation: none; } }
</style>
