<script setup lang="ts">
import { computed } from 'vue';
import { META } from '@/lib/networks';
import { GLYPHS } from '@/lib/glyphs';
/** The network's own mark, monochrome, on a quiet tile. `bare` drops the tile. */
const props = withDefaults(defineProps<{ type: string; size?: number; title?: boolean; bare?: boolean }>(), { size: 24, title: true });
const m = computed(() => META[props.type as keyof typeof META]);
const path = computed(() => GLYPHS[props.type]);
const flat = computed(() => props.bare || props.size <= 20);
const glyph = computed(() => Math.round(props.size * (flat.value ? 0.8 : 0.54)));
</script>
<template>
  <span
    class="ni"
    :class="{ bare: flat }"
    :style="{ width: `${size}px`, height: `${size}px`, borderRadius: `${Math.max(4, Math.round(size / 4.5))}px` }"
    :title="title ? m?.name ?? type : undefined"
    role="img"
    :aria-label="m?.name ?? type"
  >
    <svg v-if="path" :width="glyph" :height="glyph" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path :d="path" /></svg>
    <span v-else class="fallback">{{ (m?.name ?? type).slice(0, 1) }}</span>
  </span>
</template>
<style scoped>
.ni { display: inline-grid; place-items: center; flex: none; color: var(--text); background: var(--bg-elevated); box-shadow: inset 0 0 0 1px var(--border); }
.ni.bare { background: none; box-shadow: none; }
.fallback { font-weight: 600; font-size: var(--fs-12); }
</style>
