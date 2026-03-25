/**
 * Seed Firestore `products` and `collections` from generated static catalog.
 *
 *   export FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'
 *   # OR: export GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/serviceAccount.json
 *   npm run seed:firestore
 */
import {
  initializeApp,
  cert,
  getApps,
  applicationDefault,
} from "firebase-admin/app";
import {
  getFirestore,
  FieldValue,
  type Firestore,
  type DocumentReference,
} from "firebase-admin/firestore";
import { products, collections } from "../src/lib/data.generated";

function initAdmin(): Firestore {
  if (!getApps().length) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (raw) {
      const json = JSON.parse(raw) as Record<string, unknown>;
      initializeApp({ credential: cert(json as Parameters<typeof cert>[0]) });
    } else {
      initializeApp({ credential: applicationDefault() });
    }
  }
  return getFirestore();
}

async function commitInBatches(
  db: Firestore,
  writes: { ref: DocumentReference; data: Record<string, unknown> }[]
) {
  const chunkSize = 450;
  for (let i = 0; i < writes.length; i += chunkSize) {
    const batch = db.batch();
    for (const w of writes.slice(i, i + chunkSize)) {
      batch.set(w.ref, w.data);
    }
    await batch.commit();
  }
}

async function main() {
  const db = initAdmin();

  const collectionWrites = collections.map((c) => ({
    ref: db.collection("collections").doc(c.slug),
    data: {
      ...c,
      published: true,
      updatedAt: FieldValue.serverTimestamp(),
    } as Record<string, unknown>,
  }));

  const productWrites = products.map((p) => ({
    ref: db.collection("products").doc(p.id),
    data: {
      ...p,
      published: true,
      updatedAt: FieldValue.serverTimestamp(),
    } as Record<string, unknown>,
  }));

  await commitInBatches(db, collectionWrites);
  await commitInBatches(db, productWrites);

  console.log(
    `Seeded ${collections.length} collections and ${products.length} products (published: true).`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
