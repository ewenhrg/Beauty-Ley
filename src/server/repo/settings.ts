import { getStore } from "../db";
import { buildSeed } from "../db/seed";
import type { SettingsRow } from "../db/types";
import { ensureSeeded } from "./bootstrap";

export async function getSettings(): Promise<SettingsRow> {
  await ensureSeeded();
  const rows = await getStore().select("settings", { limit: 1 });
  return rows[0] ?? buildSeed().settings[0];
}

export async function updateSettings(patch: Partial<SettingsRow>) {
  const current = await getSettings();
  const store = getStore();
  const next = { ...patch, updated_at: new Date().toISOString() };
  const updated = await store.update("settings", current.id, next);
  return updated ?? { ...current, ...next };
}
