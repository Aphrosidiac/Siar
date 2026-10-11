<script setup lang="ts">
defineProps<{ title: string; subtitle?: string }>();
</script>
<template>
  <div class="page-head">
    <div class="titles"><h1>{{ title }}</h1><p v-if="subtitle">{{ subtitle }}</p></div>
    <div v-if="$slots.default" class="row wrap"><slot /></div>
  </div>
</template>
