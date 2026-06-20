/**
 * Writes small PNG favicon + app icon from the repo logo (or existing favicon).
 * Run: npm run images:icons
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const ROOT = process.cwd();
const logo = path.join(ROOT, "public", "Artzens-logo.png");
const favSource = path.join(ROOT, "public", "artzennewlogo.jpeg");
const favIn = path.join(ROOT, "public", "Artzen-favicon.png");
const faviconSource = fs.existsSync(favSource) ? favSource : favIn;
const source = fs.existsSync(logo) ? logo : faviconSource;

async function main() {
  if (!fs.existsSync(source)) {
    console.error("No source image at public/Artzens-logo.png or public/Artzen-favicon.png");
    process.exit(1);
  }
  if (!fs.existsSync(faviconSource)) {
    console.error("No favicon source at public/artzennewlogo.jpeg or public/Artzen-favicon.png");
    process.exit(1);
  }

  const fav32 = path.join(ROOT, "public", "Artzen-favicon.png");
  const app512 = path.join(ROOT, "src", "app", "icon.png");

  await sharp(faviconSource)
    .resize(32, 32, { fit: "cover", position: "centre" })
    .png({ compressionLevel: 9, effort: 9 })
    .toFile(fav32);
  console.log("Wrote", path.relative(ROOT, fav32));

  await sharp(faviconSource)
    .resize(512, 512, { fit: "cover", position: "centre" })
    .png({ compressionLevel: 9, effort: 9 })
    .toFile(app512);
  console.log("Wrote", path.relative(ROOT, app512));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
