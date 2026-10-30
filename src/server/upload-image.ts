import { promises as fs } from "node:fs";
import path from "node:path";
import { put } from "@vercel/blob";
import sharp from "sharp";
import { newId } from "./ids";
import { ValidationError } from "./validation";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

/**
 * Compresses an admin-uploaded image and stores it either on Vercel Blob
 * (production) or under `public/uploads` (local JSON store).
 */
export async function uploadFlyerImage(file: File): Promise<string> {
  if (!file || !file.size) {
    throw new ValidationError("Choisissez une photo.", "image");
  }
  if (file.size > MAX_BYTES) {
    throw new ValidationError("Image trop lourde (max 8 Mo).", "image");
  }
  const type = file.type || "application/octet-stream";
  if (!ALLOWED.has(type)) {
    throw new ValidationError("Formats acceptés : JPG, PNG, WebP ou GIF.", "image");
  }

  const input = Buffer.from(await file.arrayBuffer());
  const optimized = await sharp(input)
    .rotate()
    .resize({ width: 1600, height: 2000, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();

  const filename = `flyers/${newId("img")}.webp`;
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();

  if (token) {
    const blob = await put(filename, optimized, {
      access: "public",
      contentType: "image/webp",
      token,
    });
    return blob.url;
  }

  // Local / JSON fallback — files live in public so the browser can load them.
  if (process.env.NODE_ENV === "production") {
    throw new ValidationError(
      "Ajoutez BLOB_READ_WRITE_TOKEN (Vercel Blob) pour uploader des photos en production.",
      "image",
    );
  }

  const relative = `/uploads/${filename}`;
  const absolute = path.join(process.cwd(), "public", "uploads", filename);
  await fs.mkdir(path.dirname(absolute), { recursive: true });
  await fs.writeFile(absolute, optimized);
  return relative;
}
