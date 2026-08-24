import { randomBytes, randomUUID } from "node:crypto";

/** Unambiguous alphabet — no I, O, 0, 1 — so references are easy to read aloud. */
const REFERENCE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Combining accents left behind by NFD normalisation. */
const COMBINING_MARKS = /[̀-ͯ]/g;

export function newId(prefix: string) {
  return `${prefix}_${randomUUID()}`;
}

export function newReference() {
  const bytes = randomBytes(6);
  let out = "";
  for (const byte of bytes) out += REFERENCE_ALPHABET[byte % REFERENCE_ALPHABET.length];
  return `BL-${out}`;
}

export function newToken() {
  return randomBytes(24).toString("base64url");
}

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(COMBINING_MARKS, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
