const STORAGE_KEY = "vagus-onboarding-dismissed:v1";

/**
 * Returns true on the first cold visit (no flag set in localStorage), or
 * when localStorage is unavailable (private mode, embedded contexts). The
 * second branch is intentional: a stranger should always get the banner
 * if we can't prove they've seen it before.
 */
export function shouldShowOnboarding(
  storage: Pick<Storage, "getItem"> | null,
): boolean {
  if (!storage) return true;
  try {
    return storage.getItem(STORAGE_KEY) !== "1";
  } catch {
    return true;
  }
}

export function dismissOnboarding(
  storage: Pick<Storage, "setItem"> | null,
): void {
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEY, "1");
  } catch {
    // Best effort — if storage is full or blocked, the worst case is the
    // banner reappears on the next load. Strictly more annoying than
    // strictly worse than silently failing.
  }
}
