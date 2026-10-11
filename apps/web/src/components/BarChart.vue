<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { compactNumber, formatNumber } from '@/lib/format';

/** Vertical SVG bars with whole-pixel geometry; labels thin out as the chart narrows. */
const props = withDefaults(defineProps<{ bars: { label: string; value: number }[]; height?: number; color?: string }>(), { height: 200, color: 'var(--chart-1)' });
const box = ref<HTMLElement | null>(null);
const width = ref(600);
let ro: ResizeObserver | null = null;
onMounted(() => { if (!box.value) return; ro = new ResizeObserver((e) => { width.value = Math.max(240, Math.floor(e[0]!.contentRect.width)); }); ro.observe(box.value); });
onBeforeUnmount(() => ro?.disconnect());
const pad = { l: 40, r: 8, t: 12, b: 28 };
const max = computed(() => { const m = Math.max(0, ...props.bars.map((b) => b.value)); if (m <= 0) return 4; const mag = 10 ** Math.floor(Math.log10(m)); return Math.ceil(m / mag) * mag; });
const iw = computed(() => width.value - pad.l - pad.r);
const ih = computed(() => props.height - pad.t - pad.b);
const slot = computed(() => iw.value / Math.max(1, props.bars.length));
const bw = computed(() => Math.max(2, Math.floor(slot.value * 0.68)));
const rects = computed(() => props.bars.map((b, i) => {
  const h = Math.round((b.value / max.value) * ih.value);
  return { ...b, x: Math.round(pad.l + i * slot.value + (slot.value - bw.value) / 2), y: pad.t + ih.value - h, h };
}));
const every = computed(() => Math.max(1, Math.ceil(props.bars.length / Math.max(1, Math.floor(iw.value / 64)))));
const ticks = computed(() => [0, 0.5, 1].map((f) => ({ v: max.value * f, y: Math.round(pad.t + ih.value - f * ih.value) + 0.5 })));
const hover = ref<number | null>(null);
</script>
<template>
  <div ref="box" class="bc">
    <svg :width="width" :height="height" role="img" aria-label="Bar chart">
      <line v-for="t in ticks" :key="t.v" class="grid" :x1="pad.l" :x2="width - pad.r" :y1="t.y" :y2="t.y" />
      <text v-for="t in ticks" :key="`l${t.v}`" class="lab" :x="pad.l - 8" :y="t.y + 4" text-anchor="end">{{ compactNumber(t.v) }}</text>
      <g v-for="(r, i) in rects" :key="r.label + i" @mouseenter="hover = i" @mouseleave="hover = null">
        <rect :x="r.x - Math.floor((slot - bw) / 2)" :y="pad.t" :width="Math.ceil(slot)" :height="ih" fill="transparent" />
        <rect :x="r.x" :y="r.y" :width="bw" :height="Math.max(r.h, r.value > 0 ? 1 : 0)" :fill="color" :fill-opacity="hover === null || hover === i ? 1 : 0.45" rx="2" />
        <text v-if="i % every === 0" class="lab" :x="r.x + bw / 2" :y="height - 8" text-anchor="middle">{{ r.label }}</text>
      </g>
    </svg>
    <div v-if="hover !== null" class="tip" :style="{ left: `${Math.min(rects[hover]!.x, width - 140)}px` }">
      <div class="tiny muted">{{ rects[hover]!.label }}</div>
      <div class="strong">{{ formatNumber(rects[hover]!.value) }}</div>
    </div>
  </div>
</template>
<style scoped>
.bc { position: relative; width: 100%; }
svg { display: block; }
.grid { stroke: var(--border); }
.lab { fill: var(--text-faint); font-size: var(--fs-12); }
.tip { position: absolute; top: 0; background: var(--bg-elevated); border: 1px solid var(--border); border-radius: var(--radius-sm); box-shadow: var(--shadow); padding: 6px 10px; pointer-events: none; }
</style>
