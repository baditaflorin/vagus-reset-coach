import { describe, expect, it } from "vitest";
import {
  clearAppSettings,
  getDefaultAppSettings,
  loadAppSettings,
  saveAppSettings,
} from "./settings";

describe("app settings persistence", () => {
  it("returns defaults when storage is empty", () => {
    expect(loadAppSettings(storage())).toEqual(getDefaultAppSettings());
  });

  it("saves and loads settings with schema validation", () => {
    const fakeStorage = storage();
    saveAppSettings(
      {
        ...getDefaultAppSettings(),
        adaptiveBreath: false,
        manualBreathsPerMinute: 5.4,
      },
      fakeStorage,
    );

    expect(loadAppSettings(fakeStorage)).toMatchObject({
      adaptiveBreath: false,
      manualBreathsPerMinute: 5.4,
    });
  });

  it("falls back to defaults on malformed payloads", () => {
    const fakeStorage = storage({
      "vagus-reset-coach:settings": "{bad json",
    });

    expect(loadAppSettings(fakeStorage)).toEqual(getDefaultAppSettings());
    clearAppSettings(fakeStorage);
    expect(loadAppSettings(fakeStorage)).toEqual(getDefaultAppSettings());
  });
});

function storage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem(key: string) {
      return values.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      values.set(key, value);
    },
    removeItem(key: string) {
      values.delete(key);
    },
  };
}
