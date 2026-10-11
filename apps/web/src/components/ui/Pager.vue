<script setup lang="ts">
import { computed } from 'vue';
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';
const props = defineProps<{ total: number; limit: number; offset: number }>();
const emit = defineEmits<{ 'update:offset': [v: number] }>();
const from = computed(() => (props.total === 0 ? 0 : props.offset + 1));
const to = computed(() => Math.min(props.offset + props.limit, props.total));
</script>
<template>
  <nav v-if="total > 0" class="pager" aria-label="Pagination">
    <span class="muted small">{{ from.toLocaleString() }}–{{ to.toLocaleString() }} of {{ total.toLocaleString() }}</span>
    <div class="row gap-4">
      <button type="button" class="pb" :disabled="offset <= 0" aria-label="Previous page" @click="emit('update:offset', Math.max(0, offset - limit))"><ChevronLeft :size="16" /></button>
      <button type="button" class="pb" :disabled="offset + limit >= total" aria-label="Next page" @click="emit('update:offset', offset + limit)"><ChevronRight :size="16" /></button>
    </div>
  </nav>
</template>
<style scoped>
.pager { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 0 0; }
.pb { width: 32px; height: 32px; border: 1px solid var(--border-strong); background: var(--bg); border-radius: var(--radius); display: grid; place-items: center; cursor: pointer; color: var(--text-muted); }
.pb:hover:not(:disabled) { background: var(--bg-hover); color: var(--text); }
.pb:disabled { opacity: 0.4; cursor: not-allowed; }
</style>
