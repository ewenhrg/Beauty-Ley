import { pbkdf2Sync, randomBytes, timingSafeEqual as nodeTimingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { ADMIN_NAV, ADMIN_PAGE_IDS, OWNER_ID, OWNER_USERNAMES, type AdminPageId } from "./admin-pages";
import type { AdminUserRow } from "./db/types";
import { findUserByUsername, getUser } from "./repo/users";

export { ADMIN_NAV, ADMIN_PAGE_IDS, OWNER_ID, type AdminPageId };

export const ADMIN_COOKIE = "bl_admin";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
const PBKDF2_ITERATIONS = 120_000;

const encoder = new TextEncoder();

export type AdminSession = {
  id: string;
  role: "owner" | "staff";
  username: string;
  name: string;
  pages: AdminPageId[];
  staffId: string | null;
  ownAgenda: boolean;
};

/** Web Crypto is used so the same HMAC code runs in Node and in the Edge runtime. */
async function hmac(payload: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return Buffer.from(signature).toString("base64url");
}

function secret() {
  const explicit = process.env.ADMIN_SESSION_SECRET?.trim();
  if (explicit) return explicit;
  const password = process.env.ADMIN_PASSWORD?.trim();
  return password ? `derived:${password}` : "beauty-ley-session";
}

export function isAdminConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD?.trim());
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let index = 0; index < a.length; index += 1) {
    diff |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return diff === 0;
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("base64url");
  const hash = pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, 32, "sha256").toString("base64url");
  return `pbkdf2$${PBKDF2_ITERATIONS}$${salt}$${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [scheme, iter, salt, hash] = stored.split("$");
  if (scheme !== "pbkdf2" || !iter || !salt || !hash) return false;
  const actual = pbkdf2Sync(password, salt, Number(iter), 32, "sha256");
  const expected = Buffer.from(hash, "base64url");
  if (actual.length !== expected.length) return false;
  return nodeTimingSafeEqual(actual, expected);
}

export async function createSessionValue(userId: string) {
  const key = secret();
  const expiry = String(Date.now() + SESSION_TTL_MS);
  const payload = `${userId}.${expiry}`;
  return `${payload}.${await hmac(payload, key)}`;
}

async function readSessionUserId(value: string | undefined): Promise<string | null> {
  if (!value) return null;
  const key = secret();
  const parts = value.split(".");
  if (parts.length === 2) {
    const [expiry, signature] = parts;
    if (!expiry || !signature) return null;
    if (Number(expiry) < Date.now()) return null;
    if (!timingSafeEqual(signature, await hmac(expiry, key))) return null;
    return OWNER_ID;
  }
  if (parts.length === 3) {
    const [userId, expiry, signature] = parts;
    if (!userId || !expiry || !signature) return null;
    if (Number(expiry) < Date.now()) return null;
    if (!timingSafeEqual(signature, await hmac(`${userId}.${expiry}`, key))) return null;
    return userId;
  }
  return null;
}

function ownerSession(): AdminSession {
  return {
    id: OWNER_ID,
    role: "owner",
    username: "admin",
    name: "Admin",
    pages: [...ADMIN_PAGE_IDS],
    staffId: null,
    ownAgenda: false,
  };
}

function sessionFromUser(row: AdminUserRow): AdminSession {
  const allowed = new Set(ADMIN_PAGE_IDS);
  const pages = (Array.isArray(row.pages) ? row.pages : []).filter((page): page is AdminPageId =>
    allowed.has(page as AdminPageId),
  );
  return {
    id: row.id,
    role: "staff",
    username: row.username,
    name: row.display_name,
    pages,
    staffId: row.staff_id,
    ownAgenda: row.own_agenda && Boolean(row.staff_id),
  };
}

export function checkPassword(candidate: string) {
  const expected = process.env.ADMIN_PASSWORD?.trim();
  if (!expected) return false;
  return timingSafeEqual(candidate, expected);
}

export async function authenticate(username: string, password: string): Promise<AdminSession | null> {
  const login = username.trim().toLowerCase();
  const asOwner = !login || OWNER_USERNAMES.has(login);
  if (asOwner && checkPassword(password)) return ownerSession();
  if (asOwner) return null;

  const user = await findUserByUsername(login);
  if (!user || !user.active) return null;
  if (!verifyPassword(password, user.password_hash)) return null;
  return sessionFromUser(user);
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const store = await cookies();
  const userId = await readSessionUserId(store.get(ADMIN_COOKIE)?.value);
  if (!userId) return null;
  if (userId === OWNER_ID) return ownerSession();
  const user = await getUser(userId);
  if (!user || !user.active) return null;
  return sessionFromUser(user);
}

export function canAccess(session: AdminSession, page: AdminPageId) {
  return session.role === "owner" || session.pages.includes(page);
}

export function firstAdminHref(session: AdminSession) {
  const link = ADMIN_NAV.find((item) => canAccess(session, item.id));
  return link?.href ?? "/admin/login";
}

export function agendaStaffId(session: AdminSession): string | undefined {
  if (session.ownAgenda && session.staffId) return session.staffId;
  return undefined;
}

/** Server-side guard. Every admin route handler and page calls this. */
export async function isAdmin() {
  return Boolean(await getAdminSession());
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_TTL_MS / 1000,
};
