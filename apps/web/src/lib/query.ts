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
  if (opts.deps?.length) watch(opts.deps, () => { void run(); });
  if (opts.immediate !== false) void run();
  return { data, loading, error, status, reload: run };
}
