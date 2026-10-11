<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { sectionOf } from '@/lib/nav';

/** Editorial page header: "/ SECTION" eyebrow, a display title, one line of context, actions bottom-right. */
const props = defineProps<{ title: string; subtitle?: string; eyebrow?: string }>();
const route = useRoute();
const eb = computed(() => props.eyebrow ?? sectionOf(route.path));
</script>
<template>
  <div class="page-head">
    <div class="titles">
      <div v-if="eb" class="label eb">{{ eb }}</div>
      <h1><span class="mask"><span>{{ title }}</span></span></h1>
      <p v-if="subtitle">{{ subtitle }}</p>
    </div>
    <div v-if="$slots.default" class="actions"><slot /></div>
  </div>
</template>
<style scoped>
.eb { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.eb::before { content: ''; width: 1.5px; height: 11px; background: var(--text); transform: skewX(-12deg); }
h1 { overflow-wrap: anywhere; }
.mask { display: inline-block; overflow: hidden; vertical-align: top; padding-bottom: .08em; margin-bottom: -.08em; }
.mask > span { display: inline-block; animation: mask-up .9s var(--ease-out) both; }
@keyframes mask-up { from { transform: translateY(105%); } to { transform: none; } }
.actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
@media (max-width: 560px) { .actions { width: 100%; } .actions > :deep(.btn) { flex: 1 1 auto; } }
</style>
