<script setup lang="ts">
import type { Component } from 'vue';
defineProps<{ icon?: Component; title: string; description?: string; compact?: boolean }>();
</script>
<template>
  <div class="empty" :class="{ compact }">
    <div v-if="icon" class="ic"><component :is="icon" :size="20" aria-hidden="true" /></div>
    <h3>{{ title }}</h3>
    <p v-if="description" class="muted">{{ description }}</p>
    <div v-if="$slots.default" class="actions"><slot /></div>
  </div>
</template>
<style scoped>
.empty { display: flex; flex-direction: column; align-items: flex-start; text-align: left; padding: 40px 0 32px; gap: 6px; border-top: 1px solid var(--border); }
.empty.compact { padding: 20px 0; }
.ic { color: var(--text-faint); margin-bottom: 6px; }
h3 { font-size: var(--fs-15); line-height: 22px; }
p { max-width: 520px; }
.actions { display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap; }
</style>
