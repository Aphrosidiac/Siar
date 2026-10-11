<script setup lang="ts">
import { computed, useId } from 'vue';
import DatePicker from './DatePicker.vue';
import TimePicker from './TimePicker.vue';
import { dayKey, fromZoned, pad, zonedParts } from '@/lib/format';

/** Edits an ISO-8601 UTC instant as a date and a time in the given IANA timezone. */
const props = defineProps<{ modelValue: string | null; timezone: string; label?: string; help?: string; error?: string | null; disabled?: boolean; min?: string | null }>();
const emit = defineEmits<{ 'update:modelValue': [v: string | null] }>();
const id = `dt-${useId()}`;
const parts = computed(() => (props.modelValue ? zonedParts(new Date(props.modelValue), props.timezone) : null));
const dateStr = computed(() => (parts.value ? `${parts.value.y}-${pad(parts.value.m)}-${pad(parts.value.d)}` : null));
const timeStr = computed(() => (parts.value ? `${pad(parts.value.h)}:${pad(parts.value.min)}` : null));
const today = computed(() => dayKey(new Date(), props.timezone));
const minParts = computed(() => (props.min ? zonedParts(new Date(props.min), props.timezone) : null));
const minDate = computed(() => (minParts.value ? `${minParts.value.y}-${pad(minParts.value.m)}-${pad(minParts.value.d)}` : null));
/** On the earliest allowed day, times before the minimum are unavailable (rounded up to the minute). */
const minTime = computed(() => {
  const z = minParts.value; if (!z || dateStr.value !== minDate.value) return null;
  const up = z.s > 0 ? z.min + 1 : z.min;
  return up >= 60 ? `${pad(Math.min(23, z.h + 1))}:00` : `${pad(z.h)}:${pad(up)}`;
});
function commit(date: string | null, time: string | null) {
  if (!date) return emit('update:modelValue', null);
  const [y, m, d] = date.split('-').map(Number) as [number, number, number];
  let t = time || '09:00';
  if (minDate.value === date && minTime.value === null && minParts.value) {
    // switching onto the earliest day: keep the time valid
    const z = minParts.value; const floor = `${pad(z.h)}:${pad(z.min)}`;
    if (t < floor) t = floor;
  }
  const [h, min] = t.split(':').map(Number) as [number, number];
  emit('update:modelValue', fromZoned(y, m, d, h, min, props.timezone).toISOString());
}
const tzLabel = computed(() => props.timezone.replace(/_/g, ' '));
</script>
<template>
  <div class="field">
    <label v-if="label" class="field-label" :for="id">{{ label }}</label>
    <div class="dt">
      <DatePicker :id="id" :model-value="dateStr" :min="minDate" :today="today" :disabled="disabled" :error="error ? ' ' : null" :label="undefined" @update:model-value="commit($event, timeStr)" />
      <TimePicker :model-value="timeStr" :min="minTime" :disabled="disabled || !dateStr" :error="error ? ' ' : null" @update:model-value="commit(dateStr, $event)" />
    </div>
    <span :class="error ? 'field-error' : 'field-help'">{{ error || help || `Times are in ${tzLabel}` }}</span>
  </div>
</template>
<style scoped>
.dt { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr); gap: 8px; }
.dt :deep(.field-error), .dt :deep(.field-help) { display: none; }
@media (max-width: 360px) { .dt { grid-template-columns: minmax(0, 1fr); } }
</style>
