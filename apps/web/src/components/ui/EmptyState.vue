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
.empty { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 48px 24px; gap: 8px; border: 1px dashed var(--border-strong); border-radius: var(--radius); background: var(--bg-subtle); }
.empty.compact { padding: 24px 16px; }
.ic { width: 40px; height: 40px; border-radius: var(--radius); display: grid; place-items: center; background: var(--bg); border: 1px solid var(--border); color: var(--text-subtle); margin-bottom: 4px; }
h3 { font-size: var(--fs-16); }
p { max-width: 440px; }
.actions { display: flex; gap: 8px; margin-top: 8px; flex-wrap: wrap; justify-content: center; }
</style>
