<script setup lang="ts">
withDefaults(defineProps<{ width?: string; height?: string; lines?: number }>(), { width: '100%', height: '14px', lines: 1 });
</script>
<template>
  <div class="stack" aria-hidden="true">
    <div v-for="i in lines" :key="i" class="skeleton" :style="{ width: i === lines && lines > 1 ? '60%' : width, height }" />
  </div>
</template>
