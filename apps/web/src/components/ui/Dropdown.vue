<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue';

/** Click-to-open popover. Trigger slot gets { open, toggle }; panel content closes on item click via [data-close]. */
const props = withDefaults(defineProps<{ align?: 'left' | 'right'; up?: boolean; width?: number | string }>(), { align: 'left' });
const open = ref(false);
const root = ref<HTMLElement | null>(null);
const toggle = () => { open.value = !open.value; };
const close = () => { open.value = false; };
function onDoc(e: MouseEvent) { if (root.value && !root.value.contains(e.target as Node)) close(); }
function onKey(e: KeyboardEvent) { if (e.key === 'Escape') close(); }
watch(open, (o) => {
  if (o) { document.addEventListener('mousedown', onDoc); document.addEventListener('keydown', onKey); }
  else { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); }
});
onBeforeUnmount(() => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); });
function onPanelClick(e: MouseEvent) { if ((e.target as HTMLElement).closest('[data-close]')) close(); }
defineExpose({ close });
</script>
<template>
  <div ref="root" class="dd">
    <slot name="trigger" :open="open" :toggle="toggle" />
    <div v-if="open" class="dd-panel menu" :class="[align, { up: props.up }]" :style="{ width: typeof width === 'number' ? `${width}px` : width }" role="menu" @click="onPanelClick">
      <slot :close="close" />
    </div>
  </div>
</template>
<style scoped>
.dd { position: relative; display: inline-block; min-width: 0; }
.dd-panel { position: absolute; z-index: 60; top: calc(100% + 4px); min-width: 200px; max-height: 360px; overflow: auto; }
.dd-panel.left { left: 0; }
.dd-panel.right { right: 0; }
.dd-panel.up { top: auto; bottom: calc(100% + 4px); }
</style>
