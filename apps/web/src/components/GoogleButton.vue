<script setup lang="ts">
/**
 * "Continue with Google", per Google's sign-in branding: the standard four-colour G on a light
 * ground, the G left of the label, Google's own wording. A plain link: the API runs the redirect flow.
 * Clicking shows a spinner, since the browser is leaving for Google.
 */
import { onBeforeUnmount, ref } from 'vue';
import Spinner from './ui/Spinner.vue';

defineProps<{ href: string; label?: string }>();
const leaving = ref(false);
let timer: ReturnType<typeof setTimeout> | undefined;
function go(e: MouseEvent) {
  // a new tab or window (ctrl/cmd/shift/middle click) leaves this page where it is: no spinner
  if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  leaving.value = true;
  // a navigation that never happens (stopped, offline) must not leave the button stuck
  clearTimeout(timer); timer = setTimeout(() => { leaving.value = false; }, 8000);
}
// back/forward cache: the page comes back as it was left, spinner and all
const reset = () => { leaving.value = false; clearTimeout(timer); };
addEventListener('pageshow', reset);
onBeforeUnmount(() => { removeEventListener('pageshow', reset); clearTimeout(timer); });
</script>

<template>
  <a :href="href" class="gbtn" :class="{ leaving }" :aria-busy="leaving || undefined" @click="go">
    <Spinner v-if="leaving" :size="16" />
    <svg v-else class="g" viewBox="0 0 48 48" width="18" height="18" aria-hidden="true" focusable="false">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
    <span>{{ label ?? 'Continue with Google' }}</span>
  </a>
</template>

<style scoped>
.gbtn {
  display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; height: 40px; padding: 0 16px;
  border: 1px solid var(--border-strong); border-radius: var(--radius-pill); background: #fff; color: #1f1f1f;
  font-size: var(--fs-14); line-height: 20px; font-weight: 500; letter-spacing: -.005em; text-decoration: none; cursor: pointer;
  transition: background var(--t-micro), border-color var(--t-micro);
}
.gbtn:hover { background: #f7f7f5; border-color: var(--text-subtle); text-decoration: none; }
.gbtn:focus-visible { outline: none; box-shadow: var(--focus); }
.gbtn.leaving { pointer-events: none; opacity: .8; }
/* Google's dark button: #131314 ground, #8e918f border, #e3e3e3 label */
:root[data-theme='dark'] .gbtn { background: #131314; border-color: #8e918f; color: #e3e3e3; }
:root[data-theme='dark'] .gbtn:hover { background: #1d1d1f; }
@media (pointer: coarse) { .gbtn { height: 44px; } }
.g { flex: none; }
</style>
