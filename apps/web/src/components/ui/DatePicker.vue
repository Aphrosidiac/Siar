<script setup lang="ts">
import { computed, nextTick, ref, useId, watch } from 'vue';
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';
import PopPanel from './PopPanel.vue';
import { usePopover } from '@/lib/popover';
import { pad } from '@/lib/format';

/**
 * A calendar date ('YYYY-MM-DD'), with no time and no timezone of its own. The month grid
 * starts on Monday, like the Calendar page. Click the month title to jump by month or year.
 * Keys: arrows by day/week, PgUp/PgDn by month (with Shift, by year), Home/End to the week's
 * ends, Enter to choose, Esc to close. `today` is the caller's today (e.g. in the team's timezone).
 */
const props = withDefaults(defineProps<{
  modelValue: string | null; label?: string; help?: string; error?: string | null; disabled?: boolean; id?: string;
  min?: string | null; max?: string | null; today?: string; placeholder?: string; clearable?: boolean;
}>(), { placeholder: 'Choose a date' });
const emit = defineEmits<{ 'update:modelValue': [v: string | null] }>();

const uid = useId();
const fid = computed(() => props.id ?? `dp-${uid}`);
const key = (y: number, m: number, d: number) => `${y}-${pad(m)}-${pad(d)}`;
const parse = (k: string) => k.split('-').map(Number) as [number, number, number];
const localToday = () => { const n = new Date(); return key(n.getFullYear(), n.getMonth() + 1, n.getDate()); };
const today = computed(() => props.today ?? localToday());
const out = (k: string) => (!!props.min && k < props.min) || (!!props.max && k > props.max);

const trigger = ref<HTMLButtonElement | null>(null);
const panel = ref<InstanceType<typeof PopPanel> | null>(null);
const gridEl = ref<HTMLElement | null>(null);
const { open, sheet, pos, close, show } = usePopover({ trigger, pop: computed(() => panel.value?.el), height: () => 380, minWidth: 300, maxWidth: 320 });

const view = ref<'days' | 'months' | 'years'>('days');
const cur = ref({ y: 2026, m: 1 });
const focus = ref(''); // the day the keyboard is on

const shown = computed(() => {
  if (!props.modelValue) return '';
  const [y, m, d] = parse(props.modelValue);
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(Date.UTC(y, m - 1, d));
});
const monthTitle = computed(() => new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(Date.UTC(cur.value.y, cur.value.m - 1, 1)));
const MONTHS = Array.from({ length: 12 }, (_, i) => new Intl.DateTimeFormat('en-GB', { month: 'short', timeZone: 'UTC' }).format(Date.UTC(2026, i, 1)));
const DOW = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

const cells = computed(() => {
  const first = new Date(Date.UTC(cur.value.y, cur.value.m - 1, 1));
  const lead = (first.getUTCDay() + 6) % 7;
  const start = Date.UTC(cur.value.y, cur.value.m - 1, 1 - lead);
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start + i * 86_400_000);
    const k = key(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
    return { k, day: d.getUTCDate(), inMonth: d.getUTCMonth() === cur.value.m - 1, disabled: out(k) };
  });
});
const yearsFrom = computed(() => cur.value.y - (cur.value.y % 12));
const monthOut = (y: number, m: number) => (!!props.min && key(y, m, 31) < props.min) || (!!props.max && key(y, m, 1) > props.max);
const yearOut = (y: number) => (!!props.min && `${y}-12-31` < props.min) || (!!props.max && `${y}-01-01` > props.max);
const canPrev = computed(() => !props.min || key(cur.value.y, cur.value.m, 1) > props.min);
const canNext = computed(() => !props.max || key(cur.value.y, cur.value.m, 31) < props.max);

function go(k: string) { const [y, m] = parse(k); cur.value = { y, m }; }
function shiftMonth(n: number) { const t = new Date(Date.UTC(cur.value.y, cur.value.m - 1 + n, 1)); cur.value = { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1 }; }
function addDays(k: string, n: number) { const [y, m, d] = parse(k); const t = new Date(Date.UTC(y, m - 1, d + n)); return key(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate()); }
function addMonths(k: string, n: number) {
  const [y, m, d] = parse(k); const t = new Date(Date.UTC(y, m - 1 + n, 1));
  const last = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth() + 1, 0)).getUTCDate();
  return key(t.getUTCFullYear(), t.getUTCMonth() + 1, Math.min(d, last));
}
function clampKey(k: string) { return props.min && k < props.min ? props.min : props.max && k > props.max ? props.max : k; }

async function openIt() {
  if (props.disabled || open.value) return;
  focus.value = clampKey(props.modelValue ?? today.value);
  go(focus.value); view.value = 'days';
  show(); await nextTick(); focusDay();
}
function focusDay() { void nextTick(() => gridEl.value?.querySelector<HTMLElement>(`[data-k="${focus.value}"]`)?.focus({ preventScroll: true })); }
function pick(k: string) { if (out(k)) return; emit('update:modelValue', k); close(); }
function moveFocus(k: string) { focus.value = clampKey(k); go(focus.value); focusDay(); }

