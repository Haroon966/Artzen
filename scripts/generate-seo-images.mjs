/**
 * Generates og-banner.jpg (1200×630) and hero-1.webp for social previews + homepage hero.
 * Run: node scripts/generate-seo-images.mjs
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.join(import.meta.dirname, "..");
const PUBLIC = path.join(ROOT, "public");
const IMAGES = path.join(PUBLIC, "images");
const LOGO = path.join(PUBLIC, "Artzens-logo.png");

const CREAM = "#F5F5F0";
const SAGE = "#7DAA8A";
const DARK = "#2C2C2C";
const MUTED = "#5A5A52";

async function ensureDir(dir) {
  await fs.promises.mkdir(dir, { recursive: true });
}

function ogBannerSvg() {
  return Buffer.from(`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${CREAM}"/>
      <stop offset="100%" stop-color="#E8EDE4"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect x="0" y="580" width="1200" height="50" fill="${SAGE}" opacity="0.18"/>
  <circle cx="1050" cy="90" r="120" fill="${SAGE}" opacity="0.12"/>
  <circle cx="120" cy="520" r="80" fill="${SAGE}" opacity="0.1"/>
  <text x="600" y="300" text-anchor="middle" font-family="Georgia, serif" font-size="72" font-weight="600" fill="${DARK}">Artzens</text>
  <text x="600" y="370" text-anchor="middle" font-family="Arial, sans-serif" font-size="34" fill="${MUTED}">Pakistan&apos;s favourite online store</text>
  <text x="600" y="430" text-anchor="middle" font-family="Arial, sans-serif" font-size="26" fill="${SAGE}">Home decor · Wall art · Gifts · Cash on Delivery</text>
  <text x="600" y="560" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" fill="${MUTED}">artzens.com</text>
</svg>`);
}

async function generateOgBanner() {
  const out = path.join(IMAGES, "og-banner.jpg");
  const logoMeta = await sharp(LOGO).metadata();
  const logoMaxW = 420;
  const logoBuf = await sharp(LOGO)
    .resize(logoMaxW, null, { withoutEnlargement: true })
    .png()
    .toBuffer();
  const logoH = (await sharp(logoBuf).metadata()).height ?? 120;
  const logoY = Math.round(130 - logoH / 2);

  await sharp(ogBannerSvg())
    .composite([{ input: logoBuf, top: logoY, left: Math.round(600 - logoMaxW / 2) }])
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(out);

  const stat = await fs.promises.stat(out);
  console.log(`Wrote ${out} (${Math.round(stat.size / 1024)} KB)`);
}

async function generateHero() {
  const productsDir = path.join(IMAGES, "products");
  const picks = [
    "bear-wall-art-premium-mdf-wood-decor.webp",
    "ayat-ul-kursi-premium-islamic-wall-art.webp",
    "majestic-lion-mdf-wall-art-premium-wooden-decor-for-home-office.webp",
  ];
  const tiles = [];
  for (const name of picks) {
    const p = path.join(productsDir, name);
    if (fs.existsSync(p)) tiles.push(p);
  }
  if (tiles.length === 0) {
    await sharp(ogBannerSvg()).webp({ quality: 78 }).toFile(path.join(IMAGES, "hero-1.webp"));
    console.log("Wrote hero-1.webp (banner fallback)");
    return;
  }

  const tileW = 640;
  const tileH = 720;
  const composites = [];
  for (let i = 0; i < tiles.length; i++) {
    const buf = await sharp(tiles[i])
      .resize(tileW, tileH, { fit: "cover", position: "centre" })
      .toBuffer();
    composites.push({ input: buf, left: i * tileW, top: 0 });
  }

  const collageW = tileW * tiles.length;
  const collageH = tileH;
  const collage = await sharp({
    create: {
      width: collageW,
      height: collageH,
      channels: 3,
      background: CREAM,
    },
  })
    .composite(composites)
    .resize(1920, 900, { fit: "cover", position: "centre" })
    .modulate({ brightness: 1.02 })
    .webp({ quality: 76 })
    .toBuffer();

  const overlay = Buffer.from(`<svg width="1920" height="900" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="55%" stop-color="black" stop-opacity="0"/>
        <stop offset="100%" stop-color="#2C2C2C" stop-opacity="0.55"/>
      </linearGradient>
    </defs>
    <rect width="1920" height="900" fill="url(#fade)"/>
    <text x="960" y="780" text-anchor="middle" font-family="Georgia, serif" font-size="64" fill="white">Shop home decor &amp; gifts</text>
    <text x="960" y="840" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" fill="#E8EDE4">Cash on Delivery across Pakistan</text>
  </svg>`);

  const out = path.join(IMAGES, "hero-1.webp");
  await sharp(collage)
    .composite([{ input: overlay, blend: "over" }])
    .webp({ quality: 74 })
    .toFile(out);

  const stat = await fs.promises.stat(out);
  console.log(`Wrote ${out} (${Math.round(stat.size / 1024)} KB)`);
}

async function generateAppleTouchIcon() {
  const out = path.join(PUBLIC, "apple-touch-icon.png");
  const favicon = path.join(PUBLIC, "Artzen-favicon.png");
  await sharp(favicon).resize(180, 180, { fit: "cover" }).png().toFile(out);
  console.log(`Wrote ${out}`);
}

await ensureDir(IMAGES);
await generateOgBanner();
await generateHero();
await generateAppleTouchIcon();
