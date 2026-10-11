<script setup lang="ts">
import { computed } from 'vue';
import { META } from '@/lib/networks';
const props = withDefaults(defineProps<{ type: string; size?: number; title?: boolean }>(), { size: 24, title: true });
const m = computed(() => META[props.type as keyof typeof META]);
const dark = computed(() => m.value?.color === '#111111');
</script>
<template>
  <span
    class="ni"
    :class="{ dark }"
    :style="{ width: `${size}px`, height: `${size}px`, background: m?.color ?? 'var(--bg-muted)', color: m?.ink ?? 'var(--text)', fontSize: `${size >= 36 ? 14 : 12}px`, borderRadius: `${Math.max(4, Math.round(size / 4))}px` }"
    :title="title ? m?.name ?? type : undefined"
    role="img"
    :aria-label="m?.name ?? type"
  >{{ m?.mark ?? type.slice(0, 1) }}</span>
</template>
<style scoped>
.ni { display: inline-grid; place-items: center; font-weight: 700; letter-spacing: -0.02em; flex: none; line-height: 1; user-select: none; }
.ni.dark { box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.12); }
</style>
