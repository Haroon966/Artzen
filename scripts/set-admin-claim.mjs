#!/usr/bin/env node
/**
 * One-off: grant Firebase Auth custom claim admin=true.
 *
 * Usage:
 *   npm run admin:set-claim -- <uid>
 *   npm run admin:set-claim -- you@example.com
 *
 * Credentials (same order as Next server admin.ts):
 *   1) GOOGLE_APPLICATION_CREDENTIALS — path to service account JSON (absolute or relative to repo root)
 *   2) FIREBASE_SERVICE_ACCOUNT_KEY — full JSON string
 *   3) Application Default Credentials + explicit project id (NEXT_PUBLIC_FIREBASE_PROJECT_ID)
 *
 * Loads ../.env.local automatically.
 */
import { existsSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..");

function loadEnvLocal() {
  try {
    const p = join(repoRoot, ".env.local");
    if (!existsSync(p)) return;
    const raw = readFileSync(p, "utf8");
    for (const line of raw.split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const eq = t.indexOf("=");
      if (eq <= 0) continue;
      const key = t.slice(0, eq).trim();
      let val = t.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (process.env[key] === undefined || process.env[key] === "") {
        process.env[key] = val;
      }
    }
  } catch {
    /* ignore */
  }
}

/** Resolve GAC path: absolute, cwd-relative, or relative to repo root. */
function resolveGacPath(p) {
  const trimmed = p.trim();
  if (!trimmed) return null;
  if (existsSync(trimmed)) return trimmed;
  const fromRoot = join(repoRoot, trimmed.replace(/^\.\//, ""));
  if (existsSync(fromRoot)) return fromRoot;
  return trimmed;
}

function readServiceAccountFromGacPath() {
  const rawPath = process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim();
  if (!rawPath) return null;
  const path = resolveGacPath(rawPath);
  try {
    if (!existsSync(path)) {
      console.error(`GOOGLE_APPLICATION_CREDENTIALS file not found:
  Tried: ${rawPath}
  Tried: ${path !== rawPath ? path : "(same)"}
Use an absolute path or a path relative to the project folder (e.g. artzen/adminsdk.json).`);
      return null;
    }
    const json = JSON.parse(readFileSync(path, "utf8"));
    if (typeof json.private_key === "string" && typeof json.client_email === "string") {
      return json;
    }
    console.error("GOOGLE_APPLICATION_CREDENTIALS JSON is missing private_key or client_email.");
    return null;
  } catch (e) {
    console.error("Failed to read GOOGLE_APPLICATION_CREDENTIALS:", e);
    return null;
  }
}

function explicitProjectId() {
  return (
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim() ||
    process.env.GOOGLE_CLOUD_PROJECT?.trim() ||
    process.env.GCLOUD_PROJECT?.trim() ||
    ""
  );
}

loadEnvLocal();

const arg = process.argv[2];
if (!arg) {
  console.error(`Usage: npm run admin:set-claim -- <uid-or-email>

Examples:
  npm run admin:set-claim -- abc123XYZ...
  npm run admin:set-claim -- sunnygraphics07@gmail.com

Add to .env.local (same as for admin API / seed):
  GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/firebase-adminsdk-....json
  OR paste FIREBASE_SERVICE_ACCOUNT_KEY={...}

Then: Admin login → "Refresh token" (or sign out and sign in).`);
  process.exit(1);
}

if (!getApps().length) {
  const saFromFile = readServiceAccountFromGacPath();
  if (saFromFile) {
    const projectId = typeof saFromFile.project_id === "string" ? saFromFile.project_id : undefined;
    initializeApp({
      credential: cert(saFromFile),
      ...(projectId ? { projectId } : {}),
    });
  } else {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.trim();
    if (raw) {
      let json;
      try {
        json = JSON.parse(raw);
      } catch {
        console.error("FIREBASE_SERVICE_ACCOUNT_KEY must be valid JSON");
        process.exit(1);
      }
      const projectId = typeof json.project_id === "string" ? json.project_id : undefined;
      initializeApp({
        credential: cert(json),
        ...(projectId ? { projectId } : {}),
      });
    } else {
      const projectId = explicitProjectId();
      if (!projectId) {
        console.error(`No Firebase Admin credentials found.

Add ONE of these to .env.local (then run this command again):

  GOOGLE_APPLICATION_CREDENTIALS=/home/you/artzen/your-project-firebase-adminsdk-xxxxx.json

  OR (single line JSON):

  FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"...",...}

Your .env.local currently has NEXT_PUBLIC_FIREBASE_* for the client, but the Admin SDK needs a service account JSON (download from Firebase Console → Project settings → Service accounts).

If you only use gcloud Application Default Credentials, also set:
  NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id`);
        process.exit(1);
      }
      try {
        initializeApp({ credential: applicationDefault(), projectId });
      } catch (e) {
        console.error(
          "Could not use Application Default Credentials. Prefer GOOGLE_APPLICATION_CREDENTIALS with the Firebase service account JSON file."
        );
        console.error(e);
        process.exit(1);
      }
    }
  }
}

const auth = getAuth();
let uid = arg.trim();
if (uid.includes("@")) {
  const email = uid.toLowerCase();
  const user = await auth.getUserByEmail(email);
  uid = user.uid;
  console.log(`Resolved ${email} → uid=${uid}`);
}

await auth.setCustomUserClaims(uid, { admin: true });
console.log(`OK: admin claim set for uid=${uid}`);
