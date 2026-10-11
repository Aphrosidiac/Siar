<script setup lang="ts">
import { nextTick, onMounted, ref, watch, type Component } from 'vue';

/** Underline tabs (sections) or a pill segmented control (filters); the indicator slides to the active one. */
interface Tab { value: string; label: string; badge?: string | number | null; icon?: Component; tone?: 'danger' | 'warn' | null }
const props = withDefaults(defineProps<{ modelValue: string; tabs: Tab[]; size?: 'sm' | 'md'; variant?: 'line' | 'pill' }>(), { variant: 'line' });
const emit = defineEmits<{ 'update:modelValue': [v: string] }>();
const root = ref<HTMLElement | null>(null);
const bar = ref({ x: 0, w: 0, ready: false });
function measure() {
  const el = root.value?.querySelector<HTMLElement>('[aria-selected="true"]');
  if (el) bar.value = { x: el.offsetLeft, w: el.offsetWidth, ready: true };
  if (el && props.variant === 'pill') el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}
onMounted(() => { void nextTick(measure); document.fonts?.ready.then(measure); });
watch(() => [props.modelValue, props.tabs.map((t) => t.label + (t.badge ?? '')).join()], () => nextTick(measure));
function onKey(e: KeyboardEvent, i: number) {
  const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
  if (!d) return;
  e.preventDefault();
  const n = (i + d + props.tabs.length) % props.tabs.length;
  emit('update:modelValue', props.tabs[n]!.value);
  (root.value?.querySelectorAll<HTMLElement>('[role=tab]')[n])?.focus();
}
</script>

<template>
  <div ref="root" class="tabs" role="tablist" :class="[size, variant]">
    <button
      v-for="(t, i) in tabs"
      :key="t.value"
      type="button"
      role="tab"
      class="tab"
      :aria-selected="t.value === modelValue"
      :tabindex="t.value === modelValue ? 0 : -1"
      @click="emit('update:modelValue', t.value)"
      @keydown="onKey($event, i)"
    >
      <component :is="t.icon" v-if="t.icon" :size="14" aria-hidden="true" />
      <slot name="label" :tab="t">{{ t.label }}</slot>
      <span v-if="t.badge !== undefined && t.badge !== null && t.badge !== ''" class="c" :class="t.tone">{{ t.badge }}</span>
    </button>
    <span class="bar" :class="{ ready: bar.ready }" :style="{ transform: `translateX(${bar.x}px)`, width: `${bar.w}px` }" />
  </div>
</template>

<style scoped>
.tabs { position: relative; display: flex; gap: 22px; border-bottom: 1px solid var(--border); overflow-x: auto; scrollbar-width: none; }
.tabs::-webkit-scrollbar { display: none; }
.tab { display: inline-flex; align-items: center; gap: 6px; padding: 10px 0 11px; border: 0; background: none; color: var(--text-subtle); font-weight: 500; font-size: var(--fs-14); cursor: pointer; white-space: nowrap; transition: color var(--t-nav) var(--ease-out); }
.sm .tab { padding: 8px 0 9px; font-size: var(--fs-13); }
.sm.tabs { gap: 18px; }
.tab:hover, .tab[aria-selected='true'] { color: var(--text); }
.c { font-family: var(--mono); font-size: var(--fs-11); color: var(--text-subtle); font-variant-numeric: tabular-nums; }
.c.danger { color: var(--danger); }
.c.warn { color: var(--warn); }
.bar { position: absolute; bottom: 0; left: 0; height: 2px; background: var(--text); opacity: 0; transition: transform 480ms var(--ease-out), width 480ms var(--ease-out), opacity 200ms; pointer-events: none; }
.bar.ready { opacity: 1; }
@media (pointer: coarse) { .tab { padding: 13px 0 14px; } }
/* pill: filters — a cream track with an ink pill that slides */
.pill.tabs { display: inline-flex; gap: 2px; padding: 4px; border: 1px solid var(--border-soft); border-bottom: 1px solid var(--border-soft); border-radius: var(--radius-pill); background: var(--bg-muted); max-width: 100%; }
.pill .tab { position: relative; z-index: 1; height: 32px; padding: 0 14px; border-radius: var(--radius-pill); color: var(--text-muted); transition: color 300ms ease-in-out 80ms; }
.pill.sm .tab { height: 26px; padding: 0 11px; }
.pill .tab[aria-selected='true'] { color: var(--bg); }
.pill .tab:not([aria-selected='true']):hover { color: var(--text); }
.pill .bar { top: 4px; bottom: 4px; height: auto; border-radius: var(--radius-pill); z-index: 0; transition: transform 560ms var(--ease-out), width 560ms var(--ease-out), opacity 200ms; }
.pill .c { min-width: 18px; height: 18px; padding: 0 5px; display: inline-grid; place-items: center; border-radius: 99px; background: color-mix(in srgb, currentColor 14%, transparent); color: inherit; }
@media (pointer: coarse) { .pill .tab { height: 36px; padding: 0 14px; } }
</style>
