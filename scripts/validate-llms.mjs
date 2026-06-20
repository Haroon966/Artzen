#!/usr/bin/env node
/**
 * Asserts llms.txt files exist in static export output after build.
 * Run: npm run validate:llms  (after npm run build)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "out");

const ORIGIN =
  process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "") || "https://artzens.com";

function readOut(rel) {
  const p = path.join(OUT, rel);
  if (!fs.existsSync(p)) {
    console.error(`Missing ${p}\nRun: npm run build`);
    process.exit(1);
  }
  return fs.readFileSync(p, "utf8");
}

const llms = readOut("llms.txt");
const llmsFull = readOut("llms-full.txt");

const checks = [
  [llms.includes(ORIGIN), `llms.txt must contain origin ${ORIGIN}`],
  [llms.includes(`${ORIGIN}/sitemap.xml`), "llms.txt must link sitemap.xml"],
  [llmsFull.includes(ORIGIN), `llms-full.txt must contain origin ${ORIGIN}`],
  [llmsFull.includes("Cash on Delivery FAQ"), "llms-full.txt must include COD FAQ section"],
];

let failed = false;
for (const [ok, msg] of checks) {
  if (!ok) {
    failed = true;
    console.error(`validate:llms — ${msg}`);
  }
}

if (failed) process.exit(1);
console.log(`validate:llms OK (${ORIGIN})`);
