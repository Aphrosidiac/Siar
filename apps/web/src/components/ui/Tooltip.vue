<script setup lang="ts">
import { useId } from 'vue';
withDefaults(defineProps<{ text: string; side?: 'top' | 'bottom' }>(), { side: 'top' });
const id = `tt-${useId()}`;
</script>
<template>
  <span class="tt" :aria-describedby="id">
    <slot />
    <span :id="id" role="tooltip" class="bubble" :class="side">{{ text }}</span>
  </span>
</template>
<style scoped>
.tt { position: relative; display: inline-flex; }
.bubble { position: absolute; left: 50%; transform: translateX(-50%); background: var(--text); color: var(--bg); font-size: var(--fs-12); line-height: 16px; padding: 4px 8px; border-radius: var(--radius-sm); white-space: nowrap; pointer-events: none; opacity: 0; transition: opacity 0.1s; z-index: 30; max-width: 280px; white-space: normal; width: max-content; }
.bubble.top { bottom: calc(100% + 6px); }
.bubble.bottom { top: calc(100% + 6px); }
.tt:hover .bubble, .tt:focus-within .bubble { opacity: 1; }
</style>
