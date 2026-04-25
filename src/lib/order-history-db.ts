/**
 * Client-side order history in IndexedDB (per browser / device).
 * Only call from client components after successful checkout.
 */

const DB_NAME = "artzen-order-history";
const DB_VERSION = 1;
const STORE_NAME = "orders";

export type StoredOrderHistoryLine = {
  id: string;
  slug: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type StoredCustomerSnapshot = {
  name: string;
  phone: string;
  city: string;
  address: string;
  notes: string;
};

export type StoredOrderHistoryRecord = {
  /** Primary key — unique per order */
  orderRef: string;
  createdAt: string;
  customer: StoredCustomerSnapshot;
  items: StoredOrderHistoryLine[];
  totalFormatted: string;
  totalNumeric: number;
};

/** localStorage key for instant checkout autofill (synced when an order succeeds). */
export const CHECKOUT_DELIVERY_STORAGE_KEY = "artzen-checkout-delivery";

export function loadSavedCheckoutDeliveryFromLocalStorage(): StoredCustomerSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CHECKOUT_DELIVERY_STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as Partial<StoredCustomerSnapshot>;
    if (
      typeof p.name !== "string" ||
      typeof p.phone !== "string" ||
      typeof p.city !== "string" ||
      typeof p.address !== "string" ||
      typeof p.notes !== "string"
    ) {
      return null;
    }
    return {
      name: p.name,
      phone: p.phone,
      city: p.city,
      address: p.address,
      notes: p.notes,
    };
  } catch {
    return null;
  }
}

export function saveCheckoutDeliveryToLocalStorage(customer: StoredCustomerSnapshot): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CHECKOUT_DELIVERY_STORAGE_KEY, JSON.stringify(customer));
  } catch {
    // quota / private mode
  }
}

function getIdbFactory(): IDBFactory | undefined {
  if (typeof globalThis === "undefined") return undefined;
  return globalThis.indexedDB;
}

/**
 * Opens the database, creating the `orders` object store on first run.
 */
export function openOrderHistoryDb(): Promise<IDBDatabase> {
  const idb = getIdbFactory();
  if (!idb) {
    return Promise.reject(new Error("IndexedDB is not available"));
  }

  return new Promise((resolve, reject) => {
    const req = idb.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error ?? new Error("Failed to open order history DB"));
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "orderRef" });
      }
    };
  });
}

/**
 * Persists a successful order. Uses `put` so the same orderRef replaces if retried.
 */
export async function saveOrderToHistory(
  order: StoredOrderHistoryRecord
): Promise<void> {
  const idb = getIdbFactory();
  if (!idb) return;

  const db = await openOrderHistoryDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(order);
    req.onerror = () => reject(req.error ?? new Error("Failed to save order"));
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error ?? new Error("Transaction failed"));
    };
  });
}

/**
 * Returns all locally saved orders, newest first.
 * Safe fallback: returns [] when IndexedDB is unavailable or read fails.
 */
export async function listOrdersFromHistory(): Promise<StoredOrderHistoryRecord[]> {
  const idb = getIdbFactory();
  if (!idb) return [];

  try {
    const db = await openOrderHistoryDb();
    try {
      const records = await new Promise<StoredOrderHistoryRecord[]>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();
        req.onsuccess = () => resolve((req.result as StoredOrderHistoryRecord[]) ?? []);
        req.onerror = () => reject(req.error ?? new Error("Failed to read order history"));
        tx.onerror = () => reject(tx.error ?? new Error("Transaction failed"));
      });

      return records.sort((a, b) => {
        const tb = new Date(b.createdAt).getTime();
        const ta = new Date(a.createdAt).getTime();
        const sb = Number.isNaN(tb) ? 0 : tb;
        const sa = Number.isNaN(ta) ? 0 : ta;
        return sb - sa;
      });
    } finally {
      db.close();
    }
  } catch {
    return [];
  }
}

/** Latest customer snapshot for checkout autofill (localStorage first, then newest IndexedDB order). */
export async function getLastSavedCustomerForCheckout(): Promise<StoredCustomerSnapshot | null> {
  const fromStorage = loadSavedCheckoutDeliveryFromLocalStorage();
  if (fromStorage) return fromStorage;
  const orders = await listOrdersFromHistory();
  return orders[0]?.customer ?? null;
}
