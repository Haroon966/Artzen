/**
 * Lossy re-encode product images in place (same filename / extension).
 * Run: npm run images:optimize
 *
 * With next.config `output: "export"` and `images.unoptimized`, file bytes
 * are what the browser downloads — keep sources reasonably sized.
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const IMAGES_DIR = path.join(process.cwd(), "public/images");
const MAX_WIDTH = 1400;

const RASTER = new Set([".jpg", ".jpeg", ".png", ".webp"]);

async function optimizeFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (!RASTER.has(ext)) return;

  const before = await fs.promises.stat(filePath);
  const meta = await sharp(filePath).metadata();
  let pipeline = sharp(filePath);
  if (meta.width && meta.width > MAX_WIDTH) {
    pipeline = pipeline.resize(MAX_WIDTH, null, { withoutEnlargement: true });
  }

  let buf;
  if (ext === ".png") {
    buf = await pipeline.png({ compressionLevel: 9, effort: 8 }).toBuffer();
  } else if (ext === ".jpg" || ext === ".jpeg") {
    buf = await pipeline.jpeg({ quality: 76, mozjpeg: true }).toBuffer();
  } else if (ext === ".webp") {
    buf = await pipeline.webp({ quality: 74, effort: 6 }).toBuffer();
  } else {
    return;
  }

  if (buf.length < before.size) {
    await fs.promises.writeFile(filePath, buf);
    const pct = Math.round((1 - buf.length / before.size) * 100);
    console.log(
      `${path.relative(process.cwd(), filePath)}  ${before.size} → ${buf.length} bytes (−${pct}%)`
    );
  }
}

async function walk(dir) {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) await walk(full);
    else await optimizeFile(full);
  }
}

async function main() {
  if (!fs.existsSync(IMAGES_DIR)) {
    console.error("Missing", IMAGES_DIR);
    process.exit(1);
  }
  await walk(IMAGES_DIR);
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
