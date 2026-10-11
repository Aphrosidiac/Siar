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
  display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 40px; padding: 0 17px;
  border-radius: var(--radius-pill); border: 1px solid transparent; font-size: var(--fs-14); line-height: 20px; font-weight: 500; letter-spacing: -.005em;
  cursor: pointer; white-space: nowrap; text-decoration: none; user-select: none; flex: none;
  transition: background 240ms var(--ease-out), border-color 240ms var(--ease-out), color 240ms var(--ease-out), transform 160ms var(--ease-out);
}
.btn:hover { text-decoration: none; }
.btn:active:not(:disabled) { transform: scale(.965); }
.btn:disabled { cursor: not-allowed; opacity: 0.45; }
.btn-sm { height: 32px; padding: 0 13px; font-size: var(--fs-13); gap: 6px; }
.btn-lg { height: 48px; padding: 0 24px; font-size: var(--fs-15); }
.btn.block { width: 100%; }
.btn.icon-only { width: 40px; padding: 0; }
.btn-sm.icon-only { width: 32px; }
@media (pointer: coarse) { .btn-sm { height: 36px; } .btn-sm.icon-only { width: 36px; } }
.btn-primary { background: var(--accent); color: var(--accent-fg); }
.btn-primary:hover:not(:disabled) { background: var(--accent-hover); }
.btn-secondary { background: transparent; color: var(--text); border-color: var(--border-strong); }
.btn-secondary:hover:not(:disabled) { border-color: var(--text); background: var(--bg-muted); }
.btn-ghost { background: transparent; color: var(--text-muted); }
.btn-ghost:hover:not(:disabled) { background: var(--bg-muted); color: var(--text); }
.btn-danger { background: var(--danger-solid); color: #fff; }
.btn-danger:hover:not(:disabled) { background: var(--danger-solid-hover); }
.btn-danger-ghost { background: transparent; color: var(--danger); border-color: color-mix(in srgb, var(--danger) 40%, transparent); }
.btn-danger-ghost:hover:not(:disabled) { background: var(--danger-solid); color: #fff; border-color: var(--danger-solid); }
.btn-link { background: none; color: var(--text); padding: 0; height: auto; border-radius: 0; text-decoration: underline; text-decoration-color: var(--border-strong); text-underline-offset: 3px; }
.btn-link:hover:not(:disabled) { text-decoration-color: currentColor; }
.btn-label { display: inline-flex; align-items: center; gap: 6px; }
</style>
