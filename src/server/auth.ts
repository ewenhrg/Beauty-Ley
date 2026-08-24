import { cookies } from "next/headers";

export const ADMIN_COOKIE = "bl_admin";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

const encoder = new TextEncoder();

/** Web Crypto is used so the same code runs in Node and in the Edge runtime. */
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
  return password ? `derived:${password}` : null;
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

export async function createSessionValue() {
  const key = secret();
  if (!key) throw new Error("ADMIN_PASSWORD manquant.");
  const expiry = String(Date.now() + SESSION_TTL_MS);
  return `${expiry}.${await hmac(expiry, key)}`;
}

export async function verifySessionValue(value: string | undefined) {
  if (!value) return false;
  const key = secret();
  if (!key) return false;
  const [expiry, signature] = value.split(".");
  if (!expiry || !signature) return false;
  if (Number(expiry) < Date.now()) return false;
  return timingSafeEqual(signature, await hmac(expiry, key));
}

export function checkPassword(candidate: string) {
  const expected = process.env.ADMIN_PASSWORD?.trim();
  if (!expected) return false;
  return timingSafeEqual(candidate, expected);
}

/** Server-side guard. Every admin route handler and page calls this. */
export async function isAdmin() {
  const store = await cookies();
  return verifySessionValue(store.get(ADMIN_COOKIE)?.value);
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_TTL_MS / 1000,
};
