<script setup lang="ts">
import { reactive } from 'vue';
import type { JsonSchema } from 'virtual:post-schema';
import Input from './ui/Input.vue';
import Select from './ui/Select.vue';
import Toggle from './ui/Toggle.vue';
import Textarea from './ui/Textarea.vue';
import DateTimeInput from './ui/DateTimeInput.vue';
import { humanize } from '@/lib/format';
import { timezone } from '@/lib/store';
import { kindOf } from '@/lib/schema';

/**
 * Renders form fields from a JSON schema (the contract's per-network `data` schema).
 * Scalars get real controls; nested objects/arrays of objects fall back to a JSON editor.
 */
const props = defineProps<{
  schema: Record<string, JsonSchema>;
  keys: string[];
  values: Record<string, any>;
  issues?: Record<string, string>;
  required?: string[];
  labels?: Record<string, string>;
  help?: Record<string, string>;
  multiline?: string[];
}>();
const emit = defineEmits<{ set: [key: string, value: unknown] }>();

const label = (k: string) => props.labels?.[k] ?? humanize(k);
const clean = (v: unknown) => (v === '' || v === null || v === undefined ? undefined : v);

const raw = reactive<Record<string, string>>({});
const rawErr = reactive<Record<string, string>>({});
function jsonText(k: string) { if (k in raw) return raw[k]!; const v = props.values[k]; return v === undefined ? '' : JSON.stringify(v, null, 2); }
function setJson(k: string, text: string) {
  raw[k] = text;
  if (!text.trim()) { rawErr[k] = ''; emit('set', k, undefined); return; }
  try { emit('set', k, JSON.parse(text)); rawErr[k] = ''; } catch { rawErr[k] = 'Not valid JSON yet.'; }
}
const listText = (k: string) => (Array.isArray(props.values[k]) ? (props.values[k] as string[]).join(', ') : '');
const setList = (k: string, t: string) => { const a = t.split(',').map((x) => x.trim()).filter(Boolean); emit('set', k, a.length ? a : undefined); };
const enumOpts = (s: JsonSchema) => (s.enum ?? []).filter((x) => x !== null).map((x) => ({ value: String(x), label: humanize(String(x).toLowerCase()) }));
</script>

<template>
  <div class="stack-16">
    <template v-for="k in keys" :key="k">
      <template v-if="schema[k]">
        <slot :name="`field-${k}`" :field="k" :value="values[k]" :error="issues?.[k]">
          <Select v-if="kindOf(schema[k]!) === 'enum'" :model-value="values[k] ?? null" :label="label(k)" :options="enumOpts(schema[k]!)" :placeholder="required?.includes(k) ? 'Choose…' : 'Default'" :clearable="!required?.includes(k)" :required="required?.includes(k)" :error="issues?.[k]" :help="help?.[k]" @update:model-value="emit('set', k, clean($event))" />
          <Toggle v-else-if="kindOf(schema[k]!) === 'boolean'" :model-value="!!values[k]" :label="label(k)" :help="help?.[k]" :error="issues?.[k]" @update:model-value="emit('set', k, $event ? true : undefined)" />
          <DateTimeInput v-else-if="kindOf(schema[k]!) === 'datetime'" :model-value="values[k] ?? null" :timezone="timezone" :label="label(k)" :error="issues?.[k]" @update:model-value="emit('set', k, $event ?? undefined)" />
          <Input v-else-if="kindOf(schema[k]!) === 'number'" type="number" :model-value="values[k] ?? null" :label="label(k)" :required="required?.includes(k)" :error="issues?.[k]" :help="help?.[k] ?? (schema[k]!.minimum !== undefined || schema[k]!.maximum !== undefined ? `${schema[k]!.minimum ?? ''}${schema[k]!.minimum !== undefined && schema[k]!.maximum !== undefined ? ' to ' : ''}${schema[k]!.maximum ?? ''}` : undefined)" @update:model-value="emit('set', k, $event ?? undefined)" />
          <Input v-else-if="kindOf(schema[k]!) === 'list'" :model-value="listText(k)" :label="label(k)" :error="issues?.[k]" :help="help?.[k] ?? 'Separate with commas'" @update:model-value="setList(k, $event)" />
          <Textarea v-else-if="kindOf(schema[k]!) === 'string' && multiline?.includes(k)" :model-value="values[k] ?? ''" :label="label(k)" :rows="3" :max="schema[k]!.maxLength ?? null" :required="required?.includes(k)" :error="issues?.[k]" :help="help?.[k]" @update:model-value="emit('set', k, clean($event))" />
          <Input v-else-if="kindOf(schema[k]!) === 'string'" :model-value="values[k] ?? ''" :label="label(k)" :max="schema[k]!.maxLength ?? null" :required="required?.includes(k)" :error="issues?.[k]" :help="help?.[k]" @update:model-value="emit('set', k, clean($event))" />
          <Textarea v-else :model-value="jsonText(k)" :label="`${label(k)} (JSON)`" mono :rows="3" :error="rawErr[k] || issues?.[k]" :help="help?.[k] ?? 'Structured option — edit as JSON.'" @update:model-value="setJson(k, $event)" />
        </slot>
      </template>
    </template>
  </div>
</template>
