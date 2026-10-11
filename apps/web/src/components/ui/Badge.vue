<script setup lang="ts">
withDefaults(defineProps<{ tone?: 'neutral' | 'accent' | 'success' | 'warn' | 'danger' | 'info'; dot?: boolean; size?: 'sm' | 'md' }>(), { tone: 'neutral', size: 'md' });
</script>
<template>
  <span class="badge" :class="[tone, size]"><span v-if="dot" class="d" /><slot /></span>
</template>
<style scoped>
/* Status chip: a soft tinted pill. Tone carries meaning; neutral is a hairline outline. */
.badge { display: inline-flex; align-items: center; gap: 6px; height: 22px; padding: 0 9px 0 9px; border-radius: var(--radius-pill); font-size: var(--fs-12); line-height: 16px; font-weight: 500; letter-spacing: .01em; white-space: nowrap; background: var(--bg-muted); color: var(--text-muted); }
.badge.sm { height: 20px; padding: 0 8px; }
.d { width: 6px; height: 6px; border-radius: 50%; background: currentColor; flex: none; }
.neutral { background: transparent; color: var(--text-subtle); box-shadow: inset 0 0 0 1px var(--border); }
.accent { background: var(--text); color: var(--bg); }
.success { background: var(--success-soft); color: var(--success-soft-text); }
.warn { background: var(--warn-soft); color: var(--warn-soft-text); }
.danger { background: var(--danger-soft); color: var(--danger-soft-text); }
.info { background: var(--info-soft); color: var(--info-soft-text); }
</style>
