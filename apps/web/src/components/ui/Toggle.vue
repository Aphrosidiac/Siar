<script setup lang="ts">
import { computed, useId } from 'vue';

const props = defineProps<{ modelValue?: boolean | null; label?: string; help?: string; disabled?: boolean; id?: string; error?: string | null }>();
const emit = defineEmits<{ 'update:modelValue': [v: boolean] }>();
const uid = useId();
const fid = computed(() => props.id ?? `tg-${uid}`);
</script>

<template>
  <div class="toggle-field">
    <button
      :id="fid"
      type="button"
      role="switch"
      class="switch"
      :class="{ on: !!modelValue }"
      :aria-checked="!!modelValue"
      :disabled="disabled"
      :aria-labelledby="label ? `${fid}-l` : undefined"
      @click="emit('update:modelValue', !modelValue)"
    >
      <span class="knob" />
    </button>
    <div v-if="label || help || $slots.default" class="text">
      <label :id="`${fid}-l`" class="field-label" :for="fid" @click.prevent="!disabled && emit('update:modelValue', !modelValue)">{{ label }}<slot /></label>
      <span v-if="help" class="field-help">{{ help }}</span>
      <span v-if="error" class="field-error">{{ error }}</span>
    </div>
  </div>
</template>

<style scoped>
.toggle-field { display: flex; align-items: flex-start; gap: 12px; }
.switch { position: relative; width: 34px; height: 20px; border-radius: 999px; border: 0; background: var(--border-strong); cursor: pointer; flex: none; padding: 0; transition: background 220ms var(--ease-out); margin-top: 0; }
.switch.on { background: var(--accent); }
.switch:disabled { opacity: 0.45; cursor: not-allowed; }
.knob { position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; border-radius: 50%; background: var(--bg-elevated); box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2); transition: transform 260ms var(--ease-out); }
.switch.on .knob { transform: translateX(14px); }
.text { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.text .field-label { cursor: pointer; }
</style>
