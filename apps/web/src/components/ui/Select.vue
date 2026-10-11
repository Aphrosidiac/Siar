<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, useId, watch } from 'vue';

/**
 * The one dropdown. A button + listbox popover (never a native <select>): teleported to <body>
 * and positioned against the trigger, so no modal, sticky panel or overflow can clip it; flips
 * up near the bottom of the window; follows scrolling; closes when its trigger scrolls away.
 * Long lists (or `searchable`) get a filter field. Keyboard: ↑ ↓ Home End PgUp PgDn, Enter or
 * Space to choose, Esc to close (without closing the modal around it), and type-ahead.
 */
interface Option { value: string | number | null; label: string; sub?: string; disabled?: boolean }
defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<{
  modelValue?: string | number | null;
  options: (Option | string)[];
  label?: string;
  help?: string;
  error?: string | null;
  /** Shown when nothing is chosen. */
  placeholder?: string;
  /** Offer the placeholder as a choice that clears the value. */
  clearable?: boolean;
  required?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md';
  id?: string;
  /** Filter field: on by default for lists longer than 8. */
  searchable?: boolean;
}>(), { size: 'md', searchable: undefined });
const emit = defineEmits<{ 'update:modelValue': [v: any] }>();

const uid = useId();
const fid = computed(() => props.id ?? `sel-${uid}`);
const listId = `${fid.value}-list`;
const opts = computed<Option[]>(() => props.options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o)));
const empty = (v: unknown) => v === null || v === undefined || v === '';
const selected = computed(() => opts.value.find((o) => !empty(o.value) && String(o.value) === String(props.modelValue)) ?? null);
const canSearch = computed(() => props.searchable ?? opts.value.length > 8);

// the rows the list shows: an optional "clear" row, then the (filtered) options
const q = ref('');
const rows = computed<Option[]>(() => {
  const t = q.value.trim().toLowerCase();
  const list = t ? opts.value.filter((o) => `${o.label} ${o.sub ?? ''}`.toLowerCase().includes(t)) : opts.value;
  return props.clearable && props.placeholder !== undefined && !t ? [{ value: null, label: props.placeholder }, ...list] : list;
});
const isSel = (o: Option) => (empty(o.value) ? empty(props.modelValue) : String(o.value) === String(props.modelValue));

const open = ref(false);
const active = ref(-1);
const trigger = ref<HTMLButtonElement | null>(null);
const pop = ref<HTMLElement | null>(null);
const listEl = ref<HTMLElement | null>(null);
const search = ref<HTMLInputElement | null>(null);
const pos = ref({ top: 0, left: 0, width: 0, maxH: 300, up: false });

function place() {
  const t = trigger.value; if (!t) return;
  const r = t.getBoundingClientRect();
  if (r.bottom < 0 || r.top > window.innerHeight) { close(false); return; }
  const vw = document.documentElement.clientWidth; const vh = window.innerHeight;
  const below = vh - r.bottom - 12; const above = r.top - 12;
  const want = Math.min(320, rows.value.length * 36 + (canSearch.value ? 52 : 0) + 12);
  const up = below < Math.min(want, 220) && above > below;
  const width = Math.min(Math.max(r.width, 200), vw - 16);
  pos.value = { top: up ? r.top - 6 : r.bottom + 6, left: Math.max(8, Math.min(r.left, vw - 8 - width)), width, maxH: Math.max(160, Math.min(320, up ? above : below)), up };
}
function firstEnabled(from: number, step: 1 | -1) {
  for (let i = from; i >= 0 && i < rows.value.length; i += step) if (!rows.value[i]!.disabled) return i;
  return -1;
}
function scrollActive() {
  void nextTick(() => listEl.value?.querySelector<HTMLElement>(`[data-i="${active.value}"]`)?.scrollIntoView({ block: 'nearest' }));
}
async function show() {
  if (props.disabled || open.value) return;
  q.value = ''; open.value = true;
  const cur = rows.value.findIndex(isSel);
  active.value = cur >= 0 ? cur : firstEnabled(0, 1);
  await nextTick(); place(); scrollActive();
  if (canSearch.value && !matchMedia('(pointer: coarse)').matches) search.value?.focus();
}
function close(refocus = true) {
  if (!open.value) return;
  open.value = false;
  if (refocus) trigger.value?.focus();
}
function choose(o: Option | undefined) {
  if (!o || o.disabled) return;
  emit('update:modelValue', empty(o.value) ? null : o.value);
  close();
}
function move(to: number, step: 1 | -1) {
  const i = firstEnabled(Math.max(0, Math.min(rows.value.length - 1, to)), step);
  if (i >= 0) { active.value = i; scrollActive(); }
}

