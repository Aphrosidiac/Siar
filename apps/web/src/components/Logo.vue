<script setup lang="ts">
/** Siar mark: a post (speech bubble) fanning out to every network, drawn in currentColor, with the lowercase wordmark. */
withDefaults(defineProps<{ size?: number; word?: boolean }>(), { size: 20, word: true });
</script>
<template>
  <span class="logo">
    <svg :width="size" :height="size" viewBox="0.05 -0.8 24 24" fill="none" aria-hidden="true">
      <path d="M5.6 7.2a4 4 0 1 1-2.4 7.2l-1.6 1.2.5-2.6a4 4 0 0 1 3.5-5.8Z" fill="currentColor"/><path transform="rotate(-38 5.6 11.2)" d="M11 10.5 20 8.7a2.5 2.5 0 0 1 0 5L11 11.9Z" fill="currentColor"/><path transform="rotate(0 5.6 11.2)" d="M11 10.5 20 8.7a2.5 2.5 0 0 1 0 5L11 11.9Z" fill="currentColor"/><path transform="rotate(38 5.6 11.2)" d="M11 10.5 20 8.7a2.5 2.5 0 0 1 0 5L11 11.9Z" fill="currentColor"/>
    </svg>
    <span v-if="word" class="w">siar</span>
  </span>
</template>
<style scoped>
.logo { display: inline-flex; align-items: center; gap: 8px; color: var(--text); }
.w { font-weight: 600; font-size: var(--fs-18); line-height: 1; letter-spacing: -0.03em; }
</style>
