<script setup lang="ts">
withDefaults(defineProps<{ tone?: 'neutral' | 'accent' | 'success' | 'warn' | 'danger' | 'info'; dot?: boolean; size?: 'sm' | 'md' }>(), { tone: 'neutral', size: 'md' });
</script>
<template>
  <span class="badge" :class="[tone, size]"><span v-if="dot" class="d" /><slot /></span>
</template>
<style scoped>
.badge { display: inline-flex; align-items: center; gap: 6px; height: 22px; padding: 0 8px; border-radius: 999px; font-size: var(--fs-12); line-height: 16px; font-weight: 500; white-space: nowrap; border: 1px solid transparent; }
.badge.sm { height: 20px; padding: 0 6px; }
.d { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.neutral { background: var(--bg-muted); color: var(--text-muted); border-color: var(--border); }
.accent { background: var(--accent-soft); color: var(--accent-soft-text); }
.success { background: var(--success-soft); color: var(--success-soft-text); }
.warn { background: var(--warn-soft); color: var(--warn-soft-text); }
.danger { background: var(--danger-soft); color: var(--danger-soft-text); }
.info { background: var(--info-soft); color: var(--info-soft-text); }
</style>
