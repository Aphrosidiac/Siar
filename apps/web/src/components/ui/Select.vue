<script setup lang="ts">
import { computed, useId } from 'vue';

interface Option { value: string | number | null; label: string; disabled?: boolean }
defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<{
  modelValue?: string | number | null;
  options: (Option | string)[];
  label?: string;
  help?: string;
  error?: string | null;
  /** Adds an empty first option with this text (value null). */
  placeholder?: string;
  /** Keep the placeholder selectable (choosing it clears the value). */
  clearable?: boolean;
  required?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md';
  id?: string;
}>(), { size: 'md' });
const emit = defineEmits<{ 'update:modelValue': [v: any] }>();
const uid = useId();
const fid = computed(() => props.id ?? `sel-${uid}`);
const opts = computed<Option[]>(() => props.options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o)));
const current = computed(() => (props.modelValue === null || props.modelValue === undefined ? '' : String(props.modelValue)));
function onChange(e: Event) {
  const raw = (e.target as HTMLSelectElement).value;
  if (raw === '') return emit('update:modelValue', null);
  const o = opts.value.find((x) => String(x.value) === raw);
  emit('update:modelValue', o ? o.value : raw);
}
</script>

<template>
  <div class="field">
    <label v-if="label" class="field-label" :for="fid">{{ label }}<span v-if="required" class="req" aria-hidden="true">*</span></label>
    <div class="sel">
      <select
        :id="fid"
        class="control"
        :class="[{ invalid: !!error, empty: current === '' }, size === 'sm' ? 'sm' : '']"
        :value="current"
        :disabled="disabled"
        :required="required"
        :aria-invalid="!!error || undefined"
        v-bind="$attrs"
        @change="onChange"
      >
        <option v-if="placeholder !== undefined" value="" :disabled="!clearable">{{ placeholder }}</option>
        <option v-for="o in opts" :key="String(o.value)" :value="o.value === null ? '' : String(o.value)" :disabled="o.disabled">{{ o.label }}</option>
      </select>
      <svg class="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
    </div>
    <span v-if="error || help" :class="error ? 'field-error' : 'field-help'">{{ error || help }}</span>
  </div>
</template>

<style scoped>
.sel { position: relative; }
select.control { appearance: none; padding-right: 36px; cursor: pointer; }
select.empty { color: var(--text-faint); }
select option { color: var(--text); }
.chev { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); pointer-events: none; color: var(--text-subtle); }
</style>
