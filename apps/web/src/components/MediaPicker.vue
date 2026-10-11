<script setup lang="ts">
import { ref, watch } from 'vue';
import Modal from './ui/Modal.vue';
import Button from './ui/Button.vue';
import MediaBrowser from './MediaBrowser.vue';
import type { Upload } from '@/lib/types';

const props = defineProps<{ open: boolean; selected: Upload[]; max?: number }>();
const emit = defineEmits<{ close: []; confirm: [items: Upload[]] }>();
const ids = ref<string[]>([]);
const known = ref(new Map<string, Upload>());
watch(() => props.open, (o) => { if (o) { ids.value = props.selected.map((u) => u.id); known.value = new Map(props.selected.map((u) => [u.id, u])); } });
function picked(items: Upload[]) { for (const u of items) known.value.set(u.id, u); }
function confirmPick() { emit('confirm', ids.value.map((id) => known.value.get(id)).filter(Boolean) as Upload[]); }
</script>
<template>
  <Modal :open="open" title="Attach media" description="Pick from the library or upload new files." size="xl" @close="emit('close')">
    <MediaBrowser v-if="open" v-model:selected="ids" pick :max="max" @picked="picked" />
    <template #footer>
      <span class="muted small grow">{{ ids.length }} selected{{ max ? ` (max ${max})` : '' }}</span>
      <Button variant="secondary" @click="emit('close')">Cancel</Button>
      <Button variant="primary" @click="confirmPick">Attach {{ ids.length || '' }}</Button>
    </template>
  </Modal>
</template>
