import { onBeforeUnmount, ref, watch } from 'vue';

type ElRef = { readonly value: HTMLElement | null | undefined };

/** Below this width every popover (dropdowns, date and time pickers) opens as a bottom sheet. */
export const SHEET_BELOW = 640;

export interface PopPos { top: number; left: number; width: number; maxH: number; up: boolean }

/**
 * Open/close and placement for a popover teleported to <body> and anchored to `trigger`:
 * flips above when there is more room there, clamps to the window, follows scrolling and
 * resizing, closes when the trigger scrolls out of view or on a pointer-down outside. On narrow
 * screens it reports `sheet` instead, and the panel docks to the bottom of the screen.
 */
export function usePopover(opts: { trigger: ElRef; pop: ElRef; height: () => number; minWidth?: number; maxWidth?: number }) {
  const open = ref(false);
  const sheet = ref(false);
  const pos = ref<PopPos>({ top: 0, left: 0, width: 0, maxH: 320, up: false });

  function place() {
    sheet.value = window.innerWidth < SHEET_BELOW;
    if (sheet.value) return;
    const t = opts.trigger.value; if (!t) return;
    const r = t.getBoundingClientRect();
    const vh = window.visualViewport?.height ?? window.innerHeight;
    if (r.bottom < 0 || r.top > vh) { close(false); return; }
    const vw = document.documentElement.clientWidth;
    const below = vh - r.bottom - 12; const above = r.top - 12;
    const want = opts.height();
    const up = below < Math.min(want, 240) && above > below;
    const width = Math.min(Math.max(r.width, opts.minWidth ?? 200), opts.maxWidth ?? Infinity, vw - 16);
    // line up with the trigger: its left edge, or its right edge when the panel is wider and would run off the window
    const left = r.left + width <= vw - 8 ? r.left : r.right - width;
    pos.value = { top: up ? r.top - 6 : r.bottom + 6, left: Math.max(8, Math.min(left, vw - 8 - width)), width, maxH: Math.max(160, Math.min(want, up ? above : below)), up };
  }
  function show() { if (open.value) return; open.value = true; place(); }
  function close(refocus = true) {
    if (!open.value) return;
    open.value = false;
    if (refocus) opts.trigger.value?.focus();
  }

  const outside = (e: Event) => { const t = e.target as Node; if (opts.trigger.value?.contains(t) || opts.pop.value?.contains(t)) return; close(false); };
  const onScroll = (e: Event) => { if (sheet.value || opts.pop.value?.contains(e.target as Node)) return; place(); };
  function listen(on: boolean) {
    const m = on ? 'addEventListener' : 'removeEventListener';
    document[m]('pointerdown', outside, true);
    document[m]('focusin', outside, true);
    window[m]('scroll', onScroll, true);
    window[m]('resize', place);
    window.visualViewport?.[m]('resize', place);
  }
  watch(open, listen);
  onBeforeUnmount(() => listen(false));
  return { open, sheet, pos, place, show, close };
}

/** Modals leave Esc and Tab to an open popover (they live outside the modal, under <body>). */
export const popoverOpen = () => !!document.querySelector('.ui-pop');