function onGridKey(e: KeyboardEvent) {
  const f = focus.value; const [fy, fm, fd] = parse(f);
  const dow = (new Date(Date.UTC(fy, fm - 1, fd)).getUTCDay() + 6) % 7;
  const map: Record<string, () => string> = {
    ArrowLeft: () => addDays(f, -1), ArrowRight: () => addDays(f, 1), ArrowUp: () => addDays(f, -7), ArrowDown: () => addDays(f, 7),
    Home: () => addDays(f, -dow), End: () => addDays(f, 6 - dow),
    PageUp: () => addMonths(f, e.shiftKey ? -12 : -1), PageDown: () => addMonths(f, e.shiftKey ? 12 : 1),
  };
  if (map[e.key]) { e.preventDefault(); moveFocus(map[e.key]!()); }
  else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(f); }
  else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); }
}
function onPanelKey(e: KeyboardEvent) {
  if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); if (view.value !== 'days') view.value = 'days'; else close(); }
}
function onTriggerKey(e: KeyboardEvent) {
  if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) { e.preventDefault(); void openIt(); }
  else if ((e.key === 'Backspace' || e.key === 'Delete') && props.clearable && props.modelValue) { e.preventDefault(); emit('update:modelValue', null); }
}
function pickMonth(m: number) { cur.value = { y: cur.value.y, m }; view.value = 'days'; focus.value = clampKey(addMonths(key(cur.value.y, m, 1), 0)); focusDay(); }
function pickYear(y: number) { cur.value = { y, m: cur.value.m }; view.value = 'months'; }
watch(view, (v) => { if (v === 'days') focusDay(); });
</script>

<template>
  <div class="field">
    <label v-if="label" class="field-label" :for="fid">{{ label }}</label>
    <button
      :id="fid"
      ref="trigger"
      type="button"
      class="control ui-dp-trigger"
      :class="{ invalid: !!error, open }"
      :disabled="disabled"
      aria-haspopup="dialog"
      :aria-expanded="open"
      :aria-invalid="!!error || undefined"
      @click="open ? close() : openIt()"
      @keydown="onTriggerKey"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" class="ui-dp-ic"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></svg>
      <span v-if="shown" class="ui-dp-val">{{ shown }}</span>
      <span v-else class="ui-dp-ph">{{ placeholder }}</span>
    </button>
    <span v-if="error || help" :class="error ? 'field-error' : 'field-help'">{{ error || help }}</span>

    <PopPanel ref="panel" :open="open" :pos="pos" :sheet="sheet" :title="label ?? 'Choose a date'" @close="close()">
      <div class="ui-dp" role="dialog" :aria-label="label ?? 'Choose a date'" @keydown="onPanelKey">
        <div class="ui-dp-head">
          <button type="button" class="ui-dp-title" :aria-label="`${monthTitle}, change month or year`" @click="view = view === 'days' ? 'months' : view === 'months' ? 'years' : 'days'">
            {{ view === 'years' ? `${yearsFrom} – ${yearsFrom + 11}` : view === 'months' ? cur.y : monthTitle }}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" :class="{ flip: view !== 'days' }"><path d="m6 9 6 6 6-6" /></svg>
          </button>
          <template v-if="view === 'days'">
            <button type="button" class="ui-dp-nav" aria-label="Previous month" :disabled="!canPrev" @click="shiftMonth(-1)"><ChevronLeft :size="16" /></button>
            <button type="button" class="ui-dp-nav" aria-label="Next month" :disabled="!canNext" @click="shiftMonth(1)"><ChevronRight :size="16" /></button>
          </template>
          <template v-else-if="view === 'years'">
            <button type="button" class="ui-dp-nav" aria-label="Earlier years" @click="cur.y -= 12"><ChevronLeft :size="16" /></button>
            <button type="button" class="ui-dp-nav" aria-label="Later years" @click="cur.y += 12"><ChevronRight :size="16" /></button>
          </template>
          <template v-else>
            <button type="button" class="ui-dp-nav" aria-label="Previous year" @click="cur.y--"><ChevronLeft :size="16" /></button>
            <button type="button" class="ui-dp-nav" aria-label="Next year" @click="cur.y++"><ChevronRight :size="16" /></button>
          </template>
        </div>

        <div v-if="view === 'days'" ref="gridEl" class="ui-dp-grid" role="grid" :aria-label="monthTitle" @keydown="onGridKey">
          <span v-for="d in DOW" :key="d" class="ui-dp-dow" role="columnheader">{{ d }}</span>
          <button
            v-for="c in cells"
            :key="c.k"
            type="button"
            role="gridcell"
            class="ui-dp-day"
            :class="{ out: !c.inMonth, today: c.k === today, sel: c.k === modelValue, dis: c.disabled }"
            :data-k="c.k"
            :tabindex="c.k === focus ? 0 : -1"
            :disabled="c.disabled"
            :aria-selected="c.k === modelValue"
            :aria-current="c.k === today ? 'date' : undefined"
            :aria-label="c.k"
            @click="pick(c.k)"
            @focus="focus = c.k"
          >{{ c.day }}</button>
        </div>
        <div v-else-if="view === 'months'" class="ui-dp-tiles">
          <button v-for="(mn, i) in MONTHS" :key="mn" type="button" class="ui-dp-tile" :class="{ sel: cur.m === i + 1 }" :disabled="monthOut(cur.y, i + 1)" @click="pickMonth(i + 1)">{{ mn }}</button>
        </div>
        <div v-else class="ui-dp-tiles">
          <button v-for="i in 12" :key="i" type="button" class="ui-dp-tile" :class="{ sel: cur.y === yearsFrom + i - 1 }" :disabled="yearOut(yearsFrom + i - 1)" @click="pickYear(yearsFrom + i - 1)">{{ yearsFrom + i - 1 }}</button>
        </div>

        <div class="ui-dp-foot">
          <button type="button" class="ui-dp-link" :disabled="out(today)" @click="pick(today)">Today</button>
          <button v-if="clearable && modelValue" type="button" class="ui-dp-link" @click="emit('update:modelValue', null); close()">Clear</button>
        </div>
      </div>
    </PopPanel>
  </div>
