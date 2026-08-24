import type { Filter, Store } from "./store";
import type { TableName, Tables } from "./types";

export class SupabaseError extends Error {
  constructor(
    message: string,
    readonly code: string | null,
    readonly status: number,
  ) {
    super(message);
    this.name = "SupabaseError";
  }

  /** True when Postgres rejected the write because the slot is already taken. */
  get isConflict() {
    return this.code === "23P01" || this.code === "23505";
  }
}

function encodeValue(value: unknown) {
  if (value === null) return "null";
  const raw = String(value);
  return /[,.()"\s]/.test(raw) ? `"${raw.replace(/"/g, '\\"')}"` : raw;
}

function buildQuery<T>(filter: Filter<T>) {
  const params = new URLSearchParams();
  params.set("select", "*");
  for (const [key, value] of Object.entries(filter.eq ?? {})) {
    params.append(key, value === null ? "is.null" : `eq.${encodeValue(value)}`);
  }
  for (const [key, values] of Object.entries(filter.in ?? {})) {
    const list = values as Array<string | number>;
    params.append(key, `in.(${list.map(encodeValue).join(",")})`);
  }
  for (const [key, value] of Object.entries(filter.gte ?? {})) {
    params.append(key, `gte.${encodeValue(value)}`);
  }
  for (const [key, value] of Object.entries(filter.lt ?? {})) {
    params.append(key, `lt.${encodeValue(value)}`);
  }
  for (const [key, value] of Object.entries(filter.lte ?? {})) {
    params.append(key, `lte.${encodeValue(value)}`);
  }
  if (filter.order) {
    params.set(
      "order",
      `${String(filter.order.column)}.${filter.order.ascending === false ? "desc" : "asc"}`,
    );
  }
  if (typeof filter.limit === "number") params.set("limit", String(filter.limit));
  return params;
}

/**
 * PostgREST driver. Uses the service-role key and therefore only ever runs on
 * the server — never import this from a client component.
 *
 * There is no multi-statement transaction over PostgREST, so double booking is
 * prevented by the `appointments_no_overlap` exclusion constraint declared in
 * `supabase/schema.sql`; a violation surfaces here as `SupabaseError.isConflict`.
 */
export class SupabaseStore implements Store {
  readonly name = "supabase" as const;

  constructor(
    private readonly url: string,
    private readonly key: string,
  ) {}

  private endpoint(table: TableName, params?: URLSearchParams) {
    const query = params?.toString();
    return `${this.url}/rest/v1/${table}${query ? `?${query}` : ""}`;
  }

  private headers(extra: Record<string, string> = {}) {
    return {
      apikey: this.key,
      Authorization: `Bearer ${this.key}`,
      "Content-Type": "application/json",
      ...extra,
    };
  }

  private async request(input: string, init: RequestInit) {
    const response = await fetch(input, { ...init, cache: "no-store" });
    if (response.ok) {
      if (response.status === 204) return [];
      const text = await response.text();
      return text ? JSON.parse(text) : [];
    }
    let code: string | null = null;
    let message = `${response.status} ${response.statusText}`;
    try {
      const body = (await response.json()) as { code?: string; message?: string };
      code = body.code ?? null;
      message = body.message ?? message;
    } catch {
      /* non-JSON error body */
    }
    throw new SupabaseError(message, code, response.status);
  }

  async select<K extends TableName>(table: K, filter: Filter<Tables[K]> = {}) {
    return (await this.request(this.endpoint(table, buildQuery(filter)), {
      headers: this.headers(),
    })) as Tables[K][];
  }

  async insert<K extends TableName>(table: K, rows: Tables[K][]) {
    if (!rows.length) return [];
    return (await this.request(this.endpoint(table), {
      method: "POST",
      headers: this.headers({ Prefer: "return=representation" }),
      body: JSON.stringify(rows),
    })) as Tables[K][];
  }

  async update<K extends TableName>(table: K, id: string, patch: Partial<Tables[K]>) {
    const params = new URLSearchParams({ id: `eq.${id}` });
    const rows = (await this.request(this.endpoint(table, params), {
      method: "PATCH",
      headers: this.headers({ Prefer: "return=representation" }),
      body: JSON.stringify(patch),
    })) as Tables[K][];
    return rows[0] ?? null;
  }

  async remove<K extends TableName>(table: K, id: string) {
    const params = new URLSearchParams({ id: `eq.${id}` });
    await this.request(this.endpoint(table, params), {
      method: "DELETE",
      headers: this.headers(),
    });
  }

  transaction<T>(fn: () => Promise<T>): Promise<T> {
    return fn();
  }
}
