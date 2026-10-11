<script setup lang="ts">
import { computed, nextTick, ref, useId, watch } from 'vue';
import PopPanel from './PopPanel.vue';
import { usePopover } from '@/lib/popover';
import { pad } from '@/lib/format';

/**
 * A wall-clock time ('HH:MM', 24-hour like the rest of Siar), edited the way a native time field
 * is: the hour and minute are segments you type into (two digits move on to the minutes) or step
 * with ↑ ↓; the clock button (or a tap on touch screens) opens hour and minute columns.
 * `min`/`max` grey out times outside the range (e.g. earlier than now on today's date).
 */
const props = withDefaults(defineProps<{
  modelValue: string | null; label?: string; help?: string; error?: string | null; disabled?: boolean; id?: string;
  min?: string | null; max?: string | null;
}>(), {});
const emit = defineEmits<{ 'update:modelValue': [v: string | null] }>();

const uid = useId();
const fid = computed(() => props.id ?? `tp-${uid}`);
const outOf = (t: string) => (!!props.min && t < props.min) || (!!props.max && t > props.max);
const hm = computed(() => (props.modelValue ? props.modelValue.split(':').map(Number) as [number, number] : null));

// ── segments ──
const hourEl = ref<HTMLElement | null>(null);
const minEl = ref<HTMLElement | null>(null);
const draft = ref<{ h: string; m: string }>({ h: '', m: '' });
watch(() => props.modelValue, () => { draft.value = { h: '', m: '' }; });
const shownH = computed(() => draft.value.h || (hm.value ? pad(hm.value[0]) : ''));
const shownM = computed(() => draft.value.m || (hm.value ? pad(hm.value[1]) : ''));

function set(h: number, m: number) {
  draft.value = { h: '', m: '' }; // before any focus move, so the left segment's blur has nothing stale to apply
  const t = `${pad(((h % 24) + 24) % 24)}:${pad(((m % 60) + 60) % 60)}`;
  emit('update:modelValue', t);
}
const base = () => hm.value ?? (props.min ? props.min.split(':').map(Number) as [number, number] : [9, 0] as [number, number]);
function onSegKey(e: KeyboardEvent, seg: 'h' | 'm') {
  const [h, m] = base();
  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
    e.preventDefault();
    const d = e.key === 'ArrowUp' ? 1 : -1;
    if (seg === 'h') set(h + d, m); else set(h, m + d * (e.shiftKey ? 15 : 1));
  } else if (/^\d$/.test(e.key)) {
    e.preventDefault();
    const cur = (seg === 'h' ? draft.value.h : draft.value.m) + e.key;
    const max = seg === 'h' ? 23 : 59;
    if (cur.length === 1 && Number(cur) * 10 > max) {
      // "3" in the hour can only be 03: take it and move on
      if (seg === 'h') { set(Number(cur), m); minEl.value?.focus(); } else set(h, Number(cur));
      return;
    }
    if (cur.length === 1) { if (seg === 'h') draft.value.h = cur; else draft.value.m = cur; return; }
    const n = Math.min(max, Number(cur));
    if (seg === 'h') { set(n, m); minEl.value?.focus(); } else set(h, n);
  } else if (e.key === 'Backspace' || e.key === 'Delete') {
    e.preventDefault(); emit('update:modelValue', null);
  } else if (e.key === 'ArrowRight' && seg === 'h') { e.preventDefault(); minEl.value?.focus(); }
  else if (e.key === 'ArrowLeft' && seg === 'm') { e.preventDefault(); hourEl.value?.focus(); }
  else if ((e.key === 'Enter' || e.key === ' ') && !open.value) { e.preventDefault(); void openIt(); }
}
function onSegBlur(seg: 'h' | 'm') {
  // a single typed digit ("7") commits as 07 when you leave the segment
  const v = seg === 'h' ? draft.value.h : draft.value.m;
  if (!v) return;
  const [h, m] = base();
  if (seg === 'h') set(Number(v), m); else set(h, Number(v));
}

