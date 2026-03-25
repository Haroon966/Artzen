#!/usr/bin/env node
/**
 * Validates content/catalog.json against content/catalog.schema.json
 * and checks collection ↔ product references.
 * Run: npm run catalog:validate
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Ajv from "ajv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const catalogPath = path.join(root, "content", "catalog.json");
const schemaPath = path.join(root, "content", "catalog.schema.json");

if (!fs.existsSync(catalogPath)) {
  console.log("catalog:validate — no content/catalog.json, skipping.");
  process.exit(0);
}

let data;
try {
  data = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
} catch (e) {
  console.error("Invalid JSON in content/catalog.json:", e.message);
  process.exit(1);
}

const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
const ajv = new Ajv({ allErrors: true, strict: false });
const validate = ajv.compile(schema);

if (!validate(data)) {
  console.error("content/catalog.json failed schema validation:");
  console.error(ajv.errorsText(validate.errors, { separator: "\n" }));
  process.exit(1);
}

const productIds = new Set(data.products.map((p) => p.id));
const collectionSlugs = new Set(data.collections.map((c) => c.slug));

for (const p of data.products) {
  if (!collectionSlugs.has(p.collectionSlug)) {
    console.error(
      `Product "${p.id}" references unknown collectionSlug: "${p.collectionSlug}"`
    );
    process.exit(1);
  }
}

for (const c of data.collections) {
  for (const pid of c.productIds) {
    if (!productIds.has(pid)) {
      console.error(
        `Collection "${c.slug}" lists unknown product id: "${pid}"`
      );
      process.exit(1);
    }
  }
}

console.log(
  `catalog:validate OK — ${data.collections.length} collections, ${data.products.length} products`
);
