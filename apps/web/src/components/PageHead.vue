<script setup lang="ts">
/** Page header: optional mono eyebrow, the title, one quiet line of context, actions on the right. */
defineProps<{ title: string; subtitle?: string; eyebrow?: string }>();
</script>
<template>
  <div class="page-head">
    <div class="titles">
      <div v-if="eyebrow" class="label eb">{{ eyebrow }}</div>
      <h1>{{ title }}</h1>
      <p v-if="subtitle">{{ subtitle }}</p>
    </div>
    <div v-if="$slots.default" class="actions"><slot /></div>
  </div>
</template>
<style scoped>
.eb { margin-bottom: 10px; }
.actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
@media (max-width: 560px) { .actions { width: 100%; } .actions > :deep(.btn) { flex: 1 1 auto; } }
</style>
