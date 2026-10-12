/**
 * After a release, a dashboard that is still open (or was served from an old cache) asks for page
 * chunks that no longer exist. Load the page again, once, to pick up the new build.
 */
const KEY = 'siar_new_build_at';

export const isStaleChunk = (err: unknown) =>
  /dynamically imported module|Importing a module script failed|error loading dynamically imported module|Unable to preload CSS/i.test(String((err as Error)?.message ?? err));

/** Full page load of `path`; false when one already happened in the last 10 s (no reload loop). */
export function loadNewBuild(path = location.pathname + location.search + location.hash) {
  try {
    if (Date.now() - Number(sessionStorage.getItem(KEY) ?? 0) < 10000) return false;
    sessionStorage.setItem(KEY, String(Date.now()));
  } catch { /* storage blocked: still reload once */ }
  location.assign(path);
  return true;
}
