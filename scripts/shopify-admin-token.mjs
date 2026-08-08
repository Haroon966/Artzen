#!/usr/bin/env node
/**
 * Exchange Dev Dashboard app Client ID + Secret for an Admin API access token
 * (client_credentials grant), then optionally sync variant ids.
 *
 * Requires in .env.local:
 *   SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
 *   SHOPIFY_APP_CLIENT_ID=...
 *   SHOPIFY_APP_CLIENT_SECRET=...
 *
 * Usage: npm run shopify:admin-token
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, "..");
const ENV_LOCAL = path.join(PROJECT_ROOT, ".env.local");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const text = fs.readFileSync(filePath, "utf8");
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

loadEnvFile(ENV_LOCAL);
loadEnvFile(path.join(PROJECT_ROOT, ".env"));

const shop = (process.env.SHOPIFY_STORE_DOMAIN || "")
  .trim()
  .replace(/^https?:\/\//, "")
  .replace(/\/$/, "");
const clientId = process.env.SHOPIFY_APP_CLIENT_ID?.trim();
const clientSecret = process.env.SHOPIFY_APP_CLIENT_SECRET?.trim();

if (!shop || !clientId || !clientSecret) {
  console.error(
    "Need SHOPIFY_STORE_DOMAIN, SHOPIFY_APP_CLIENT_ID, SHOPIFY_APP_CLIENT_SECRET in .env.local"
  );
  process.exit(1);
}

async function main() {
  const url = `https://${shop}/admin/oauth/access_token`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
    }),
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }
  if (!res.ok || !json.access_token) {
    console.error("Failed to get access token:", res.status, json);
    console.error(
      "Confirm the app is installed on this shop and scopes include read_products."
    );
    process.exit(1);
  }

  const token = json.access_token;
  console.log("Got Admin access token (scopes:", json.scope || "n/a", ")");

  // Write/update SHOPIFY_ADMIN_TOKEN in .env.local
  let envText = fs.existsSync(ENV_LOCAL)
    ? fs.readFileSync(ENV_LOCAL, "utf8")
    : "";
  if (/^SHOPIFY_ADMIN_TOKEN=/m.test(envText)) {
    envText = envText.replace(
      /^SHOPIFY_ADMIN_TOKEN=.*$/m,
      `SHOPIFY_ADMIN_TOKEN=${token}`
    );
  } else {
    envText += `\nSHOPIFY_ADMIN_TOKEN=${token}\n`;
  }
  fs.writeFileSync(ENV_LOCAL, envText, "utf8");
  console.log("Updated SHOPIFY_ADMIN_TOKEN in .env.local");
  console.log("Next: npm run catalog:sync-variant-ids");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