// ── columns ──
const fieldEl = ref<HTMLElement | null>(null);
const panel = ref<InstanceType<typeof PopPanel> | null>(null);
const hoursCol = ref<HTMLElement | null>(null);
const minsCol = ref<HTMLElement | null>(null);
const { open, sheet, pos, close, show, place } = usePopover({ trigger: fieldEl, pop: computed(() => panel.value?.el), height: () => 292, minWidth: 176, maxWidth: 200 });
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINS = Array.from({ length: 60 }, (_, i) => i);
const hourOut = (h: number) => outOf(`${pad(h)}:59`);
function center() {
  void nextTick(() => {
    for (const col of [hoursCol.value, minsCol.value]) {
      const el = col?.querySelector<HTMLElement>('.sel'); if (col && el) col.scrollTop = el.offsetTop - col.clientHeight / 2 + el.offsetHeight / 2;
    }
  });
}
async function openIt() {
  if (props.disabled || open.value) return;
  show(); await nextTick(); place(); center();
}
function pickHour(h: number) {
  if (hourOut(h)) return;
  let m = hm.value?.[1] ?? 0;
  if (outOf(`${pad(h)}:${pad(m)}`)) m = Number(props.min!.split(':')[1]);
  set(h, m);
}
function pickMin(m: number) {
  const h = hm.value?.[0] ?? base()[0];
  if (outOf(`${pad(h)}:${pad(m)}`)) return;
  set(h, m); close();
}
function onColKey(e: KeyboardEvent) { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); } }
const touch = typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches;
function onFieldPointer(e: PointerEvent) {
  // on touch screens the whole field opens the columns (no keyboard to type into segments)
  if (touch && !props.disabled) { e.preventDefault(); void openIt(); }
}
</script>

<template>
  <div class="field">
    <label v-if="label" class="field-label" :for="`${fid}-h`">{{ label }}</label>
    <div
      :id="fid"
      ref="fieldEl"
      class="control ui-tp-field"
      :class="{ invalid: !!error, open, disabled }"
      role="group"
      :aria-label="label ?? 'Time'"
      @pointerdown="onFieldPointer"
    >
      <span
        :id="`${fid}-h`"
        ref="hourEl"
        class="ui-tp-seg"
        :class="{ ph: !shownH }"
        role="spinbutton"
        :tabindex="disabled ? -1 : 0"
        aria-label="Hour"
        aria-valuemin="0"
        aria-valuemax="23"
        :aria-valuenow="hm?.[0]"
        :aria-valuetext="shownH || 'Empty'"
        @keydown="onSegKey($event, 'h')"
        @blur="onSegBlur('h')"
      >{{ shownH || '--' }}</span>
      <span class="ui-tp-colon" aria-hidden="true">:</span>
      <span
        ref="minEl"
        class="ui-tp-seg"
        :class="{ ph: !shownM }"
        role="spinbutton"
        :tabindex="disabled ? -1 : 0"
        aria-label="Minute"
        aria-valuemin="0"
        aria-valuemax="59"
        :aria-valuenow="hm?.[1]"
        :aria-valuetext="shownM || 'Empty'"
        @keydown="onSegKey($event, 'm')"
        @blur="onSegBlur('m')"
      >{{ shownM || '--' }}</span>
      <span class="grow" />
      <button type="button" class="ui-tp-btn" :disabled="disabled" :aria-expanded="open" aria-haspopup="dialog" aria-label="Choose a time" @click="open ? close() : openIt()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
      </button>
    </div>
    <span v-if="error || help" :class="error ? 'field-error' : 'field-help'">{{ error || help }}</span>

    <PopPanel ref="panel" :open="open" :pos="pos" :sheet="sheet" :title="label ?? 'Choose a time'" @close="close()">
      <div class="ui-tp-cols" role="dialog" :aria-label="label ?? 'Choose a time'" @keydown="onColKey">
        <div class="ui-tp-col">
          <div class="ui-tp-head">Hour</div>
          <ul ref="hoursCol" class="ui-tp-list" role="listbox" aria-label="Hour">
            <li v-for="h in HOURS" :key="h" role="option" class="ui-tp-opt" :class="{ sel: hm?.[0] === h, dis: hourOut(h) }" :aria-selected="hm?.[0] === h" :aria-disabled="hourOut(h) || undefined" @pointerdown.prevent @click="pickHour(h)">{{ pad(h) }}</li>
          </ul>
        </div>
        <div class="ui-tp-col">
          <div class="ui-tp-head">Minute</div>
          <ul ref="minsCol" class="ui-tp-list" role="listbox" aria-label="Minute">
            <li v-for="m in MINS" :key="m" role="option" class="ui-tp-opt" :class="{ sel: hm?.[1] === m, dis: outOf(`${pad(hm?.[0] ?? base()[0])}:${pad(m)}`), q: m % 15 === 0 }" :aria-selected="hm?.[1] === m" @pointerdown.prevent @click="pickMin(m)">{{ pad(m) }}</li>
          </ul>
        </div>
      </div>
    </PopPanel>
  </div>
