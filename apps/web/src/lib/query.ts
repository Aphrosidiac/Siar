import { ref, shallowRef, watch, type Ref, type WatchSource } from 'vue';
import { isApiError } from './api';

/**
 * Load-on-mount helper with the states every list needs: loading, error, not-implemented (501)
 * and forbidden (403). Re-runs when any `deps` change.
 */
export function useQuery<T>(fn: () => Promise<T>, opts: { deps?: WatchSource[]; immediate?: boolean; enabled?: () => boolean } = {}) {
  const data = shallowRef<T | null>(null) as Ref<T | null>;
  const loading = ref(false);
  const error = ref<string | null>(null);
  const status = ref<number | null>(null);
  let seq = 0;
  async function run() {
    if (opts.enabled && !opts.enabled()) { data.value = null; return; }
    const my = ++seq;
    loading.value = true; error.value = null; status.value = null;
    try {
      const v = await fn();
      if (my === seq) data.value = v;
    } catch (e) {
      if (my !== seq) return;
      error.value = (e as Error).message;
      status.value = isApiError(e) ? e.status : null;
      data.value = null;
    } finally {
      if (my === seq) loading.value = false;
    }
  }
  /** Re-fetch in the background: no loading state, and a failure keeps the last data on screen. */
  async function refresh() {
    // no access (403) or not available (501) does not change by asking again
    if (loading.value || status.value === 403 || status.value === 501 || (opts.enabled && !opts.enabled())) return;
    const my = ++seq;
    try {
      const v = await fn();
      if (my === seq) { data.value = v; error.value = null; status.value = null; }
    } catch { /* the next refresh or reload tries again */ }
  }
  if (opts.deps?.length) watch(opts.deps, () => { void run(); });
  if (opts.immediate !== false) void run();
  return { data, loading, error, status, reload: run, refresh };
}
