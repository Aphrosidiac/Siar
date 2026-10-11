<script setup lang="ts">
/** Siar mark: one source fanning out to many — drawn in currentColor, with the lowercase wordmark. */
withDefaults(defineProps<{ size?: number; word?: boolean }>(), { size: 20, word: true });
</script>
<template>
  <span class="logo">
    <svg :width="size" :height="size" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="4.5" cy="10" r="3" fill="currentColor" />
      <path d="M10 10h8M10 10l7.2-5.6M10 10l7.2 5.6" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    </svg>
    <span v-if="word" class="w">siar</span>
  </span>
</template>
<style scoped>
.logo { display: inline-flex; align-items: center; gap: 8px; color: var(--text); }
.w { font-weight: 600; font-size: var(--fs-18); line-height: 1; letter-spacing: -0.03em; }
</style>
