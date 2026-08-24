import { JsonStore } from "./json-store";
import type { Store } from "./store";
import { SupabaseStore } from "./supabase-store";

export type StoreStatus =
  | { ready: true; driver: "json" | "supabase" }
  | { ready: false; reason: string };

let cached: Store | null = null;
let status: StoreStatus | null = null;

function resolve(): { store: Store | null; status: StoreStatus } {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (url && key) {
    return {
      store: new SupabaseStore(url.replace(/\/$/, ""), key),
      status: { ready: true, driver: "supabase" },
    };
  }

  // Without Supabase we fall back to the local file store, which only makes
  // sense outside production (serverless filesystems are read-only).
  const allowJson =
    process.env.BOOKING_STORE === "json" || process.env.NODE_ENV !== "production";

  if (allowJson) {
    return { store: new JsonStore(), status: { ready: true, driver: "json" } };
  }

  return {
    store: null,
    status: {
      ready: false,
      reason:
        "Réservation en ligne non configurée : renseignez SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY.",
    },
  };
}

/** Returns the active store, or throws if none is configured. */
export function getStore(): Store {
  if (cached) return cached;
  const resolved = resolve();
  status = resolved.status;
  if (!resolved.store) throw new BookingUnavailableError(resolved.status as { reason: string });
  cached = resolved.store;
  return cached;
}

/** Non-throwing probe used by pages that degrade gracefully. */
export function getStoreStatus(): StoreStatus {
  if (!status) status = resolve().status;
  return status;
}

export class BookingUnavailableError extends Error {
  constructor(status: { reason: string }) {
    super(status.reason);
    this.name = "BookingUnavailableError";
  }
}

export { JsonStore } from "./json-store";
export { SupabaseError } from "./supabase-store";
export type { Store, Filter } from "./store";
