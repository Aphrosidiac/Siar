import { ref } from 'vue';
import { api } from './api';

/**
 * "Continue with Google" is a full-page redirect flow run by the API (/api/v1/auth/google/start →
 * Google → /api/v1/auth/google/callback). It comes back to the page it started from with ?error=<code>
 * when it stops; these are the words for each code (modules/google-signin.ts throws them).
 */
export const GOOGLE_ERRORS: Record<string, string> = {
  google_cancelled: 'Google sign-in was cancelled.',
  google_expired: 'That Google sign-in expired or was finished in another tab. Try again.',
  google_failed: 'Google sign-in did not go through. Try again.',
  google_unavailable: 'Google sign-in is not available right now. Use your email instead.',
  google_rate_limited: 'Too many attempts. Wait a minute, then try again.',
  google_unverified: 'Google has not verified the email on that Google account. Verify it with Google, or use your email here.',
  google_link_required: 'A Siar account already uses this email. Sign in with your password, then connect Google in Your account.',
  google_other_account: 'This email\'s Siar account is connected to a different Google account. Continue with that one, or sign in with your password.',
  google_in_use: 'That Google account is already connected to another Siar account.',
  google_already_linked: 'Your account is already connected to a Google account. Disconnect it first.',
  account_deleted: 'This account was deleted. Contact siaran@ffdev.studio if that is a mistake.',
  session_changed: 'You were signed out before Google finished. Sign in and try again.',
  invite_invalid: 'This invitation has expired, was revoked or was already used. Ask for a new one.',
  invite_email_mismatch: 'This invitation was sent to a different email. Continue with the Google account for the invited address.',
};

export const googleError = (code: unknown) => (typeof code === 'string' && code ? GOOGLE_ERRORS[code] ?? GOOGLE_ERRORS.google_failed : '');

export function googleStartUrl(params: Record<string, string | undefined | null>) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) qs.set(k, v);
  return `/api/v1/auth/google/start${qs.size ? `?${qs}` : ''}`;
}

/** Whether this server offers Google sign-in (asked once per page load; hidden until known). */
const available = ref<boolean | null>(null);
let asked: Promise<void> | null = null;
/** Ask the server (once). The router awaits this before the sign-in pages, so the button never pops in. */
export function googleReady() {
  // never blocks a sign-in page for long: on any failure the page renders without the Google button
  asked ??= api.get<{ google: boolean }>('/auth/providers', undefined, { noAuthRedirect: true, timeoutMs: 5000 })
    .then(r => { available.value = !!r.google; })
    .catch(() => { available.value = false; asked = null; });
  return asked;
}
export function useGoogleSignIn() {
  void googleReady();
  return available;
}
