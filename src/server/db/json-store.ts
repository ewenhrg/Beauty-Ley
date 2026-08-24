import { promises as fs } from "node:fs";
import path from "node:path";
import type { Store, Filter } from "./store";
import { applyOrderAndLimit, matchesFilter } from "./store";
import type { TableName, Tables } from "./types";
import { TABLE_NAMES } from "./types";

type Database = { [K in TableName]: Tables[K][] };

function emptyDatabase(): Database {
  return Object.fromEntries(TABLE_NAMES.map((table) => [table, []])) as unknown as Database;
}

const FILE = path.join(process.cwd(), ".data", "booking.json");

/**
 * File-backed driver used for local development so the booking flow is fully
 * functional without any external service. It is deliberately not used in
 * production: serverless filesystems are read-only and ephemeral.
 *
 * Every operation re-reads the file. Next.js keeps separate module instances
 * for route handlers and server components, so an in-memory copy would go
 * stale as soon as the other side wrote to it.
 */
export class JsonStore implements Store {
  readonly name = "json" as const;
  private queue: Promise<unknown> = Promise.resolve();

  private async read(): Promise<Database> {
    try {
      const raw = await fs.readFile(FILE, "utf8");
      return { ...emptyDatabase(), ...(JSON.parse(raw) as Partial<Database>) };
    } catch {
      return emptyDatabase();
    }
  }

  private async write(db: Database) {
    await fs.mkdir(path.dirname(FILE), { recursive: true });
    await fs.writeFile(FILE, JSON.stringify(db, null, 2), "utf8");
  }

  async select<K extends TableName>(table: K, filter: Filter<Tables[K]> = {}) {
    const db = await this.read();
    const rows = (db[table] as Tables[K][]).filter((row) =>
      matchesFilter(row as Record<string, unknown>, filter as Filter<Record<string, unknown>>),
    );
    return applyOrderAndLimit(
      rows as Record<string, unknown>[],
      filter as Filter<Record<string, unknown>>,
    ) as Tables[K][];
  }

  async insert<K extends TableName>(table: K, rows: Tables[K][]) {
    const db = await this.read();
    (db[table] as Tables[K][]).push(...rows);
    await this.write(db);
    return rows;
  }

  async update<K extends TableName>(table: K, id: string, patch: Partial<Tables[K]>) {
    const db = await this.read();
    const list = db[table] as Array<Tables[K] & { id: string }>;
    const index = list.findIndex((row) => row.id === id);
    if (index < 0) return null;
    list[index] = { ...list[index], ...patch };
    await this.write(db);
    return list[index];
  }

  async remove<K extends TableName>(table: K, id: string) {
    const db = await this.read();
    const list = db[table] as Array<Tables[K] & { id: string }>;
    const index = list.findIndex((row) => row.id === id);
    if (index < 0) return;
    list.splice(index, 1);
    await this.write(db);
  }

  /** Single-process mutex: chains callers so slot checks never interleave. */
  transaction<T>(fn: () => Promise<T>): Promise<T> {
    const run = this.queue.then(fn, fn);
    this.queue = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  }
}
