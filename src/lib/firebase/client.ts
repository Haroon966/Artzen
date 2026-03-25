"use client";

import {
  initializeApp,
  getApps,
  type FirebaseApp,
  type FirebaseOptions,
} from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

let clientApp: FirebaseApp | null = null;

function readConfig() {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
  const measurementId = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID;
  if (!apiKey || !authDomain || !projectId || !appId) return null;
  const config: FirebaseOptions = {
    apiKey,
    authDomain,
    projectId,
    storageBucket: storageBucket ?? `${projectId}.appspot.com`,
    messagingSenderId: messagingSenderId ?? "",
    appId,
  };
  if (measurementId) config.measurementId = measurementId;
  return config;
}

export function getFirebaseClientApp(): FirebaseApp | null {
  if (clientApp) return clientApp;
  const config = readConfig();
  if (!config) return null;
  clientApp = getApps().length ? getApps()[0]! : initializeApp(config);
  return clientApp;
}

export function getClientAuth() {
  const app = getFirebaseClientApp();
  if (!app) return null;
  return getAuth(app);
}

export function getClientFirestore() {
  const app = getFirebaseClientApp();
  if (!app) return null;
  return getFirestore(app);
}

export function getClientStorage() {
  const app = getFirebaseClientApp();
  if (!app) return null;
  return getStorage(app);
}
