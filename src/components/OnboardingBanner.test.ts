import { describe, expect, it } from "vitest";
import { dismissOnboarding, shouldShowOnboarding } from "./onboardingStorage";

function makeStorage(initial: Record<string, string> = {}) {
  const store = new Map<string, string>(Object.entries(initial));
  return {
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    setItem(key: string, value: string) {
      store.set(key, value);
    },
    snapshot() {
      return Object.fromEntries(store);
    },
  };
}

describe("onboarding storage", () => {
  it("shows the banner on the first cold visit", () => {
    expect(shouldShowOnboarding(makeStorage())).toBe(true);
  });

  it("hides the banner after dismissOnboarding has been called", () => {
    const storage = makeStorage();
    dismissOnboarding(storage);
    expect(shouldShowOnboarding(storage)).toBe(false);
  });

  it("treats a missing storage handle as a first visit (private mode, embeds)", () => {
    expect(shouldShowOnboarding(null)).toBe(true);
  });

  it("survives a getItem that throws (storage quota / SecurityError)", () => {
    const angry: Pick<Storage, "getItem"> = {
      getItem() {
        throw new Error("SecurityError");
      },
    };
    expect(shouldShowOnboarding(angry)).toBe(true);
  });

  it("dismissOnboarding silently no-ops when storage is missing or throws", () => {
    expect(() => dismissOnboarding(null)).not.toThrow();
    const angry: Pick<Storage, "setItem"> = {
      setItem() {
        throw new Error("QuotaExceededError");
      },
    };
    expect(() => dismissOnboarding(angry)).not.toThrow();
  });

  it("uses a versioned key so a future schema bump can re-show it cleanly", () => {
    const storage = makeStorage();
    dismissOnboarding(storage);
    // The exact key isn't stable API, but it must include a :v1 suffix so
    // we can re-onboard everyone if the copy or flow changes.
    const keys = Object.keys(storage.snapshot());
    expect(keys.some((k) => k.endsWith(":v1"))).toBe(true);
  });
});
