<script setup lang="ts">
defineProps<{ modelValue?: boolean; label?: string; disabled?: boolean; indeterminate?: boolean }>();
const emit = defineEmits<{ 'update:modelValue': [v: boolean] }>();
</script>
<template>
  <label class="cb" :class="{ disabled }">
    <input type="checkbox" :checked="modelValue" :disabled="disabled" :indeterminate="indeterminate" @change="emit('update:modelValue', ($event.target as HTMLInputElement).checked)" />
    <span v-if="label || $slots.default"><slot>{{ label }}</slot></span>
  </label>
</template>
<style scoped>
.cb { display: inline-flex; align-items: center; gap: 8px; cursor: pointer; font-size: var(--fs-14); }
.cb.disabled { opacity: 0.5; cursor: not-allowed; }
input { width: 16px; height: 16px; accent-color: var(--text); margin: 0; cursor: inherit; }
input:focus-visible { box-shadow: var(--focus); }
</style>
