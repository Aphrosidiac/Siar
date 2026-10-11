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
.card { background: var(--bg-elevated); border: 1px solid var(--border); border-radius: var(--radius-lg); min-width: 0; }
.card.danger { border-color: color-mix(in srgb, var(--danger) 35%, var(--border)); }
.head { display: flex; align-items: center; gap: 12px; padding: 14px 20px; border-bottom: 1px solid var(--border); flex-wrap: wrap; min-height: 54px; }
.t { font-size: var(--fs-15); line-height: 22px; font-weight: 600; }
.head p { margin-top: 2px; }
.actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.pad { padding: 20px; }
.foot { padding: 12px 20px; border-top: 1px solid var(--border); display: flex; gap: 8px; align-items: center; justify-content: flex-end; flex-wrap: wrap; }
@media (max-width: 640px) { .head { padding: 12px 16px; } .pad { padding: 16px; } .foot { padding: 12px 16px; } }
</style>
