<script setup lang="ts">
import { computed, useId } from 'vue';

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<{
  modelValue?: string | number | null;
  label?: string;
  help?: string;
  error?: string | null;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  /** Show "n / max" under the field. */
  max?: number | null;
  count?: number | null;
  size?: 'sm' | 'md';
  mono?: boolean;
  autocomplete?: string;
  id?: string;
  prefix?: string;
}>(), { type: 'text', size: 'md' });
const emit = defineEmits<{ 'update:modelValue': [v: any] }>();
const uid = useId();
const fid = computed(() => props.id ?? `in-${uid}`);
const length = computed(() => props.count ?? String(props.modelValue ?? '').length);
const over = computed(() => !!props.max && length.value > props.max);
function onInput(e: Event) {
  const v = (e.target as HTMLInputElement).value;
  emit('update:modelValue', props.type === 'number' ? (v === '' ? null : Number(v)) : v);
}
</script>

<template>
  <div class="field">
    <label v-if="label" class="field-label" :for="fid">{{ label }}<span v-if="required" class="req" aria-hidden="true">*</span></label>
    <div class="wrap" :class="{ prefixed: !!prefix }">
      <span v-if="prefix" class="prefix">{{ prefix }}</span>
      <input
        :id="fid"
        class="control"
        :class="[{ invalid: !!error || over, mono }, size === 'sm' ? 'sm' : '']"
        :type="type"
        :value="modelValue ?? ''"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :readonly="readonly"
        :autocomplete="autocomplete"
        :aria-invalid="!!error || over || undefined"
        :aria-describedby="error || help ? `${fid}-d` : undefined"
        v-bind="$attrs"
        @input="onInput"
      />
    </div>
    <div v-if="error || help || max" class="row between">
      <span :id="`${fid}-d`" :class="error ? 'field-error' : 'field-help'">{{ error || help }}</span>
      <span v-if="max" class="tiny nowrap" :class="over ? 'danger-text' : 'faint'">{{ length }} / {{ max }}</span>
    </div>
  </div>
</template>

<style scoped>
.wrap { display: flex; }
.prefixed .control { border-top-left-radius: 0; border-bottom-left-radius: 0; }
.prefix { display: inline-flex; align-items: center; padding: 0 10px; border: 1px solid var(--border-strong); border-right: 0; border-radius: var(--radius) 0 0 var(--radius); background: var(--bg-muted); color: var(--text-subtle); font-size: var(--fs-13); white-space: nowrap; }
.mono { font-family: var(--mono); font-size: var(--fs-13); }
</style>
