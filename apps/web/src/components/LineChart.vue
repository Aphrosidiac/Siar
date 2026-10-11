<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { compactNumber, formatDate, formatNumber } from '@/lib/format';

/** Hand-rolled SVG line chart: measured width, whole-pixel text, hover crosshair, keyboard readable table fallback. */
interface Series { name: string; color?: string; points: { x: string; y: number }[] }
const props = withDefaults(defineProps<{ series: Series[]; height?: number; area?: boolean }>(), { height: 220, area: true });
const box = ref<HTMLElement | null>(null);
const width = ref(600);
let ro: ResizeObserver | null = null;
onMounted(() => { if (!box.value) return; ro = new ResizeObserver((e) => { width.value = Math.max(240, Math.floor(e[0]!.contentRect.width)); }); ro.observe(box.value); });
onBeforeUnmount(() => ro?.disconnect());

const pad = { l: 44, r: 12, t: 12, b: 28 };
const palette = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)'];
const xs = computed(() => [...new Set(props.series.flatMap((s) => s.points.map((p) => p.x)))].sort());
const maxY = computed(() => { const m = Math.max(0, ...props.series.flatMap((s) => s.points.map((p) => p.y))); if (m <= 0) return 4; const mag = 10 ** Math.floor(Math.log10(m)); return Math.ceil(m / mag) * mag; });
const iw = computed(() => width.value - pad.l - pad.r);
const ih = computed(() => props.height - pad.t - pad.b);
const xAt = (i: number) => Math.round(pad.l + (xs.value.length <= 1 ? iw.value / 2 : (i / (xs.value.length - 1)) * iw.value)) + 0.5;
const yAt = (v: number) => Math.round(pad.t + ih.value - (v / maxY.value) * ih.value) + 0.5;
const ticks = computed(() => [0, 0.25, 0.5, 0.75, 1].map((f) => ({ v: maxY.value * f, y: yAt(maxY.value * f) })));
const lines = computed(() => props.series.map((s, si) => {
  const pts = xs.value.map((x, i) => { const p = s.points.find((q) => q.x === x); return p ? [xAt(i), yAt(p.y)] as const : null; }).filter(Boolean) as (readonly [number, number])[];
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ');
  const a = pts.length ? `${d} L${pts[pts.length - 1]![0]},${yAt(0)} L${pts[0]![0]},${yAt(0)} Z` : '';
  return { name: s.name, color: s.color ?? palette[si % palette.length]!, d, a, pts };
}));
const xLabels = computed(() => {
  const n = xs.value.length; if (!n) return [];
  const want = Math.max(2, Math.min(6, Math.floor(iw.value / 110)));
  const step = Math.max(1, Math.round((n - 1) / (want - 1)));
  const idx = new Set<number>(); for (let i = 0; i < n; i += step) idx.add(i); idx.add(n - 1);
  return [...idx].map((i) => ({ x: xAt(i), label: formatDate(xs.value[i]!).replace(/ \d{4}$/, '') }));
});
const hover = ref<number | null>(null);
function onMove(e: MouseEvent) {
  const r = (e.currentTarget as SVGElement).getBoundingClientRect();
  const x = e.clientX - r.left;
  if (!xs.value.length) return;
  const i = Math.round(((x - pad.l) / Math.max(1, iw.value)) * (xs.value.length - 1));
  hover.value = Math.max(0, Math.min(xs.value.length - 1, i));
}
const tip = computed(() => {
  if (hover.value === null) return null;
  const x = xs.value[hover.value]!;
  return { x: xAt(hover.value), date: formatDate(x), rows: props.series.map((s, si) => ({ name: s.name, color: s.color ?? palette[si % palette.length]!, v: s.points.find((p) => p.x === x)?.y })) };
});
</script>

<template>
  <div ref="box" class="lc">
    <div v-if="series.length > 1" class="legend">
      <span v-for="l in lines" :key="l.name" class="row gap-4 small"><span class="dot" :style="{ background: l.color }" />{{ l.name }}</span>
    </div>
    <svg :width="width" :height="height" role="img" :aria-label="`Chart: ${series.map((s) => s.name).join(', ')}`" @mousemove="onMove" @mouseleave="hover = null">
      <g class="grid">
        <line v-for="t in ticks" :key="t.v" :x1="pad.l" :x2="width - pad.r" :y1="t.y" :y2="t.y" />
      </g>
      <g class="ylab">
        <text v-for="t in ticks" :key="t.v" :x="pad.l - 8" :y="t.y + 4" text-anchor="end">{{ compactNumber(t.v) }}</text>
      </g>
      <g class="xlab">
        <text v-for="l in xLabels" :key="l.x" :x="l.x" :y="height - 8" text-anchor="middle">{{ l.label }}</text>
      </g>
      <g v-for="l in lines" :key="l.name">
        <path v-if="area && series.length === 1" :d="l.a" :fill="l.color" fill-opacity="0.08" />
        <path :d="l.d" fill="none" :stroke="l.color" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />
        <circle v-if="l.pts.length === 1" :cx="l.pts[0]![0]" :cy="l.pts[0]![1]" r="3" :fill="l.color" />
      </g>
      <g v-if="tip">
        <line class="cross" :x1="tip.x" :x2="tip.x" :y1="pad.t" :y2="height - pad.b" />
      </g>
    </svg>
    <div v-if="tip" class="tip" :style="{ left: `${Math.min(tip.x + 12, width - 170)}px` }">
      <div class="tiny muted">{{ tip.date }}</div>
      <div v-for="r in tip.rows" :key="r.name" class="row small"><span class="dot" :style="{ background: r.color }" /><span class="grow">{{ r.name }}</span><span class="strong">{{ r.v === undefined ? '—' : formatNumber(r.v) }}</span></div>
    </div>
  </div>
</template>

<style scoped>
.lc { position: relative; width: 100%; }
svg { display: block; overflow: visible; }
.grid line { stroke: var(--border); stroke-width: 1; }
.ylab text, .xlab text { fill: var(--text-faint); font-size: var(--fs-12); }
.cross { stroke: var(--border-strong); stroke-dasharray: 3 3; }
.legend { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 8px; color: var(--text-muted); }
.tip { position: absolute; top: 8px; min-width: 150px; background: var(--bg-elevated); border: 1px solid var(--border); border-radius: var(--radius-sm); box-shadow: var(--shadow); padding: 8px 10px; pointer-events: none; display: flex; flex-direction: column; gap: 2px; }
</style>
