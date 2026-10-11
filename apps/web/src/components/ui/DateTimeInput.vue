<script setup lang="ts">
import { computed, useId } from 'vue';
import { fromZoned, pad, zonedParts } from '@/lib/format';

/** Edits an ISO-8601 UTC instant as date + time in the given IANA timezone. */
const props = defineProps<{ modelValue: string | null; timezone: string; label?: string; help?: string; error?: string | null; disabled?: boolean; min?: string | null }>();
const emit = defineEmits<{ 'update:modelValue': [v: string | null] }>();
const id = `dt-${useId()}`;
const parts = computed(() => (props.modelValue ? zonedParts(new Date(props.modelValue), props.timezone) : null));
const dateStr = computed(() => (parts.value ? `${parts.value.y}-${pad(parts.value.m)}-${pad(parts.value.d)}` : ''));
const timeStr = computed(() => (parts.value ? `${pad(parts.value.h)}:${pad(parts.value.min)}` : ''));
const minDate = computed(() => { if (!props.min) return undefined; const z = zonedParts(new Date(props.min), props.timezone); return `${z.y}-${pad(z.m)}-${pad(z.d)}`; });
function commit(date: string, time: string) {
  if (!date) return emit('update:modelValue', null);
  const [y, m, d] = date.split('-').map(Number) as [number, number, number];
  const [h, min] = (time || '09:00').split(':').map(Number) as [number, number];
  emit('update:modelValue', fromZoned(y, m, d, h, min, props.timezone).toISOString());
}
const tzLabel = computed(() => props.timezone.replace(/_/g, ' '));
</script>
<template>
  <div class="field">
    <label v-if="label" class="field-label" :for="id">{{ label }}</label>
    <div class="dt">
      <input :id="id" class="control" :class="{ invalid: !!error }" type="date" :value="dateStr" :min="minDate" :disabled="disabled" aria-label="Date" @change="commit(($event.target as HTMLInputElement).value, timeStr)" />
      <input class="control" :class="{ invalid: !!error }" type="time" :value="timeStr" :disabled="disabled" aria-label="Time" step="60" @change="commit(dateStr, ($event.target as HTMLInputElement).value)" />
    </div>
    <span :class="error ? 'field-error' : 'field-help'">{{ error || help || `Times are in ${tzLabel}` }}</span>
  </div>
</template>
<style scoped>
.dt { display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr); gap: 8px; }
</style>
