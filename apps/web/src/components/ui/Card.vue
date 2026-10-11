<script setup lang="ts">
withDefaults(defineProps<{ title?: string; subtitle?: string; padded?: boolean; tone?: 'default' | 'danger' }>(), { padded: true, tone: 'default' });
</script>
<template>
  <section class="card" :class="tone">
    <header v-if="title || $slots.actions || $slots.header" class="head">
      <slot name="header">
        <div class="grow">
          <h3 class="t">{{ title }}</h3>
          <p v-if="subtitle" class="muted small">{{ subtitle }}</p>
        </div>
      </slot>
      <div v-if="$slots.actions" class="actions"><slot name="actions" /></div>
    </header>
    <div :class="{ pad: padded }"><slot /></div>
    <footer v-if="$slots.footer" class="foot"><slot name="footer" /></footer>
  </section>
</template>
<style scoped>
.card { background: var(--bg); border: 1px solid var(--border); border-radius: var(--radius); min-width: 0; }
.card.danger { border-color: color-mix(in srgb, var(--danger) 40%, var(--border)); }
.head { display: flex; align-items: flex-start; gap: 12px; padding: 16px 20px 0; flex-wrap: wrap; }
.t { font-size: var(--fs-16); line-height: 24px; }
.actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.pad { padding: 16px 20px 20px; }
.foot { padding: 12px 20px; border-top: 1px solid var(--border); background: var(--bg-subtle); border-radius: 0 0 var(--radius) var(--radius); display: flex; gap: 8px; align-items: center; justify-content: flex-end; flex-wrap: wrap; }
@media (max-width: 640px) { .head { padding: 12px 16px 0; } .pad { padding: 12px 16px 16px; } .foot { padding: 12px 16px; } }
</style>
