<script setup lang="ts">
withDefaults(defineProps<{ tone?: 'neutral' | 'accent' | 'success' | 'warn' | 'danger' | 'info'; dot?: boolean; size?: 'sm' | 'md' }>(), { tone: 'neutral', size: 'md' });
</script>
<template>
  <span class="badge" :class="[tone, size]"><span v-if="dot" class="d" /><slot /></span>
</template>
<style scoped>
/* Quiet status: a coloured dot and plain text on a faint chip. Colour carries meaning, never decoration. */
.badge { display: inline-flex; align-items: center; gap: 6px; height: 22px; padding: 0 8px; border-radius: var(--radius-sm); font-size: var(--fs-12); line-height: 16px; font-weight: 500; white-space: nowrap; background: var(--bg-muted); color: var(--text-muted); }
.badge.sm { height: 20px; padding: 0 6px; }
.d { width: 6px; height: 6px; border-radius: 50%; background: var(--text-faint); flex: none; }
.accent .d { background: var(--text); }
.success .d { background: var(--success); }
.warn .d { background: var(--warn); }
.danger .d { background: var(--danger); }
.info .d { background: var(--info); }
.success:not(:has(.d)) { color: var(--success-soft-text); background: var(--success-soft); }
.warn:not(:has(.d)) { color: var(--warn-soft-text); background: var(--warn-soft); }
.danger:not(:has(.d)) { color: var(--danger-soft-text); background: var(--danger-soft); }
.info:not(:has(.d)) { color: var(--info-soft-text); background: var(--info-soft); }
.danger:has(.d) { color: var(--danger-soft-text); background: var(--danger-soft); }
</style>