// type-ahead: letters typed in quick succession jump to the first label that starts with them
let typed = ''; let typedAt = 0;
function typeAhead(ch: string) {
  const now = Date.now(); typed = now - typedAt > 600 ? ch : typed + ch; typedAt = now;
  const t = typed.toLowerCase();
  const i = rows.value.findIndex((o) => !o.disabled && o.label.toLowerCase().startsWith(t));
  if (i < 0) return;
  if (open.value) { active.value = i; scrollActive(); } else choose(rows.value[i]);
}

function onKey(e: KeyboardEvent) {
  const k = e.key;
  if (!open.value) {
    if (k === 'ArrowDown' || k === 'ArrowUp' || k === 'Enter' || k === ' ') { e.preventDefault(); void show(); }
    else if (k.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) typeAhead(k);
    return;
  }
  const page = 8;
  switch (k) {
    case 'ArrowDown': e.preventDefault(); move(active.value + 1, 1); break;
    case 'ArrowUp': e.preventDefault(); move(active.value - 1, -1); break;
    case 'Home': e.preventDefault(); move(0, 1); break;
    case 'End': e.preventDefault(); move(rows.value.length - 1, -1); break;
    case 'PageDown': e.preventDefault(); move(active.value + page, 1); break;
    case 'PageUp': e.preventDefault(); move(active.value - page, -1); break;
    case 'Enter': e.preventDefault(); choose(rows.value[active.value]); break;
    case ' ': if (e.target === trigger.value) { e.preventDefault(); choose(rows.value[active.value]); } break;
    case 'Escape': e.preventDefault(); e.stopPropagation(); close(); break;
    case 'Tab': if (e.target !== trigger.value) e.preventDefault(); close(); break;
    default: if (k.length === 1 && e.target === trigger.value && !e.metaKey && !e.ctrlKey) typeAhead(k);
  }
}
watch(q, () => { active.value = firstEnabled(0, 1); void nextTick(place); });

const outside = (e: Event) => { const t = e.target as Node; if (trigger.value?.contains(t) || pop.value?.contains(t)) return; close(false); };
const onScroll = (e: Event) => { if (pop.value?.contains(e.target as Node)) return; place(); };
function listen(on: boolean) {
  const m = on ? 'addEventListener' : 'removeEventListener';
  document[m]('pointerdown', outside, true);
  window[m]('scroll', onScroll, true);
  window[m]('resize', place);
}
watch(open, listen);
onBeforeUnmount(() => listen(false));
</script>

<template>
  <div class="field">
    <label v-if="label" class="field-label" :for="fid">{{ label }}<span v-if="required" class="req" aria-hidden="true">*</span></label>
    <div class="ui-sel">
      <button
        :id="fid"
        ref="trigger"
        type="button"
        role="combobox"
        class="control ui-sel-trigger"
        :class="[{ invalid: !!error, open }, size === 'sm' ? 'sm' : '']"
        :disabled="disabled"
        aria-haspopup="listbox"
        :aria-expanded="open"
        :aria-controls="listId"
        :aria-activedescendant="open && active >= 0 ? `${listId}-${active}` : undefined"
        :aria-invalid="!!error || undefined"
        :aria-required="required || undefined"
        v-bind="$attrs"
        @click="open ? close() : show()"
        @keydown="onKey"
      >
        <span v-if="selected" class="ui-sel-val">{{ selected.label }}</span>
        <span v-else class="ui-sel-ph">{{ placeholder ?? 'Choose…' }}</span>
        <svg class="ui-sel-chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
      </button>
      <!-- keeps `required` working inside forms: the browser points at the trigger -->
      <input v-if="required" class="ui-sel-proxy" tabindex="-1" aria-hidden="true" :value="selected ? String(selected.value) : ''" required @focus="trigger?.focus()" />
    </div>
    <span v-if="error || help" :class="error ? 'field-error' : 'field-help'">{{ error || help }}</span>

    <Teleport to="body">
      <Transition name="ui-sel-pop">
        <div v-if="open" ref="pop" class="ui-sel-pop" :class="{ up: pos.up }" :style="{ top: `${pos.top}px`, left: `${pos.left}px`, width: `${pos.width}px`, maxHeight: `${pos.maxH}px` }">
          <div v-if="canSearch" class="ui-sel-search">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
            <input ref="search" v-model="q" type="text" placeholder="Search…" aria-label="Filter options" :aria-controls="listId" autocomplete="off" @keydown="onKey" />
          </div>
          <ul :id="listId" ref="listEl" class="ui-sel-list" role="listbox" :aria-label="label">
            <li
              v-for="(o, i) in rows"
              :id="`${listId}-${i}`"
              :key="`${i}:${String(o.value)}`"
              :data-i="i"
              role="option"
              class="ui-sel-opt"
              :class="{ act: i === active, sel: isSel(o), dis: o.disabled, clear: empty(o.value) }"
              :aria-selected="isSel(o)"
              :aria-disabled="o.disabled || undefined"
              @pointermove="!o.disabled && (active = i)"
              @pointerdown.prevent
              @click="choose(o)"
            >
              <span class="ui-sel-tx"><span class="ui-sel-l">{{ o.label }}</span><span v-if="o.sub" class="ui-sel-sub">{{ o.sub }}</span></span>
              <svg v-if="isSel(o) && !empty(o.value)" class="ui-sel-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
            </li>
            <li v-if="!rows.length" class="ui-sel-none">{{ q ? 'No matches' : 'Nothing to choose' }}</li>
          </ul>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.ui-sel { position: relative; }
