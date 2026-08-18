import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const photos = path.join(root, "photos");
const heicPreview = path.join(root, "_heic-preview");
const out = path.join(root, "public", "images");

const dirs = ["salon", "work", "logo"];
for (const d of dirs) {
  fs.mkdirSync(path.join(out, d), { recursive: true });
}

async function toWeb(input, destBase, { width = 1600, quality = 78 } = {}) {
  const img = sharp(input, { failOn: "none" }).rotate();
  const meta = await img.metadata();
  const w = Math.min(width, meta.width || width);

  await Promise.all([
    img
      .clone()
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality, effort: 4 })
      .toFile(`${destBase}.webp`),
    img
      .clone()
      .resize({ width: w, withoutEnlargement: true })
      .jpeg({ quality: quality + 4, mozjpeg: true })
      .toFile(`${destBase}.jpg`),
  ]);
}

const salon = [
  { src: "IMG_9852.JPG.jpeg", name: "reception", width: 1800 },
  { src: "IMG_9843.JPG.jpeg", name: "pedicure-1", width: 1600 },
  { src: "IMG_9844.JPG.jpeg", name: "pedicure-2", width: 1600 },
];

const salonHeic = [
  { src: "IMG_9846.jpg", name: "pedicure-lounge" },
  { src: "IMG_9847.jpg", name: "nail-bar" },
  { src: "IMG_9848.jpg", name: "polish-wall" },
  { src: "IMG_9849.jpg", name: "gel-colors" },
  { src: "IMG_9850.jpg", name: "hair-wash" },
  { src: "IMG_9851.jpg", name: "manicure-stations" },
  { src: "IMG_9853.jpg", name: "styling" },
  { src: "IMG_9854.jpg", name: "salon-wide" },
  { src: "IMG_9855.jpg", name: "pedicure-detail" },
];

const work = [
  { src: "IMG_0019.PNG", name: "nails-mint-gold" },
  { src: "IMG_0213.JPG.jpeg", name: "nails-neon-beach" },
  { src: "IMG_0591.JPG.jpeg", name: "nails-tropical" },
  { src: "IMG_0592.JPG.jpeg", name: "nails-sunset" },
  { src: "IMG_0593.JPG.jpeg", name: "nails-yellow-3d" },
  { src: "IMG_0594.JPG.jpeg", name: "nails-pink-flower" },
  { src: "IMG_0595.JPG.jpeg", name: "nails-gold-stars" },
  { src: "IMG_0629.JPG.jpeg", name: "lashes-close" },
  { src: "IMG_0630.JPG.jpeg", name: "lashes-brow" },
  { src: "IMG_0636.JPG.jpeg", name: "portrait-volume" },
  { src: "IMG_0637.JPG.jpeg", name: "portrait-freckles" },
  { src: "IMG_0638.JPG.jpeg", name: "portrait-blonde" },
  { src: "IMG_0639.JPG.jpeg", name: "portrait-brows" },
  { src: "IMG_9904.PNG", name: "nails-french-flower" },
  { src: "IMG_9905.PNG", name: "nails-pink-gloss" },
  { src: "IMG_9906.PNG", name: "nails-french-almond" },
];

const hair = [
  { src: "cheveux/IMG_0937.PNG", name: "hair-balayage" },
  { src: "cheveux/IMG_0938.PNG", name: "hair-styling" },
];

const workHeic = [{ src: "IMG_0109.jpg", name: "nails-orange-dots" }];

async function extractLogo() {
  const flyer = path.join(photos, "IMG_0613.JPG.jpeg");
  // Monogram only
  await sharp(flyer)
    .extract({ left: 470, top: 30, width: 380, height: 280 })
    .resize({ width: 420 })
    .png({ compressionLevel: 9 })
    .toFile(path.join(out, "logo", "monogram.png"));

  // Full lockup: monogram + wordmark
  await sharp(flyer)
    .extract({ left: 280, top: 20, width: 760, height: 430 })
    .resize({ width: 760 })
    .png({ compressionLevel: 9 })
    .toFile(path.join(out, "logo", "lockup.png"));

  // Circular badge from a lash photo watermark
  const badgeSrc = path.join(photos, "IMG_0636.JPG.jpeg");
  await sharp(badgeSrc)
    .extract({ left: 40, top: 40, width: 280, height: 280 })
    .resize({ width: 256 })
    .webp({ quality: 90 })
    .toFile(path.join(out, "logo", "badge.webp"));
}

async function run() {
  await extractLogo();

  for (const item of salon) {
    await toWeb(path.join(photos, item.src), path.join(out, "salon", item.name), {
      width: item.width,
    });
    console.log("salon", item.name);
  }

  for (const item of salonHeic) {
    await toWeb(path.join(heicPreview, item.src), path.join(out, "salon", item.name), {
      width: 1800,
    });
    console.log("salon", item.name);
  }

  for (const item of work) {
    await toWeb(path.join(photos, item.src), path.join(out, "work", item.name), {
      width: 1400,
      quality: 80,
    });
    console.log("work", item.name);
  }

  for (const item of hair) {
    await toWeb(path.join(photos, item.src), path.join(out, "work", item.name), {
      width: 1400,
      quality: 80,
    });
    console.log("work", item.name);
  }

  for (const item of workHeic) {
    await toWeb(path.join(heicPreview, item.src), path.join(out, "work", item.name), {
      width: 1400,
    });
    console.log("work", item.name);
  }

  const heroSrc = path.join(heicPreview, "IMG_9854.jpg");
  await sharp(heroSrc)
    .rotate()
    .resize({ width: 2000, withoutEnlargement: true })
    .webp({ quality: 76, effort: 4 })
    .toFile(path.join(out, "hero.webp"));
  await sharp(heroSrc)
    .rotate()
    .resize({ width: 2000, withoutEnlargement: true })
    .jpeg({ quality: 80, mozjpeg: true })
    .toFile(path.join(out, "hero.jpg"));

  await sharp(heroSrc)
    .rotate()
    .resize({ width: 1600, height: 840, fit: "cover", position: "centre" })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(path.join(out, "og.jpg"));

  console.log("done");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
