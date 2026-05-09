import {
  DEFAULT_APP_SETTINGS,
  appSettingsSchema,
  normalizeAppSettings,
  type AppSettings,
} from "./types";

const SETTINGS_KEY = "vagus-reset-coach:settings";
const INTERRUPTED_KEY = "vagus-reset-coach:interrupted-session";

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export function getDefaultAppSettings(): AppSettings {
  return { ...DEFAULT_APP_SETTINGS };
}

export function loadAppSettings(
  storage: StorageLike = window.localStorage,
): AppSettings {
  const raw = storage.getItem(SETTINGS_KEY);
  if (!raw) {
    return getDefaultAppSettings();
  }

  try {
    return normalizeAppSettings(JSON.parse(raw));
  } catch {
    return getDefaultAppSettings();
  }
}

export function saveAppSettings(
  settings: AppSettings,
  storage: StorageLike = window.localStorage,
) {
  const parsed = appSettingsSchema.parse(settings);
  storage.setItem(SETTINGS_KEY, JSON.stringify(parsed));
}

export function clearAppSettings(storage: StorageLike = window.localStorage) {
  storage.removeItem(SETTINGS_KEY);
}

export function markInterruptedSession(
  startedAt: string,
  storage: StorageLike = window.localStorage,
) {
  storage.setItem(INTERRUPTED_KEY, startedAt);
}

export function readInterruptedSession(
  storage: StorageLike = window.localStorage,
) {
  return storage.getItem(INTERRUPTED_KEY);
}

export function clearInterruptedSession(
  storage: StorageLike = window.localStorage,
) {
  storage.removeItem(INTERRUPTED_KEY);
}
