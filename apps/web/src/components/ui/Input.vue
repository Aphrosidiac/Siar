<script setup lang="ts">
import { computed, ref, useId } from 'vue';

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
// password fields get a show/hide toggle
const shown = ref(false);
const inputType = computed(() => (props.type === 'password' && shown.value ? 'text' : props.type));
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
    <div class="wrap" :class="{ prefixed: !!prefix, 'has-reveal': type === 'password' }">
      <span v-if="prefix" class="prefix">{{ prefix }}</span>
      <input
        :id="fid"
        class="control"
        :class="[{ invalid: !!error || over, mono }, size === 'sm' ? 'sm' : '']"
        :type="inputType"
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
      <button v-if="type === 'password'" type="button" class="reveal" :aria-label="shown ? 'Hide password' : 'Show password'" :aria-pressed="shown" @click="shown = !shown">
        <svg v-if="!shown" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></svg>
        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3l18 18" /><path d="M10.6 5.1A10.7 10.7 0 0 1 12 5c6.4 0 10 7 10 7a17.6 17.6 0 0 1-3.2 4.2M6.6 6.6A17.4 17.4 0 0 0 2 12s3.6 7 10 7a10 10 0 0 0 5.4-1.6" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></svg>
      </button>
    </div>
    <div v-if="error || help || max" class="row between">
      <span :id="`${fid}-d`" :class="error ? 'field-error' : 'field-help'">{{ error || help }}</span>
      <span v-if="max" class="tiny nowrap" :class="over ? 'danger-text' : 'faint'">{{ length }} / {{ max }}</span>
    </div>
  </div>
</template>

<style scoped>
.wrap { display: flex; position: relative; }
.has-reveal .control { padding-right: 40px; }
.reveal { position: absolute; right: 4px; top: 50%; transform: translateY(-50%); width: 32px; height: 32px; display: grid; place-items: center; border: 0; border-radius: var(--radius-sm); background: none; color: var(--text-subtle); cursor: pointer; }
.reveal:hover { color: var(--text); background: var(--bg-hover); }
.reveal:focus-visible { outline: 2px solid var(--text); outline-offset: -2px; }
.prefixed .control { border-top-left-radius: 0; border-bottom-left-radius: 0; }
.prefix { display: inline-flex; align-items: center; padding: 0 10px; border: 1px solid var(--border-strong); border-right: 0; border-radius: var(--radius) 0 0 var(--radius); background: var(--bg-muted); color: var(--text-subtle); font-size: var(--fs-13); white-space: nowrap; }
.mono { font-family: var(--mono); font-size: var(--fs-13); }
</style>
