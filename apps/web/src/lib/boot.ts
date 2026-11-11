import { reactive } from 'vue';

/**
 * The first screen of a page load. Until the router settles its first route there is nothing to render;
 * if that fails (API unreachable, a release mid-swap, a missing chunk) App shows `error` with a retry
 * instead of a blank page.
 */
export const boot = reactive({
  ready: false,
  error: null as string | null,
  /** Where the failed first navigation was going, so Retry lands on the page they asked for. */
  target: null as string | null,
});
