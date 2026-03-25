"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { getClientAuth } from "@/lib/firebase/client";

type ColRow = {
  id: string;
  slug?: string;
  name?: string;
  published?: boolean;
  productIds?: string[];
};

export default function AdminCollectionsPage() {
  const router = useRouter();
  const [collections, setCollections] = useState<ColRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const auth = getClientAuth();
    if (!auth) return;
    return onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setToken(null);
        return;
      }
      setToken(await user.getIdToken(true));
    });
  }, []);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    let res = await fetch("/api/admin/collections", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 401) {
      const auth = getClientAuth();
      const refreshed = auth?.currentUser ? await auth.currentUser.getIdToken(true) : null;
      if (refreshed) {
        setToken(refreshed);
        res = await fetch("/api/admin/collections", {
          headers: { Authorization: `Bearer ${refreshed}` },
        });
      }
    }
    if (!res.ok) {
      if (res.status === 401) {
        const auth = getClientAuth();
        if (auth) await signOut(auth);
        setError("Session expired. Please log in again.");
        router.replace("/admin/login");
        setLoading(false);
        return;
      }
      const j = await res.json().catch(() => ({}));
      setError((j as { error?: string }).error ?? `HTTP ${res.status}`);
      setLoading(false);
      return;
    }
    const data = (await res.json()) as { collections?: ColRow[] };
    setCollections(data.collections ?? []);
    setLoading(false);
  }, [token, router]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <section>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-[var(--font-dm-sans)] text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--sage-deep)]">
            Catalog
          </p>
          <h1 className="font-[var(--font-cormorant)] text-4xl font-semibold sm:text-5xl">
            Collections
          </h1>
          <p className="mt-2 font-[var(--font-dm-sans)] text-sm text-[var(--text-secondary)]">
            Slug is the document ID. Manage grouping and visibility from here.
          </p>
        </div>
      </div>
      {error && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
      {loading && (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <li
              key={i}
              className="h-24 animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4"
            />
          ))}
        </ul>
      )}
      {!loading && (
        <ul className="mt-6 grid gap-3 font-[var(--font-dm-sans)] text-[14px] sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((c) => (
          <li
            key={c.id}
            className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4 shadow-[var(--shadow-sm)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
          >
            <strong className="font-medium">{c.name ?? c.slug}</strong>{" "}
            <span className="text-[var(--text-muted)]">({c.slug ?? c.id})</span>
            {c.published === false && (
              <span className="mt-2 inline-flex rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs text-amber-800">
                Unpublished
              </span>
            )}
            <p className="mt-2 text-xs text-[var(--text-muted)]">
              {(c.productIds?.length ?? 0)} product IDs
            </p>
          </li>
        ))}
        </ul>
      )}
      {collections.length === 0 && !error && !loading && (
        <p className="mt-6 rounded-2xl border border-dashed border-[var(--border-mid)] bg-[var(--bg-card)] p-6 text-center text-sm text-[var(--text-muted)]">
          No collections. Run npm run seed:firestore.
        </p>
      )}
    </section>
  );
}
