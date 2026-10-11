<script setup lang="ts">
import { ref } from 'vue';
import { Check, Copy } from 'lucide-vue-next';
import { copyText } from '@/lib/format';
const props = defineProps<{ value: string; label?: string; help?: string; mono?: boolean }>();
const done = ref(false);
async function copy() { await copyText(props.value); done.value = true; setTimeout(() => (done.value = false), 1500); }
</script>
<template>
  <div class="field">
    <span v-if="label" class="field-label">{{ label }}</span>
    <div class="cf">
      <input class="control" :class="{ mono: mono !== false }" :value="value" readonly :aria-label="label ?? 'Value'" @focus="($event.target as HTMLInputElement).select()" />
      <button type="button" class="cb" :aria-label="done ? 'Copied' : 'Copy'" @click="copy"><Check v-if="done" :size="16" /><Copy v-else :size="16" /></button>
    </div>
    <span v-if="help" class="field-help">{{ help }}</span>
  </div>
</template>
<style scoped>
.cf { display: flex; }
.cf .control { border-top-right-radius: 0; border-bottom-right-radius: 0; }
.mono { font-family: var(--mono); font-size: var(--fs-13); }
.cb { width: 40px; flex: none; border: 1px solid var(--border-strong); border-left: 0; border-radius: 0 var(--radius) var(--radius) 0; background: var(--bg-subtle); color: var(--text-muted); cursor: pointer; display: grid; place-items: center; }
.cb:hover { background: var(--bg-hover); color: var(--text); }
</style>
