<script setup lang="ts">
import type { Component } from 'vue';

interface Tab { value: string; label: string; badge?: string | number | null; icon?: Component; tone?: 'danger' | 'warn' | null }
defineProps<{ modelValue: string; tabs: Tab[]; size?: 'sm' | 'md' }>();
const emit = defineEmits<{ 'update:modelValue': [v: string] }>();
function onKey(e: KeyboardEvent, tabs: Tab[], i: number) {
  const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
  if (!d) return;
  e.preventDefault();
  const next = tabs[(i + d + tabs.length) % tabs.length]!;
  emit('update:modelValue', next.value);
  const list = (e.currentTarget as HTMLElement).parentElement;
  (list?.children[(i + d + tabs.length) % tabs.length] as HTMLElement | undefined)?.focus();
}
</script>

<template>
  <div class="tabs" role="tablist" :class="size">
    <button
      v-for="(t, i) in tabs"
      :key="t.value"
      type="button"
      role="tab"
      class="tab"
      :class="{ active: t.value === modelValue }"
      :aria-selected="t.value === modelValue"
      :tabindex="t.value === modelValue ? 0 : -1"
      @click="emit('update:modelValue', t.value)"
      @keydown="onKey($event, tabs, i)"
    >
      <component :is="t.icon" v-if="t.icon" :size="14" aria-hidden="true" />
      <slot name="label" :tab="t">{{ t.label }}</slot>
      <span v-if="t.badge !== undefined && t.badge !== null && t.badge !== ''" class="badge" :class="t.tone">{{ t.badge }}</span>
    </button>
  </div>
</template>

<style scoped>
.tabs { display: flex; gap: 4px; border-bottom: 1px solid var(--border); overflow-x: auto; scrollbar-width: none; }
.tabs::-webkit-scrollbar { display: none; }
.tab { display: inline-flex; align-items: center; gap: 6px; padding: 8px 12px; border: 0; background: none; color: var(--text-subtle); font-weight: 500; font-size: var(--fs-14); cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -1px; white-space: nowrap; border-radius: var(--radius-sm) var(--radius-sm) 0 0; }
.sm .tab { padding: 6px 10px; font-size: var(--fs-13); }
.tab:hover { color: var(--text); }
.tab.active { color: var(--text); border-bottom-color: var(--accent); }
.badge { font-size: var(--fs-12); line-height: 16px; padding: 0 6px; border-radius: 999px; background: var(--bg-muted); color: var(--text-subtle); }
.badge.danger { background: var(--danger-soft); color: var(--danger-soft-text); }
.badge.warn { background: var(--warn-soft); color: var(--warn-soft-text); }
</style>
