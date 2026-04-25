/**
 * Static checks for Product records used by PDP JSON-LD / OG.
 * Run: npm run validate:seo
 *
 * For rendered Product rich results, still spot-check a few PDPs in Google’s
 * Rich Results Test when you change schema or pricing fields.
 */
import { catalogGeneratedAt, products } from "../src/lib/data.generated";

function main() {
  const iso = Date.parse(catalogGeneratedAt);
  if (Number.isNaN(iso)) {
    console.error("validate:seo: invalid catalogGeneratedAt:", catalogGeneratedAt);
    process.exit(1);
  }
  console.log("catalogGeneratedAt OK:", catalogGeneratedAt);

  const errors: string[] = [];
  for (const p of products) {
    if (!p.slug?.trim()) errors.push(`Product id=${p.id}: missing slug`);
    if (!p.name?.trim()) errors.push(`Product ${p.slug}: missing name`);
    if (!p.image?.trim()) errors.push(`Product ${p.slug}: missing image`);
    if (typeof p.price !== "number" || !Number.isFinite(p.price) || p.price <= 0) {
      errors.push(`Product ${p.slug}: invalid price ${p.price}`);
    }
    if (p.sizeOptions?.length) {
      for (const o of p.sizeOptions) {
        if (!o.id?.trim()) errors.push(`Product ${p.slug}: size option missing id`);
        if (!o.label?.trim()) errors.push(`Product ${p.slug}: size option missing label`);
        if (typeof o.price !== "number" || !Number.isFinite(o.price) || o.price <= 0) {
          errors.push(`Product ${p.slug}: size option ${o.id} invalid price`);
        }
      }
    }
  }

  if (errors.length) {
    console.error(`validate:seo: ${errors.length} issue(s)`);
    for (const e of errors.slice(0, 40)) console.error(" -", e);
    if (errors.length > 40) console.error(` …and ${errors.length - 40} more`);
    process.exit(1);
  }

  console.log(`validate:seo: OK — ${products.length} products`);
}

main();
