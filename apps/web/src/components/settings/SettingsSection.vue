<script setup lang="ts">
defineProps<{ title: string; description?: string; tone?: 'danger' }>();
</script>

<template>
  <section class="ss-panel" :class="tone">
    <div class="ss-head">
      <div class="ss-titles"><h2 class="ss-t">{{ title }}</h2><p v-if="description" class="ss-d">{{ description }}</p></div>
      <div v-if="$slots.actions" class="ss-actions"><slot name="actions" /></div>
    </div>
    <slot />
  </section>
</template>

<style scoped>
.ss-panel { padding: 24px; border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--bg-elevated); min-width: 0; }
.ss-panel.danger { border-color: color-mix(in srgb, var(--danger) 35%, var(--border)); }
.ss-head { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 20px; }
.ss-head:last-child { margin-bottom: 0; align-items: center; }
.ss-titles { flex: 1; min-width: 0; }
.ss-t { font-size: var(--fs-16); line-height: 24px; font-weight: 600; letter-spacing: -.01em; }
.danger .ss-t { color: var(--danger); }
.ss-d { margin-top: 2px; font-size: var(--fs-13); line-height: 20px; color: var(--text-subtle); max-width: 620px; }
.ss-actions { display: flex; gap: 8px; flex: none; }
@media (max-width: 640px) { .ss-panel { padding: 16px; } .ss-head, .ss-head:last-child { flex-direction: column; align-items: flex-start; } }
</style>
