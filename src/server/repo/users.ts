import { getStore, SupabaseError } from "../db";
import type { AdminUserRow } from "../db/types";
import { ADMIN_PAGE_IDS, type AdminPageId } from "../admin-pages";

export class UsersTableMissingError extends Error {
  constructor() {
    super(
      "La table des comptes n'existe pas encore. Exécutez le fichier supabase/admin-users.sql dans l'éditeur SQL de Supabase.",
    );
    this.name = "UsersTableMissingError";
  }
}

function isMissingTable(error: unknown) {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  if (error instanceof SupabaseError) {
    return (
      error.status === 404 ||
      error.code === "PGRST205" ||
      error.code === "42P01" ||
      message.includes("admin_users")
    );
  }
  return message.includes("admin_users") && message.includes("no such");
}

async function withUsersTable<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (isMissingTable(error)) throw new UsersTableMissingError();
    throw error;
  }
}

function normalise(row: AdminUserRow): AdminUserRow {
  const allowed = new Set(ADMIN_PAGE_IDS);
  const pages = (Array.isArray(row.pages) ? row.pages : []).filter((page): page is AdminPageId =>
    allowed.has(page as AdminPageId),
  );
  return { ...row, pages };
}

export async function usersTableReady() {
  try {
    await getStore().select("admin_users", { limit: 1 });
    return true;
  } catch (error) {
    if (isMissingTable(error)) return false;
    throw error;
  }
}

export async function listUsers() {
  return withUsersTable(async () => {
    const rows = await getStore().select("admin_users", {
      order: { column: "created_at", ascending: true },
    });
    return rows.map(normalise);
  });
}

export async function getUser(id: string) {
  try {
    const rows = await getStore().select("admin_users", { eq: { id }, limit: 1 });
    return rows[0] ? normalise(rows[0]) : null;
  } catch (error) {
    if (isMissingTable(error)) return null;
    throw error;
  }
}

export async function findUserByUsername(username: string) {
  try {
    const rows = await getStore().select("admin_users", {
      eq: { username: username.trim().toLowerCase() },
      limit: 1,
    });
    return rows[0] ? normalise(rows[0]) : null;
  } catch (error) {
    if (isMissingTable(error)) return null;
    throw error;
  }
}

export async function createUser(row: AdminUserRow) {
  return withUsersTable(async () => {
    const [created] = await getStore().insert("admin_users", [row]);
    return normalise(created);
  });
}

export async function updateUser(id: string, patch: Partial<AdminUserRow>) {
  return withUsersTable(async () => {
    const updated = await getStore().update("admin_users", id, patch);
    return updated ? normalise(updated) : null;
  });
}

export async function deleteUser(id: string) {
  return withUsersTable(async () => {
    await getStore().remove("admin_users", id);
  });
}

export function publicUser(row: AdminUserRow) {
  const { password_hash: _hash, ...rest } = row;
  return rest;
}
