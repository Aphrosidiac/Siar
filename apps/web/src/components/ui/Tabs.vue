<script setup lang="ts">
import { nextTick, onMounted, ref, watch, type Component } from 'vue';

/** Underline tabs; an ink rule slides to the active tab. */
interface Tab { value: string; label: string; badge?: string | number | null; icon?: Component; tone?: 'danger' | 'warn' | null }
const props = defineProps<{ modelValue: string; tabs: Tab[]; size?: 'sm' | 'md' }>();
const emit = defineEmits<{ 'update:modelValue': [v: string] }>();
const root = ref<HTMLElement | null>(null);
const bar = ref({ x: 0, w: 0, ready: false });
function measure() {
  const el = root.value?.querySelector<HTMLElement>('[aria-selected="true"]');
  if (el) bar.value = { x: el.offsetLeft, w: el.offsetWidth, ready: true };
}
onMounted(() => { void nextTick(measure); document.fonts?.ready.then(measure); });
watch(() => [props.modelValue, props.tabs.map((t) => t.label + (t.badge ?? '')).join()], () => nextTick(measure));
function onKey(e: KeyboardEvent, i: number) {
  const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
  if (!d) return;
  e.preventDefault();
  const n = (i + d + props.tabs.length) % props.tabs.length;
  emit('update:modelValue', props.tabs[n]!.value);
  (root.value?.children[n] as HTMLElement | undefined)?.focus();
}
</script>

<template>
  <div ref="root" class="tabs" role="tablist" :class="size">
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
</style>
