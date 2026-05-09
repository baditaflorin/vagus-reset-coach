import { z } from "zod";
import { sessionRecordSchema, type SessionRecord } from "../sessions/types";

export const DEFAULT_APP_SETTINGS = {
  schemaVersion: 1,
  audioEnabled: true,
  adaptiveBreath: true,
  manualBreathsPerMinute: 6,
} as const;

export const appSettingsSchema = z.object({
  schemaVersion: z.literal(1),
  audioEnabled: z.boolean(),
  adaptiveBreath: z.boolean(),
  manualBreathsPerMinute: z.number().min(4).max(8),
});

const legacyExportSchema = z.object({
  schemaVersion: z.literal(1),
  appVersion: z.string(),
  exportedAt: z.string(),
  source: z.literal("vagus-reset-coach"),
  records: z.array(sessionRecordSchema),
});

export const exportedAppStateSchema = z.object({
  schemaVersion: z.literal(1),
  appVersion: z.string(),
  exportedAt: z.string(),
  source: z.literal("vagus-reset-coach"),
  settings: appSettingsSchema,
  sessions: z.array(sessionRecordSchema),
});

const importableAppStateSchema = z.union([
  exportedAppStateSchema,
  legacyExportSchema,
]);

export type AppSettings = z.infer<typeof appSettingsSchema>;
export type ExportedAppState = z.infer<typeof exportedAppStateSchema>;
export type ImportableAppState = z.infer<typeof importableAppStateSchema>;

export function normalizeAppSettings(input: unknown): AppSettings {
  const parsed = appSettingsSchema.safeParse(input);
  if (parsed.success) {
    return parsed.data;
  }

  return { ...DEFAULT_APP_SETTINGS };
}

export function normalizeImportedAppState(input: unknown): ExportedAppState {
  const parsed = importableAppStateSchema.parse(input);
  if ("sessions" in parsed) {
    return parsed;
  }

  return {
    schemaVersion: 1,
    appVersion: parsed.appVersion,
    exportedAt: parsed.exportedAt,
    source: parsed.source,
    settings: { ...DEFAULT_APP_SETTINGS },
    sessions: parsed.records,
  };
}

export function buildExportedAppState(input: {
  appVersion: string;
  settings: AppSettings;
  sessions: SessionRecord[];
}): ExportedAppState {
  return {
    schemaVersion: 1,
    appVersion: input.appVersion,
    exportedAt: new Date().toISOString(),
    source: "vagus-reset-coach",
    settings: input.settings,
    sessions: input.sessions,
  };
}
