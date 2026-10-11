<script setup lang="ts">
import { ref } from 'vue';
import { UploadCloud } from 'lucide-vue-next';

const props = withDefaults(defineProps<{ accept?: string; multiple?: boolean; disabled?: boolean; title?: string; hint?: string; compact?: boolean }>(), { multiple: true, title: 'Drop files here or click to browse' });
const emit = defineEmits<{ files: [files: File[]] }>();
const over = ref(false);
const input = ref<HTMLInputElement | null>(null);
let depth = 0;
function onEnter() { depth++; over.value = true; }
function onLeave() { depth--; if (depth <= 0) { over.value = false; depth = 0; } }
function pick() { if (!props.disabled) input.value?.click(); }
function onDrop(e: DragEvent) {
  over.value = false; depth = 0;
  if (props.disabled) return;
  const files = Array.from(e.dataTransfer?.files ?? []);
  if (files.length) emit('files', props.multiple ? files : files.slice(0, 1));
}
function onChange(e: Event) {
  const files = Array.from((e.target as HTMLInputElement).files ?? []);
  if (files.length) emit('files', files);
  (e.target as HTMLInputElement).value = '';
}
</script>
<template>
  <div
    class="drop"
    :class="{ over, disabled, compact }"
    role="button"
    tabindex="0"
    :aria-disabled="disabled || undefined"
    @click="pick"
    @keydown.enter.prevent="pick"
    @keydown.space.prevent="pick"
    @dragenter.prevent="onEnter"
    @dragover.prevent
    @dragleave.prevent="onLeave"
    @drop.prevent="onDrop"
  >
    <UploadCloud :size="compact ? 18 : 22" class="ic" aria-hidden="true" />
    <div class="t">{{ title }}</div>
    <div v-if="hint" class="muted small">{{ hint }}</div>
    <slot />
    <input ref="input" type="file" class="sr-only" :accept="accept" :multiple="multiple" tabindex="-1" @change="onChange" />
  </div>
</template>
<style scoped>
.drop { border: 1px dashed var(--border-strong); border-radius: var(--radius-lg); padding: 28px 16px; display: flex; flex-direction: column; align-items: center; gap: 4px; text-align: center; cursor: pointer; background: var(--bg-elevated); transition: border-color var(--t-micro), background var(--t-micro); }
.drop.compact { padding: 12px; flex-direction: row; justify-content: center; gap: 8px; }
.drop:hover, .drop.over { border-color: var(--text-subtle); background: var(--bg-hover); }
.drop.disabled { opacity: 0.5; cursor: not-allowed; }
.ic { color: var(--text-subtle); }
.t { font-weight: 500; }
</style>
