<script setup lang="ts">
/**
 * The site hero's fan, for the sign-in panel: the Siar mark (one post) curving out to the 15 network
 * marks, a pulse sweeping down the lines and each mark lighting as it lands. Same geometry as
 * apps/site/src/components/home/HeroFan.astro (side variant). Still under reduced motion.
 */
import { GLYPHS } from '@/lib/glyphs';

const ORDER = ['TIKTOK', 'YOUTUBE', 'INSTAGRAM', 'FACEBOOK', 'TWITTER', 'THREADS', 'LINKEDIN', 'PINTEREST', 'REDDIT', 'MASTODON', 'DISCORD', 'SLACK', 'BLUESKY', 'GOOGLE_BUSINESS', 'SNAPCHAT'];
const R = 225, T = 28, HUB = 30;
const rad = (d: number) => (d * Math.PI) / 180;
const span = R * Math.sin(rad(70)) + T / 2 + 6;
const W = HUB + R + T / 2 + 8, H = 2 * span;
const hub = { x: HUB, y: H / 2 };
const unit = (dx: number, dy: number) => { const l = Math.hypot(dx, dy); return [dx / l, dy / l]; };
const nodes = ORDER.map((type, i) => {
  const a = rad(-70 + (140 * i) / (ORDER.length - 1));
  const x = hub.x + R * Math.cos(a), y = hub.y + R * Math.sin(a);
  // leave the hub's rim toward the control point; land on the tile's edge aimed at its centre
  const cx = hub.x + R * 0.45, cy = hub.y + (y - hub.y) * 0.55;
  const [vx, vy] = unit(x - cx, y - cy);
  const edge = T / 2 / Math.max(Math.abs(vx), Math.abs(vy)) + 3;
  const [wx, wy] = unit(cx - hub.x, cy - hub.y);
  const d = `M${(hub.x + (HUB + 3) * wx).toFixed(1)} ${(hub.y + (HUB + 3) * wy).toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${(x - edge * vx).toFixed(1)} ${(y - edge * vy).toFixed(1)}`;
  return { type, x, y, d, i };
});
const S = 1.22;
</script>

<template>
  <svg class="fan" :viewBox="`0 0 ${W} ${H}`" role="img" aria-label="One Siar post fanning out to 15 networks">
    <g class="lines"><path v-for="n in nodes" :key="n.type" :d="n.d" /></g>
    <g class="pulses"><path v-for="n in nodes" :key="n.type" :d="n.d" pathLength="100" :style="{ '--i': n.i }" /></g>
    <g v-for="n in nodes" :key="n.type" class="tile" :style="{ '--i': n.i }" :transform="`translate(${(n.x - T / 2).toFixed(1)} ${(n.y - T / 2).toFixed(1)})`">
      <rect :width="T" :height="T" rx="7" />
      <path :transform="`translate(${(T - 15) / 2} ${(T - 15) / 2}) scale(${15 / 24})`" :d="GLYPHS[n.type]" />
    </g>
    <g class="hub">
      <circle :cx="hub.x" :cy="hub.y" :r="HUB" />
      <g :transform="`translate(${(hub.x - 12.05 * S).toFixed(1)} ${(hub.y - 11.2 * S).toFixed(1)}) scale(${S})`">
        <path d="M5.6 7.2a4 4 0 1 1-2.4 7.2l-1.6 1.2.5-2.6a4 4 0 0 1 3.5-5.8Z" /><path transform="rotate(-38 5.6 11.2)" d="M11 10.5 20 8.7a2.5 2.5 0 0 1 0 5L11 11.9Z" /><path d="M11 10.5 20 8.7a2.5 2.5 0 0 1 0 5L11 11.9Z" /><path transform="rotate(38 5.6 11.2)" d="M11 10.5 20 8.7a2.5 2.5 0 0 1 0 5L11 11.9Z" />
      </g>
    </g>
  </svg>
</template>

<style scoped>
/* drawn for an ink panel: cream lines and marks */
.fan { display: block; width: 100%; height: auto; overflow: visible; --cycle: 4.2s; --step: 70ms; --ink: #0b0b0a; --paper: #f3efe4; }
.lines path { fill: none; stroke: rgba(243, 239, 228, .2); stroke-width: 1; }
.pulses path { fill: none; stroke: var(--paper); stroke-width: 1.6; stroke-linecap: round; stroke-dasharray: 18 120; stroke-dashoffset: 18; animation: pulse var(--cycle) cubic-bezier(.65, 0, .35, 1) infinite; animation-delay: calc(var(--i) * var(--step)); }
@keyframes pulse { 0% { stroke-dashoffset: 18; opacity: 1; } 24% { stroke-dashoffset: -100; opacity: 1; } 25%, 100% { stroke-dashoffset: -100; opacity: 0; } }
.tile rect { fill: #1a1a18; stroke: rgba(243, 239, 228, .16); stroke-width: 1; animation: lit var(--cycle) linear infinite; animation-delay: calc(var(--i) * var(--step)); }
.tile path { fill: var(--paper); animation: litg var(--cycle) linear infinite; animation-delay: calc(var(--i) * var(--step)); }
@keyframes lit { 0%, 22% { fill: #1a1a18; stroke: rgba(243, 239, 228, .16); } 24%, 64% { fill: var(--paper); stroke: var(--paper); } 72%, 100% { fill: #1a1a18; stroke: rgba(243, 239, 228, .16); } }
@keyframes litg { 0%, 22% { fill: var(--paper); } 24%, 64% { fill: var(--ink); } 72%, 100% { fill: var(--paper); } }
.hub circle { fill: var(--paper); }
.hub path { fill: var(--ink); }
@media (prefers-reduced-motion: reduce) { .pulses { display: none; } .tile rect, .tile path { animation: none; } }
</style>
