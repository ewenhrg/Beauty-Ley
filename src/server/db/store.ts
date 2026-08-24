import type { TableName, Tables } from "./types";

export type Filter<T> = {
  eq?: Partial<Record<keyof T, string | number | boolean | null>>;
  in?: Partial<Record<keyof T, Array<string | number>>>;
  /** Inclusive lower bound, used for ISO instants and dates. */
  gte?: Partial<Record<keyof T, string | number>>;
  /** Exclusive upper bound. */
  lt?: Partial<Record<keyof T, string | number>>;
  /** Inclusive upper bound. */
  lte?: Partial<Record<keyof T, string | number>>;
  order?: { column: keyof T; ascending?: boolean };
  limit?: number;
};

/**
 * The narrow persistence surface every driver implements. All booking logic
 * lives above this line so the JSON driver and the Supabase driver stay
 * interchangeable.
 */
export interface Store {
  readonly name: "json" | "supabase";
  select<K extends TableName>(table: K, filter?: Filter<Tables[K]>): Promise<Tables[K][]>;
  insert<K extends TableName>(table: K, rows: Tables[K][]): Promise<Tables[K][]>;
  update<K extends TableName>(
    table: K,
    id: string,
    patch: Partial<Tables[K]>,
  ): Promise<Tables[K] | null>;
  remove<K extends TableName>(table: K, id: string): Promise<void>;
  /**
   * Serialises the read-check-write sequence used when booking, so two clients
   * cannot claim the same slot. Postgres additionally enforces this with an
   * exclusion constraint (see `supabase/schema.sql`).
   */
  transaction<T>(fn: () => Promise<T>): Promise<T>;
}

export function matchesFilter<T extends Record<string, unknown>>(row: T, filter: Filter<T>) {
  for (const [key, value] of Object.entries(filter.eq ?? {})) {
    if (row[key] !== value) return false;
  }
  for (const [key, values] of Object.entries(filter.in ?? {})) {
    if (!(values as unknown[]).includes(row[key] as never)) return false;
  }
  for (const [key, value] of Object.entries(filter.gte ?? {})) {
    if (!(row[key] !== null && (row[key] as never) >= (value as never))) return false;
  }
  for (const [key, value] of Object.entries(filter.lt ?? {})) {
    if (!(row[key] !== null && (row[key] as never) < (value as never))) return false;
  }
  for (const [key, value] of Object.entries(filter.lte ?? {})) {
    if (!(row[key] !== null && (row[key] as never) <= (value as never))) return false;
  }
  return true;
}

export function applyOrderAndLimit<T extends Record<string, unknown>>(
  rows: T[],
  filter: Filter<T>,
) {
  let result = rows;
  if (filter.order) {
    const { column, ascending = true } = filter.order;
    result = [...result].sort((a, b) => {
      const left = a[column as string];
      const right = b[column as string];
      if (left === right) return 0;
      if (left === null || left === undefined) return 1;
      if (right === null || right === undefined) return -1;
      return (left < right ? -1 : 1) * (ascending ? 1 : -1);
    });
  }
  if (typeof filter.limit === "number") result = result.slice(0, filter.limit);
  return result;
}