</template>

<style scoped>
.ui-dp-trigger { display: flex; align-items: center; gap: 8px; width: 100%; text-align: left; cursor: pointer; }
.ui-dp-trigger:disabled { cursor: not-allowed; }
.ui-dp-trigger.open { border-color: var(--text); }
.ui-dp-ic { flex: none; color: var(--text-subtle); }
.ui-dp-val, .ui-dp-ph { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ui-dp-ph { color: var(--text-faint); }
</style>

<style>
.ui-dp { display: flex; flex-direction: column; gap: 8px; padding: 12px; overflow-y: auto; }
.ui-dp-head { display: flex; align-items: center; gap: 4px; }
.ui-dp-title { flex: 1; display: inline-flex; align-items: center; gap: 6px; justify-content: flex-start; border: 0; background: none; padding: 6px 8px; border-radius: var(--radius); font-weight: 600; font-size: var(--fs-14); color: var(--text); cursor: pointer; }
.ui-dp-title:hover { background: var(--bg-hover); }
.ui-dp-title svg { transition: transform 200ms var(--ease-out); color: var(--text-subtle); }
.ui-dp-title svg.flip { transform: rotate(180deg); }
.ui-dp-nav { width: 32px; height: 32px; display: grid; place-items: center; border: 0; background: none; border-radius: 50%; color: var(--text); cursor: pointer; }
.ui-dp-nav:hover:not(:disabled) { background: var(--bg-hover); }
.ui-dp-nav:disabled { opacity: .3; cursor: default; }
.ui-dp-grid { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 2px; }
.ui-dp-dow { text-align: center; font-family: var(--mono); font-size: var(--fs-11); line-height: 24px; text-transform: uppercase; letter-spacing: .04em; color: var(--text-subtle); }
.ui-dp-day { height: 36px; border: 0; background: none; border-radius: var(--radius); font-size: var(--fs-13); font-variant-numeric: tabular-nums; color: var(--text); cursor: pointer; position: relative; outline: none; }
.ui-dp-day:hover:not(:disabled) { background: var(--bg-hover); }
.ui-dp-day:focus-visible { box-shadow: inset 0 0 0 2px var(--text); }
.ui-dp-day.out { color: var(--text-faint); }
.ui-dp-day.today::after { content: ''; position: absolute; left: 50%; bottom: 5px; width: 4px; height: 4px; margin-left: -2px; border-radius: 50%; background: currentColor; }
.ui-dp-day.sel { background: var(--text); color: var(--bg); font-weight: 600; }
.ui-dp-day:disabled { color: var(--text-faint); opacity: .45; cursor: not-allowed; text-decoration: line-through; }
.ui-dp-tiles { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; padding: 4px 0; }
.ui-dp-tile { height: 44px; border: 1px solid var(--border-soft); background: none; border-radius: var(--radius); font-size: var(--fs-13); color: var(--text); cursor: pointer; }
.ui-dp-tile:hover:not(:disabled) { border-color: var(--border-strong); }
.ui-dp-tile.sel { background: var(--text); color: var(--bg); border-color: var(--text); }
.ui-dp-tile:disabled { opacity: .35; cursor: not-allowed; }
.ui-dp-foot { display: flex; justify-content: space-between; padding-top: 8px; border-top: 1px solid var(--border-soft); }
.ui-dp-link { border: 0; background: none; padding: 4px 6px; border-radius: var(--radius); font-size: var(--fs-13); font-weight: 500; color: var(--text); cursor: pointer; }
.ui-dp-link:hover:not(:disabled) { background: var(--bg-hover); }
.ui-dp-link:disabled { opacity: .4; cursor: not-allowed; }
.ui-pop.sheet .ui-dp { padding: 12px 16px 16px; }
.ui-pop.sheet .ui-dp-day { height: 44px; font-size: var(--fs-15); }
@media (pointer: coarse) { .ui-dp-day { height: 44px; } }
</style>
