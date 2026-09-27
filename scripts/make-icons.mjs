// Generates app icons + splash from the 3D logo master.
// Usage: node scripts/make-icons.mjs   (re-run whenever assets/source changes)
import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const master = path.join(root, "assets/source/logo-3d-master.png");
const out = (name) => path.join(root, "assets/images", name);

// Brand navy (theme/brand.ts stageNavy) with the web's teal glow behind the mark.
const NAVY = "#071A2E";
const SIZE = 1024;

const glow = (size) =>
  Buffer.from(`<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="g" cx="50%" cy="46%" r="58%">
        <stop offset="0%" stop-color="#2EC4B6" stop-opacity="0.34"/>
        <stop offset="55%" stop-color="#0D2C48" stop-opacity="0.55"/>
        <stop offset="100%" stop-color="${NAVY}" stop-opacity="1"/>
      </radialGradient>
    </defs>
    <rect width="100%" height="100%" fill="${NAVY}"/>
    <rect width="100%" height="100%" fill="url(#g)"/>
  </svg>`);

// Trim the master's transparent margin so scale math is exact.
const mark = await sharp(master).trim().png().toBuffer();

async function markAt(px) {
  return sharp(mark).resize(px, px, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
}

async function composite(bg, markPx, file, { opaque = true } = {}) {
  const m = await markAt(markPx);
  const offset = Math.round((SIZE - markPx) / 2);
  let img = sharp(bg).composite([{ input: m, top: offset, left: offset }]);
  if (opaque) img = img.flatten({ background: NAVY });
  await img.png().toFile(out(file));
  console.log("wrote", file);
}

const background = await sharp(glow(SIZE)).png().toBuffer();

// iOS / store icon: opaque, mark at ~84% so the squircle mask never clips the ring.
await composite(background, Math.round(SIZE * 0.84), "icon.png");

// Android adaptive: foreground mark inside the 66% safe zone, background = glow plate.
const transparent = await sharp({ create: { width: SIZE, height: SIZE, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).png().toBuffer();
await composite(transparent, Math.round(SIZE * 0.6), "android-icon-foreground.png", { opaque: false });
await sharp(background).png().toFile(out("android-icon-background.png"));
console.log("wrote android-icon-background.png");

// Splash: mark only, transparent (splash plugin paints the navy background).
await composite(transparent, SIZE, "splash-icon.png", { opaque: false });

// Web favicon.
await sharp(out("icon.png")).resize(48, 48).png().toFile(out("favicon.png"));
console.log("wrote favicon.png");
