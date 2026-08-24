import { getStore } from "../db";
import type { CustomerRow } from "../db/types";
import { newId } from "../ids";
import { ensureSeeded } from "./bootstrap";

/** Digits only, so `+20 100 123 45 67` and `00201001234567` match the same client. */
export function normalisePhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.replace(/^00/, "").replace(/^0(?=\d{9,})/, "");
}

export async function listCustomers() {
  await ensureSeeded();
  return getStore().select("customers", { order: { column: "created_at", ascending: false } });
}

export async function getCustomer(id: string) {
  await ensureSeeded();
  const rows = await getStore().select("customers", { eq: { id }, limit: 1 });
  return rows[0] ?? null;
}

export async function findCustomerByPhone(phone: string) {
  const target = normalisePhone(phone);
  if (!target) return null;
  const customers = await listCustomers();
  return customers.find((customer) => normalisePhone(customer.phone) === target) ?? null;
}

type CustomerInput = {
  first_name: string;
  last_name: string;
  phone: string;
  email: string | null;
  notes?: string | null;
};

/**
 * Returns the existing client with the same phone number, refreshing their
 * details, or creates one. Internal notes are never overwritten from the
 * public booking form.
 */
export async function upsertCustomer(input: CustomerInput) {
  const store = getStore();
  const now = new Date().toISOString();
  const existing = await findCustomerByPhone(input.phone);

  if (existing) {
    const patch: Partial<CustomerRow> = {
      first_name: input.first_name,
      last_name: input.last_name,
      phone: input.phone,
      email: input.email ?? existing.email,
      updated_at: now,
    };
    if (input.notes !== undefined) patch.notes = input.notes;
    const updated = await store.update("customers", existing.id, patch);
    return updated ?? { ...existing, ...patch };
  }

  const row: CustomerRow = {
    id: newId("cus"),
    first_name: input.first_name,
    last_name: input.last_name,
    phone: input.phone,
    email: input.email,
    notes: input.notes ?? null,
    created_at: now,
    updated_at: now,
  };
  const [created] = await store.insert("customers", [row]);
  return created ?? row;
}

export async function updateCustomer(id: string, patch: Partial<CustomerRow>) {
  return getStore().update("customers", id, {
    ...patch,
    updated_at: new Date().toISOString(),
  });
}

export async function deleteCustomer(id: string) {
  await getStore().remove("customers", id);
}

export async function searchCustomers(query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];
  const digits = normalisePhone(needle);
  const customers = await listCustomers();
  return customers.filter((customer) => {
    const haystack = `${customer.first_name} ${customer.last_name} ${customer.email ?? ""}`.toLowerCase();
    if (haystack.includes(needle)) return true;
    return digits.length >= 3 && normalisePhone(customer.phone).includes(digits);
  });
}
