import { reactive } from 'vue';

export interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  /** The person must type this text to enable the confirm button. */
  requireText?: string;
}
export const confirmState = reactive({ open: false, opts: null as ConfirmOptions | null, typed: '', resolve: null as ((v: boolean) => void) | null });

export function confirm(opts: ConfirmOptions): Promise<boolean> {
  if (confirmState.resolve) confirmState.resolve(false);
  confirmState.opts = opts;
  confirmState.typed = '';
  confirmState.open = true;
  return new Promise((resolve) => { confirmState.resolve = resolve; });
}
export function settleConfirm(v: boolean) {
  confirmState.open = false;
  const r = confirmState.resolve; confirmState.resolve = null;
  r?.(v);
}
