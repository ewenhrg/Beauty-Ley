import { getStore } from "../db";
import { buildSeed } from "../db/seed";
import { TABLE_NAMES } from "../db/types";
import type { TableName, Tables } from "../db/types";

let seeded: Promise<void> | null = null;

/**
 * Populates an empty database with the starting catalogue. Idempotent: it only
 * runs when the settings row is missing, and never re-inserts a row whose id is
 * already there — two workers racing on a cold start cannot duplicate it.
 */
export function ensureSeeded() {
  if (!seeded) {
    seeded = run().catch((error) => {
      seeded = null;
      throw error;
    });
  }
  return seeded;
}

async function run() {
  const store = getStore();
  await store.transaction(async () => {
    const existing = await store.select("settings", { limit: 1 });
    if (existing.length) return;

    const seed = buildSeed();
    for (const table of TABLE_NAMES) {
      const rows = seed[table] as Array<Tables[TableName] & { id: string }>;
      if (!rows.length) continue;

      const present = new Set(
        (await store.select(table)).map((row) => (row as { id: string }).id),
      );
      const missing = rows.filter((row) => !present.has(row.id));
      if (missing.length) await store.insert(table, missing as never);
    }
  });
}
