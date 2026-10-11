<script setup lang="ts">
import { computed, type Component } from 'vue';
import { RouterLink } from 'vue-router';
import Spinner from './Spinner.vue';

const props = withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'danger-ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
  type?: 'button' | 'submit' | 'reset';
  loading?: boolean;
  disabled?: boolean;
  icon?: Component;
  iconRight?: Component;
  block?: boolean;
  to?: string | Record<string, unknown>;
  href?: string;
  /** Icon-only button: label is required for screen readers. */
  iconOnly?: boolean;
  label?: string;
}>(), { variant: 'secondary', size: 'md', type: 'button' });

const tag = computed(() => (props.to ? RouterLink : props.href ? 'a' : 'button'));
const attrs = computed(() => {
  if (props.to) return { to: props.to };
  if (props.href) return { href: props.href, target: props.href.startsWith('http') ? '_blank' : undefined, rel: 'noopener' };
  return { type: props.type, disabled: props.disabled || props.loading };
});
</script>

<template>
  <component
    :is="tag"
    v-bind="attrs"
    class="btn"
    :class="[`btn-${variant}`, `btn-${size}`, { block, 'icon-only': iconOnly, loading }]"
    :aria-label="iconOnly ? label : undefined"
    :title="iconOnly ? label : undefined"
    :aria-busy="loading || undefined"
  >
    <Spinner v-if="loading" :size="size === 'sm' ? 14 : 16" />
    <component :is="icon" v-else-if="icon" :size="size === 'sm' ? 14 : 16" aria-hidden="true" />
    <span v-if="!iconOnly && $slots.default" class="btn-label"><slot /></span>
    <component :is="iconRight" v-if="iconRight && !iconOnly" :size="size === 'sm' ? 14 : 16" aria-hidden="true" />
  </component>
</template>

<style scoped>
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 36px; padding: 0 14px;
  border-radius: var(--radius); border: 1px solid transparent; font-size: var(--fs-14); line-height: 20px; font-weight: 500;
  cursor: pointer; white-space: nowrap; text-decoration: none; transition: background 0.12s, border-color 0.12s, color 0.12s; user-select: none; flex: none;
}
.btn:hover { text-decoration: none; }
.btn:disabled { cursor: not-allowed; opacity: 0.55; }
.btn-sm { height: 32px; padding: 0 10px; font-size: var(--fs-13); gap: 6px; }
.btn-lg { height: 40px; padding: 0 18px; }
.btn.block { width: 100%; }
.btn.icon-only { width: 36px; padding: 0; }
.btn-sm.icon-only { width: 32px; }
.btn-primary { background: var(--accent); color: var(--accent-fg); }
.btn-primary:hover:not(:disabled) { background: var(--accent-hover); }
.btn-secondary { background: var(--bg); color: var(--text); border-color: var(--border-strong); box-shadow: var(--shadow-sm); }
.btn-secondary:hover:not(:disabled) { background: var(--bg-hover); }
.btn-ghost { background: transparent; color: var(--text-muted); }
.btn-ghost:hover:not(:disabled) { background: var(--bg-hover); color: var(--text); }
.btn-danger { background: var(--danger); color: #fff; }
.btn-danger:hover:not(:disabled) { background: var(--danger-hover); }
.btn-danger-ghost { background: transparent; color: var(--danger); }
.btn-danger-ghost:hover:not(:disabled) { background: var(--danger-soft); }
.btn-link { background: none; color: var(--accent); padding: 0; height: auto; }
.btn-link:hover:not(:disabled) { text-decoration: underline; }
.btn-label { display: inline-flex; align-items: center; gap: 6px; }
</style>
