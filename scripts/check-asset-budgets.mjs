#!/usr/bin/env node
/**
 * Enforces static asset size / dimension budgets from perf/budgets.json.
 */
import fs from "fs";
import nodePath from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = nodePath.dirname(fileURLToPath(import.meta.url));
const ROOT = nodePath.join(__dirname, "..");
const PERF = nodePath.join(ROOT, "perf");
const PUBLIC = nodePath.join(ROOT, "public");
const IMAGES = nodePath.join(PUBLIC, "images");

async function loadSharp() {
  const { default: sharp } = await import("sharp");
  return sharp;
}

async function main() {
  const budgets = JSON.parse(fs.readFileSync(nodePath.join(PERF, "budgets.json"), "utf8"));
  const a = budgets.assets ?? {};
  let failed = false;

  const checkFile = (rel, maxBytes) => {
    const p = nodePath.join(ROOT, rel);
    if (!fs.existsSync(p)) {
      console.warn(`[asset budget] skip missing ${rel}`);
      return;
    }
    const st = fs.statSync(p);
    if (st.size > maxBytes) {
      failed = true;
      console.error(
        `[asset budget] ${rel} is ${st.size} bytes (max ${maxBytes}). Run npm run images:icons or optimize assets.`
      );
    }
  };

  checkFile("public/Artzen-favicon.png", a.maxFaviconPngBytes ?? 65536);
  checkFile("src/app/icon.png", a.maxAppIconPngBytes ?? 524288);

  const maxRaster = a.maxProductRasterBytes ?? 900_000;
  const maxW = a.maxProductImageWidthPx ?? 1600;
  const sharp = await loadSharp();

  async function walk(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = await fs.promises.readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = nodePath.join(dir, e.name);
      if (e.isDirectory()) await walk(full);
      else {
        const ext = nodePath.extname(e.name).toLowerCase();
        if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) continue;
        const st = await fs.promises.stat(full);
        if (st.size > maxRaster) {
          failed = true;
          console.error(
            `[asset budget] ${nodePath.relative(ROOT, full)} is ${st.size} bytes (max ${maxRaster}).`
          );
        }
        const rel = nodePath.relative(ROOT, full);
        /** Print / master folders — do not enforce web max width here. */
        const skipDimensions = /[/\\]PNG[/\\]/i.test(rel) || /[/\\]SOURCE[/\\]/i.test(rel);
        if (!skipDimensions) {
          try {
            const meta = await sharp(full).metadata();
            if (meta.width && meta.width > maxW) {
              failed = true;
              console.error(
                `[asset budget] ${rel} width ${meta.width}px > max ${maxW}px.`
              );
            }
          } catch {
            /* ignore unreadable */
          }
        }
      }
    }
  }

  await walk(IMAGES);

  if (failed) {
    process.exit(1);
  }
  console.log("[asset budget] OK");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