</template>

<style scoped>
/* same 40px as every .control: the clock button sits inside the padding, not on top of it */
.ui-tp-field { display: flex; align-items: center; gap: 0; height: 40px; min-height: 0; padding-top: 0; padding-bottom: 0; padding-right: 5px; cursor: text; font-variant-numeric: tabular-nums; }
.ui-tp-field.disabled { background: var(--bg-subtle); color: var(--text-subtle); cursor: not-allowed; }
.ui-tp-field:focus-within, .ui-tp-field.open { border-color: var(--text); }
.ui-tp-seg { padding: 0 1px; border-radius: 3px; outline: none; caret-color: transparent; min-width: 2ch; text-align: center; }
.ui-tp-seg:focus { background: var(--bg-muted); box-shadow: 0 0 0 1px var(--border-strong); }
.ui-tp-seg.ph { color: var(--text-faint); }
.ui-tp-seg.ph:focus { color: var(--text-subtle); }
.ui-tp-colon { color: var(--text-subtle); padding: 0 1px; }
.ui-tp-btn { flex: none; width: 28px; height: 28px; display: grid; place-items: center; border: 0; background: none; border-radius: 50%; color: var(--text-subtle); cursor: pointer; }
.ui-tp-btn:hover:not(:disabled) { background: var(--bg-hover); color: var(--text); }
</style>

<style>
.ui-tp-cols { display: grid; grid-template-columns: 1fr 1fr; min-height: 0; flex: 1; }
.ui-tp-col { display: flex; flex-direction: column; min-height: 0; }
.ui-tp-col + .ui-tp-col { border-left: 1px solid var(--border-soft); }
.ui-tp-head { padding: 8px 0 6px; text-align: center; font-family: var(--mono); font-size: var(--fs-11); text-transform: uppercase; letter-spacing: .06em; color: var(--text-subtle); border-bottom: 1px solid var(--border-soft); }
/* exactly 7 rows of 32px + padding, so no row is ever cut in half; soft fades say it scrolls */
.ui-tp-list { list-style: none; margin: 0; padding: 6px; overflow-y: auto; overscroll-behavior: contain; height: 236px; position: relative; scrollbar-width: none;
  mask-image: linear-gradient(transparent, #000 14px, #000 calc(100% - 14px), transparent); }
.ui-tp-list::-webkit-scrollbar { display: none; }
.ui-tp-opt { height: 32px; display: grid; place-items: center; border-radius: var(--radius); font-size: var(--fs-14); font-variant-numeric: tabular-nums; color: var(--text-muted); cursor: pointer; }
.ui-tp-opt.q { color: var(--text); }
.ui-tp-opt:hover:not(.dis) { background: var(--bg-hover); }
.ui-tp-opt.sel { background: var(--bg-muted); color: var(--text); font-weight: 600; box-shadow: inset 0 0 0 1px var(--border-strong); }
.ui-tp-opt.dis { color: var(--text-faint); opacity: .5; cursor: not-allowed; }
.ui-pop.sheet .ui-tp-list { height: calc(44px * 7 + 12px); }
.ui-pop.sheet .ui-tp-opt { height: 44px; font-size: var(--fs-16); }
@media (pointer: coarse) { .ui-tp-opt { height: 44px; } .ui-tp-list { height: calc(44px * 7 + 12px); } }
</style>
