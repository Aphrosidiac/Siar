<script setup lang="ts">
import { computed, ref } from 'vue';
import { initials } from '@/lib/format';
const props = withDefaults(defineProps<{ src?: string | null; name?: string | null; size?: number; square?: boolean }>(), { size: 28 });
const failed = ref(false);
const text = computed(() => initials(props.name ?? '?'));
</script>
<template>
  <span class="av" :class="{ square }" :style="{ width: `${size}px`, height: `${size}px`, fontSize: `${size <= 24 ? 12 : size <= 36 ? 12 : 14}px` }">
    <img v-if="src && !failed" :src="src" alt="" @error="failed = true" />
    <span v-else aria-hidden="true">{{ text }}</span>
  </span>
</template>
<style scoped>
.av { display: inline-grid; place-items: center; border-radius: 50%; background: var(--bg-muted); color: var(--text-muted); font-weight: 600; overflow: hidden; flex: none; border: 1px solid var(--border); }
.av.square { border-radius: var(--radius-sm); }
img { width: 100%; height: 100%; object-fit: cover; }
</style>
