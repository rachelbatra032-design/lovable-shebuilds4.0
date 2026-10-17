export function isModuleLoadError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Loading chunk .+ failed/i.test(message);
}

/** A fresh document gets current module URLs; cap retries to avoid offline reload loops. */
export function recoverModuleLoad(error: unknown): boolean {
  if (typeof window === "undefined" || !isModuleLoadError(error)) return false;
  try {
    const key = `kaimaaral-module-recovery:${window.location.pathname}`;
    const previous = Number(window.sessionStorage.getItem(key) || 0);
    const now = Date.now();
    if (previous && now - previous < 30_000) return false;
    window.sessionStorage.setItem(key, String(now));
    window.location.reload();
    return true;
  } catch {
    return false;
  }
}