.ui-sel-trigger { display: flex; align-items: center; gap: 8px; width: 100%; text-align: left; cursor: pointer; padding-right: 10px; }
.ui-sel-trigger:disabled { cursor: not-allowed; }
.ui-sel-val, .ui-sel-ph { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ui-sel-ph { color: var(--text-faint); }
.ui-sel-chev { flex: none; color: var(--text-subtle); transition: transform 240ms var(--ease-out); }
.ui-sel-trigger.open { border-color: var(--text); }
.ui-sel-trigger.open .ui-sel-chev { transform: rotate(180deg); }
.ui-sel-proxy { position: absolute; left: 12px; bottom: 0; width: 1px; height: 1px; opacity: 0; pointer-events: none; border: 0; padding: 0; }
</style>

<!-- the popover lives under <body>, so its styles are global (prefixed) -->
<style>
.ui-sel-pop { position: fixed; z-index: calc(var(--z-modal) + 50); display: flex; flex-direction: column; border-radius: var(--radius-lg); background: var(--bg-elevated); border: 1px solid var(--border); box-shadow: var(--shadow); overflow: hidden; }
.ui-sel-pop.up { transform: translateY(-100%); }
.ui-sel-search { display: flex; align-items: center; gap: 8px; padding: 0 12px; height: 44px; flex: none; border-bottom: 1px solid var(--border-soft); color: var(--text-subtle); }
.ui-sel-search input { flex: 1; min-width: 0; border: 0; background: none; outline: none; color: var(--text); font: inherit; font-size: var(--fs-14); }
.ui-sel-list { list-style: none; margin: 0; padding: 4px; overflow-y: auto; overscroll-behavior: contain; }
.ui-sel-opt { display: flex; align-items: center; gap: 10px; min-height: 36px; padding: 6px 10px; border-radius: var(--radius); cursor: pointer; font-size: var(--fs-14); color: var(--text); }
.ui-sel-opt.act { background: var(--bg-hover); }
.ui-sel-opt.sel { font-weight: 500; }
.ui-sel-opt.clear { color: var(--text-subtle); }
.ui-sel-opt.dis { opacity: .45; cursor: not-allowed; }
.ui-sel-tx { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.ui-sel-l, .ui-sel-sub { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ui-sel-sub { font-size: var(--fs-12); color: var(--text-subtle); font-weight: 400; }
.ui-sel-check { flex: none; }
.ui-sel-none { padding: 10px; font-size: var(--fs-13); color: var(--text-subtle); }
.ui-sel-pop-enter-active { transition: opacity 140ms, translate 180ms var(--ease-out); }
.ui-sel-pop-leave-active { transition: opacity 100ms; }
.ui-sel-pop-enter-from { opacity: 0; translate: 0 -4px; }
.ui-sel-pop.up.ui-sel-pop-enter-from { translate: 0 4px; }
.ui-sel-pop-leave-to { opacity: 0; }
@media (pointer: coarse) { .ui-sel-opt { min-height: 44px; } }
@media (prefers-reduced-motion: reduce) { .ui-sel-pop-enter-active, .ui-sel-pop-leave-active { transition: none; } }
</style>
