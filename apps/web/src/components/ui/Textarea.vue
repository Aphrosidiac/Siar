<script setup lang="ts">
import { computed, nextTick, onMounted, ref, useId, watch } from 'vue';

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<{
  modelValue?: string | null;
  label?: string;
  help?: string;
  error?: string | null;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
  max?: number | null;
  /** Character count to display (defaults to code points). */
  count?: number | null;
  autosize?: boolean;
  mono?: boolean;
  id?: string;
}>(), { rows: 4, autosize: true });
const emit = defineEmits<{ 'update:modelValue': [v: string] }>();
const uid = useId();
const fid = computed(() => props.id ?? `ta-${uid}`);
const el = ref<HTMLTextAreaElement | null>(null);
const length = computed(() => props.count ?? [...(props.modelValue ?? '')].length);
const over = computed(() => !!props.max && length.value > props.max);
function fit() {
  if (!props.autosize || !el.value) return;
  el.value.style.height = 'auto';
  el.value.style.height = `${Math.min(el.value.scrollHeight + 2, 560)}px`;
}
watch(() => props.modelValue, () => nextTick(fit));
onMounted(fit);
defineExpose({ focus: () => el.value?.focus(), el });
</script>

<template>
  <div class="field">
    <label v-if="label" class="field-label" :for="fid">{{ label }}<span v-if="required" class="req" aria-hidden="true">*</span></label>
    <textarea
      :id="fid"
      ref="el"
      class="control"
      :class="{ invalid: !!error || over, mono }"
      :rows="rows"
      :value="modelValue ?? ''"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :aria-invalid="!!error || over || undefined"
      v-bind="$attrs"
      @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />
    <div v-if="error || help || max" class="row between">
      <span :class="error ? 'field-error' : 'field-help'">{{ error || help }}</span>
      <span v-if="max" class="tiny nowrap" :class="over ? 'danger-text' : 'faint'">{{ length.toLocaleString() }} / {{ max.toLocaleString() }}</span>
    </div>
  </div>
</template>

<style scoped>
textarea.control { resize: vertical; min-height: 72px; }
.mono { font-family: var(--mono); font-size: var(--fs-13); }
</style>
