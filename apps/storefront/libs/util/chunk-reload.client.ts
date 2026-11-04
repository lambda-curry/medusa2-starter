// Vite dispatches `vite:preloadError` when a lazy chunk (such as the lightbox) fails to load,
// usually because a tab still points at hashed files that a newer deploy removed. Reloading
// picks up the current build. The cooldown stops a reload loop when the chunk is truly gone.
// https://vite.dev/guide/build#load-error-handling
const LAST_RELOAD_KEY = 'storefront:chunk-reload-at';
const RELOAD_COOLDOWN_MS = 10_000;

export function registerChunkReloadHandler(): void {
  window.addEventListener('vite:preloadError', () => {
    // The error still propagates (no preventDefault), so the caller's error UI covers the moment
    // before the reload lands, and the case where the reload is skipped.
    try {
      const now = Date.now();
      const lastReloadAt = Number(window.sessionStorage.getItem(LAST_RELOAD_KEY));
      if (lastReloadAt && now - lastReloadAt < RELOAD_COOLDOWN_MS) return;

      window.sessionStorage.setItem(LAST_RELOAD_KEY, String(now));
      window.location.reload();
    } catch {
      // sessionStorage unavailable: skip the reload rather than risk a loop.
    }
  });
}
