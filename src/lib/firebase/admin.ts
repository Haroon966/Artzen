import { existsSync, readFileSync } from "fs";
import {
  applicationDefault,
  cert,
  getApps,
  initializeApp,
  type App,
} from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

let adminApp: App | null = null;
let loggedAdminProject = false;

function logAdminProjectOnce(app: App) {
  if (loggedAdminProject || process.env.NODE_ENV !== "development") return;
  loggedAdminProject = true;
  const pid = app.options.projectId;
  if (pid) {
    console.info(
      `[firebase-admin] projectId="${pid}" — must match NEXT_PUBLIC_FIREBASE_PROJECT_ID in .env.local for admin API tokens to verify.`
    );
  }
}

function parseServiceAccount(): Record<string, string> | null {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!raw?.trim()) return null;
  try {
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return null;
  }
}

/** Load service account JSON from GOOGLE_APPLICATION_CREDENTIALS path (works with Next.js .env.local). */
function credentialFromGacPath(): ReturnType<typeof cert> | null {
  const p = process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim();
  if (!p) return null;
  try {
    if (!existsSync(p)) return null;
    const json = JSON.parse(readFileSync(p, "utf8")) as Record<string, unknown>;
    if (typeof json.private_key === "string" && typeof json.client_email === "string") {
      return cert(json as Parameters<typeof cert>[0]);
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Firebase Admin for server Route Handlers and server components.
 * Returns null when credentials are not configured (build/CI/static fallback).
 */
export function getFirebaseAdminApp(): App | null {
  if (adminApp) return adminApp;
  if (getApps().length > 0) {
    adminApp = getApps()[0]!;
    logAdminProjectOnce(adminApp);
    return adminApp;
  }

  const fromFile = credentialFromGacPath();
  if (fromFile) {
    adminApp = initializeApp({ credential: fromFile });
    logAdminProjectOnce(adminApp);
    return adminApp;
  }

  const json = parseServiceAccount();
  if (json && json.private_key && json.client_email) {
    adminApp = initializeApp({
      credential: cert(json as Parameters<typeof cert>[0]),
    });
    logAdminProjectOnce(adminApp);
    return adminApp;
  }

  try {
    adminApp = initializeApp({
      credential: applicationDefault(),
    });
    logAdminProjectOnce(adminApp);
    return adminApp;
  } catch {
    return null;
  }
}

export function getAdminDb() {
  const app = getFirebaseAdminApp();
  if (!app) return null;
  return getFirestore(app);
}

export function getAdminAuth() {
  const app = getFirebaseAdminApp();
  if (!app) return null;
  return getAuth(app);
}

export function getAdminBucket() {
  const app = getFirebaseAdminApp();
  if (!app) return null;
  const bucketName = process.env.FIREBASE_STORAGE_BUCKET;
  return bucketName ? getStorage(app).bucket(bucketName) : getStorage(app).bucket();
}
