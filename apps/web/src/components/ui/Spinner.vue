<script setup lang="ts">
withDefaults(defineProps<{ size?: number }>(), { size: 16 });
</script>
<template>
  <svg class="spin" :width="size" :height="size" viewBox="0 0 24 24" fill="none" role="status" aria-label="Loading">
    <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-opacity="0.25" stroke-width="3" />
    <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
  </svg>
</template>
<style scoped>
.spin { animation: r 0.8s linear infinite; flex: none; }
@keyframes r { to { transform: rotate(360deg); } }
</style>
