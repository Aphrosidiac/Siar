import { computed, reactive, ref, type UnwrapNestedRefs } from 'vue';

/** A form with a saved snapshot: `dirty` while it differs, `discard()` puts the snapshot back. */
export function useDraft<T extends object>(initial: T) {
  const form = reactive({ ...initial }) as UnwrapNestedRefs<T>;
  const saved = ref(JSON.stringify(initial));
  const dirty = computed(() => JSON.stringify(form) !== saved.value);
  function reset(next: T) { Object.assign(form, next); saved.value = JSON.stringify(form); }
  function discard() { Object.assign(form, JSON.parse(saved.value)); }
  function commit() { saved.value = JSON.stringify(form); }
  return { form, dirty, reset, discard, commit };
}
