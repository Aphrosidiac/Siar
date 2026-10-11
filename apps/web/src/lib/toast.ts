import { reactive } from 'vue';
import { errorMessage, isApiError } from './api';

export interface ToastItem { id: number; tone: 'success' | 'error' | 'info'; title: string; body?: string }
export const toasts = reactive<ToastItem[]>([]);
let seq = 1;

function push(tone: ToastItem['tone'], title: string, body?: string, ms = tone === 'error' ? 7000 : 3500) {
  const id = seq++;
  toasts.push({ id, tone, title, body });
  setTimeout(() => dismiss(id), ms);
}
export function dismiss(id: number) { const i = toasts.findIndex((t) => t.id === id); if (i >= 0) toasts.splice(i, 1); }

export const toast = {
  success: (title: string, body?: string) => push('success', title, body),
  info: (title: string, body?: string) => push('info', title, body),
  error: (title: string, body?: string) => push('error', title, body),
  /** Show an API failure with the API's own message (and the first issue when it adds detail). */
  fail(e: unknown, title?: string) {
    const msg = errorMessage(e);
    const issue = isApiError(e) && e.issues[0] && e.issues[0].message !== msg ? e.issues[0].message : undefined;
    push('error', title ?? msg, title ? msg : issue);
  },
};
