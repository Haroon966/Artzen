"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { getClientAuth } from "@/lib/firebase/client";
import { useAdminCatalogSearch } from "@/components/admin/AdminShell";
import { getCollectionDisplayName } from "@/lib/catalog-constants";

type ProductRow = {
  id: string;
  slug?: string;
  name?: string;
  price?: number;
  image?: string;
  cardImage?: string;
  images?: string[];
  collectionSlug?: string;
  published?: boolean;
};

const PAGE_SIZE = 10;

const pkr = new Intl.NumberFormat("en-PK", {
  style: "currency",
  currency: "PKR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

function thumbSrc(p: ProductRow): string | undefined {
  return p.cardImage || p.image || p.images?.[0];
}

export default function AdminProductsListPage() {
  const router = useRouter();
  const catalogSearch = useAdminCatalogSearch();
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [priceFilter, setPriceFilter] = useState<"all" | "lt5k" | "5k15k" | "gt15k">("all");
  const [page, setPage] = useState(0);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());

  const [localSearch, setLocalSearch] = useState("");
  const searchQuery = catalogSearch?.topSearch ?? localSearch;

  const setSearchQuery = useCallback(
    (v: string) => {
      if (catalogSearch) catalogSearch.setTopSearch(v);
      else setLocalSearch(v);
    },
    [catalogSearch],
  );

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    let res = await fetch("/api/admin/products", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 401) {
      const auth = getClientAuth();
      const refreshed = auth?.currentUser ? await auth.currentUser.getIdToken(true) : null;
      if (refreshed) {
        setToken(refreshed);
        res = await fetch("/api/admin/products", {
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
    const data = (await res.json()) as { products?: ProductRow[] };
    setProducts(data.products ?? []);
    setLoading(false);
  }, [token, router]);

  useEffect(() => {
    const auth = getClientAuth();
    if (!auth) {
      setError("Firebase not configured");
      return;
    }
    return onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setToken(null);
        return;
      }
      setToken(await user.getIdToken(true));
    });
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const categories = useMemo(() => {
    const s = new Set<string>();
    for (const p of products) {
      if (p.collectionSlug) s.add(p.collectionSlug);
    }
    return Array.from(s).sort();
  }, [products]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((p) => {
      if (q) {
        const hay = `${p.name ?? ""} ${p.slug ?? ""} ${p.id}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (categoryFilter !== "all" && p.collectionSlug !== categoryFilter) return false;
      if (statusFilter === "published" && p.published === false) return false;
      if (statusFilter === "draft" && p.published !== false) return false;
      const price = typeof p.price === "number" ? p.price : Number(p.price) || 0;
      if (priceFilter === "lt5k" && price >= 5000) return false;
      if (priceFilter === "5k15k" && (price < 5000 || price >= 15000)) return false;
      if (priceFilter === "gt15k" && price < 15000) return false;
      return true;
    });
  }, [products, searchQuery, categoryFilter, statusFilter, priceFilter]);

  useEffect(() => {
    setPage(0);
  }, [searchQuery, categoryFilter, statusFilter, priceFilter, products.length]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const pageSlice = useMemo(() => {
    const start = safePage * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, safePage]);

  const stats = useMemo(() => {
    const total = products.length;
    const published = products.filter((p) => p.published !== false).length;
    const draft = total - published;
    return { total, published, draft };
  }, [products]);

  const setPublished = useCallback(
    async (p: ProductRow, next: boolean) => {
      if (!token || togglingId) return;
      setTogglingId(p.id);
      setError(null);
      try {
        const res = await fetch(`/api/admin/products/${encodeURIComponent(p.id)}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ published: next }),
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          setError((j as { error?: string }).error ?? `Update failed (${res.status})`);
          return;
        }
        setProducts((prev) =>
          prev.map((x) => (x.id === p.id ? { ...x, published: next } : x)),
        );
      } finally {
        setTogglingId(null);
      }
    },
    [token, togglingId],
  );

  const removeProduct = useCallback(
    async (p: ProductRow) => {
      if (!token || deletingId) return;
      if (!window.confirm(`Delete “${p.name ?? p.id}”? This cannot be undone.`)) return;
      setDeletingId(p.id);
      setError(null);
      try {
        const res = await fetch(`/api/admin/products/${encodeURIComponent(p.id)}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          setError((j as { error?: string }).error ?? `Delete failed (${res.status})`);
          return;
        }
        setProducts((prev) => prev.filter((x) => x.id !== p.id));
        setSelected((s) => {
          const n = new Set(s);
          n.delete(p.id);
          return n;
        });
      } finally {
        setDeletingId(null);
      }
    },
    [token, deletingId],
  );

  const copyId = useCallback(async (p: ProductRow) => {
    try {
      await navigator.clipboard.writeText(p.id);
    } catch {
      setError("Could not copy to clipboard.");
    }
  }, []);

  const toggleSelect = (id: string) => {
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const toggleSelectAllPage = () => {
    const ids = pageSlice.map((p) => p.id);
    const allOn = ids.every((id) => selected.has(id));
    setSelected((s) => {
      const n = new Set(s);
      if (allOn) ids.forEach((id) => n.delete(id));
      else ids.forEach((id) => n.add(id));
      return n;
    });
  };

  const filterInputClass =
    "w-full border-0 border-b border-[var(--border-mid)] bg-transparent py-2 pl-8 font-[var(--font-dm-sans)] text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--sage)] focus:ring-0";

  return (
    <div className="relative">
      <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="mb-1 block font-[var(--font-cormorant)] text-sm font-medium uppercase tracking-[0.2em] text-[var(--sage-deep)]">
            Inventory
          </span>
          <h2 className="font-[var(--font-cormorant)] text-3xl font-semibold uppercase tracking-tight text-[var(--text-primary)] sm:text-4xl">
            Product catalog
          </h2>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center justify-center bg-[var(--sage)] px-8 py-3 font-[var(--font-cormorant)] text-sm font-medium uppercase tracking-widest text-[var(--off-white)] shadow-[var(--shadow-accent)] transition hover:bg-[var(--sage-deep)] active:opacity-90"
        >
          Add new product
        </Link>
      </header>

      {error && (
        <p
          className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-[var(--font-dm-sans)] text-sm text-red-800"
          role="alert"
        >
          {error}
        </p>
      )}

      <section className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="group relative overflow-hidden border-l-4 border-[var(--slate)] bg-[var(--bg-card)] p-8 shadow-[var(--shadow-sm)]">
          <div className="relative z-10">
            <p className="mb-1 font-[var(--font-cormorant)] text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">
              Total products
            </p>
            <h3 className="font-[var(--font-dm-sans)] text-4xl font-light text-[var(--text-primary)]">
              {loading ? "—" : stats.total}
            </h3>
          </div>
          <svg
            className="absolute -bottom-4 -right-4 h-24 w-24 text-[var(--slate)] opacity-[0.06] transition-opacity group-hover:opacity-[0.1]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1}
            aria-hidden
          >
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          </svg>
        </div>
        <div className="group relative overflow-hidden border-l-4 border-[var(--sage)] bg-[var(--bg-card)] p-8 shadow-[var(--shadow-sm)]">
          <div className="relative z-10">
            <p className="mb-1 font-[var(--font-cormorant)] text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">
              Published
            </p>
            <h3 className="font-[var(--font-dm-sans)] text-4xl font-light text-[var(--sage-deep)]">
              {loading ? "—" : stats.published}
            </h3>
          </div>
          <svg
            className="absolute -bottom-4 -right-4 h-24 w-24 text-[var(--sage)] opacity-[0.08] transition-opacity group-hover:opacity-[0.14]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1}
            aria-hidden
          >
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </div>
        <div className="group relative overflow-hidden border-l-4 border-[var(--red)] bg-[var(--bg-card)] p-8 shadow-[var(--shadow-sm)]">
          <div className="relative z-10">
            <p className="mb-1 font-[var(--font-cormorant)] text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">
              Draft / hidden
            </p>
            <h3 className="font-[var(--font-dm-sans)] text-4xl font-light text-[var(--red)]">
              {loading ? "—" : stats.draft}
            </h3>
          </div>
          <svg
            className="absolute -bottom-4 -right-4 h-24 w-24 text-[var(--red)] opacity-[0.08] transition-opacity group-hover:opacity-[0.14]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1}
            aria-hidden
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
        </div>
      </section>

      <section className="mb-8 flex flex-wrap items-end gap-4 border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-[var(--shadow-sm)]">
        <div className="relative min-w-[min(100%,280px)] flex-1">
          <svg
            className="pointer-events-none absolute bottom-2.5 left-0 h-5 w-5 text-[var(--text-muted)]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="search"
            className={filterInputClass}
            placeholder="Search by name, slug, or ID"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Filter by name or SKU"
          />
        </div>
        <div className="w-full min-w-[140px] sm:w-44">
          <label className="sr-only" htmlFor="admin-cat-filter">
            Category
          </label>
          <select
            id="admin-cat-filter"
            className={`${filterInputClass} pl-0`}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {getCollectionDisplayName(c, c)}
              </option>
            ))}
          </select>
        </div>
        <div className="w-full min-w-[120px] sm:w-36">
          <label className="sr-only" htmlFor="admin-status-filter">
            Status
          </label>
          <select
            id="admin-status-filter"
            className={`${filterInputClass} pl-0`}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          >
            <option value="all">Status: all</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
        <div className="w-full min-w-[120px] sm:w-40">
          <label className="sr-only" htmlFor="admin-price-filter">
            Price range
          </label>
          <select
            id="admin-price-filter"
            className={`${filterInputClass} pl-0`}
            value={priceFilter}
            onChange={(e) => setPriceFilter(e.target.value as typeof priceFilter)}
          >
            <option value="all">Price: all</option>
            <option value="lt5k">Under 5,000</option>
            <option value="5k15k">5,000 – 15,000</option>
            <option value="gt15k">15,000+</option>
          </select>
        </div>
      </section>

      <section className="overflow-hidden border border-[var(--border-mid)] bg-[var(--bg-card)] shadow-[var(--shadow-sm)]">
        <div className="divide-y divide-[var(--border)] md:hidden">
          {loading &&
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4">
                <div className="h-24 animate-pulse rounded-md bg-[var(--off-white-mid)]" />
              </div>
            ))}
          {!loading &&
            pageSlice.map((p) => {
              const published = p.published !== false;
              const src = thumbSrc(p);
              return (
                <article key={p.id} className="space-y-3 p-4 font-[var(--font-dm-sans)]">
                  <div className="flex items-start gap-3">
                    <div className="h-14 w-14 shrink-0 overflow-hidden border border-[var(--border)] bg-[var(--bg)]">
                      {src ? (
                        <img src={src} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] text-[var(--text-muted)]">
                          —
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/admin/products/${encodeURIComponent(p.id)}`}
                        className="block truncate text-sm font-semibold text-[var(--text-primary)] no-underline"
                      >
                        {p.name ?? p.id}
                      </Link>
                      <p className="text-[11px] text-[var(--text-muted)]">{p.id}</p>
                      <p className="mt-1 text-xs text-[var(--text-secondary)]">
                        {p.collectionSlug ? getCollectionDisplayName(p.collectionSlug, p.collectionSlug) : "—"} ·{" "}
                        {pkr.format(typeof p.price === "number" ? p.price : Number(p.price) || 0)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={togglingId === p.id}
                      onClick={() => void setPublished(p, !published)}
                      className="rounded-md border border-[var(--border-mid)] px-3 py-1.5 text-xs font-medium text-[var(--text-primary)] disabled:opacity-50"
                    >
                      {published ? "Published" : "Draft"}
                    </button>
                    <Link
                      href={`/admin/products/${encodeURIComponent(p.id)}`}
                      className="rounded-md border border-[var(--border-mid)] px-3 py-1.5 text-xs font-medium text-[var(--text-primary)] no-underline"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => void copyId(p)}
                      className="rounded-md border border-[var(--border-mid)] px-3 py-1.5 text-xs font-medium text-[var(--text-primary)]"
                    >
                      Copy ID
                    </button>
                    <button
                      type="button"
                      disabled={deletingId === p.id}
                      onClick={() => void removeProduct(p)}
                      className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-[var(--red)] disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              );
            })}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="bg-[var(--off-white-deep)]">
                <th className="w-12 p-4 text-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded-sm border-[var(--border-mid)] text-[var(--sage)] focus:ring-[var(--sage)]"
                    checked={pageSlice.length > 0 && pageSlice.every((p) => selected.has(p.id))}
                    onChange={toggleSelectAllPage}
                    aria-label="Select all on this page"
                  />
                </th>
                <th className="p-4 font-[var(--font-cormorant)] text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
                  Product
                </th>
                <th className="p-4 font-[var(--font-cormorant)] text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
                  Category
                </th>
                <th className="p-4 font-[var(--font-cormorant)] text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
                  Price
                </th>
                <th className="p-4 font-[var(--font-cormorant)] text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
                  Listing
                </th>
                <th className="p-4 font-[var(--font-cormorant)] text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
                  Status
                </th>
                <th className="p-4 text-right font-[var(--font-cormorant)] text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {loading &&
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="p-4">
                        <div className="h-10 animate-pulse rounded-md bg-[var(--off-white-mid)]" />
                      </td>
                    ))}
                  </tr>
                ))}
              {!loading &&
                pageSlice.map((p) => {
                  const published = p.published !== false;
                  const src = thumbSrc(p);
                  return (
                    <tr
                      key={p.id}
                      className="group transition-colors hover:bg-[var(--off-white-deep)]/80"
                    >
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded-sm border-[var(--border-mid)] text-[var(--sage)] focus:ring-[var(--sage)]"
                          checked={selected.has(p.id)}
                          onChange={() => toggleSelect(p.id)}
                          aria-label={`Select ${p.name ?? p.id}`}
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 shrink-0 overflow-hidden border border-[var(--border)] bg-[var(--bg)]">
                            {src ? (
                              <img src={src} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[10px] text-[var(--text-muted)]">
                                —
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={`/admin/products/${encodeURIComponent(p.id)}`}
                              className="block truncate font-[var(--font-dm-sans)] font-medium text-[var(--text-primary)] no-underline transition group-hover:text-[var(--sage-deep)]"
                            >
                              {p.name ?? p.id}
                            </Link>
                            <p className="text-[10px] uppercase tracking-tight text-[var(--text-muted)]">
                              ID: {p.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-[var(--font-dm-sans)] text-sm text-[var(--text-secondary)]">
                          {p.collectionSlug
                            ? getCollectionDisplayName(p.collectionSlug, p.collectionSlug)
                            : "—"}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-[var(--font-dm-sans)] text-sm font-semibold text-[var(--text-primary)]">
                          {pkr.format(typeof p.price === "number" ? p.price : Number(p.price) || 0)}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-1.5 w-1.5 shrink-0 rounded-full ${published ? "bg-[var(--sage)]" : "bg-[var(--text-muted)]"}`}
                          />
                          <span className="font-[var(--font-dm-sans)] text-sm text-[var(--text-secondary)]">
                            {published ? "Live on storefront" : "Hidden"}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <button
                          type="button"
                          disabled={togglingId === p.id}
                          onClick={() => void setPublished(p, !published)}
                          className="flex items-center gap-3 disabled:opacity-50"
                          aria-pressed={published}
                          aria-label={published ? "Mark as draft" : "Publish"}
                        >
                          <span
                            className={`relative inline-block h-5 w-10 shrink-0 rounded-full transition-colors ${published ? "bg-[var(--sage-muted)]" : "border border-[var(--border-mid)] bg-[var(--bg)]"}`}
                          >
                            <span
                              className={`absolute top-1 h-3 w-3 rounded-full transition-all duration-200 ${published ? "right-1 bg-[var(--sage)]" : "left-1 bg-[var(--text-muted)]"}`}
                            />
                          </span>
                          <span
                            className={`font-[var(--font-dm-sans)] text-xs font-medium uppercase tracking-widest ${published ? "text-[var(--sage-deep)]" : "text-[var(--text-muted)]"}`}
                          >
                            {published ? "Published" : "Draft"}
                          </span>
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2 text-[var(--text-muted)]">
                          <Link
                            href={`/admin/products/${encodeURIComponent(p.id)}`}
                            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg transition hover:bg-[var(--sage-muted)] hover:text-[var(--sage-deep)]"
                            aria-label="Edit"
                          >
                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </Link>
                          <button
                            type="button"
                            onClick={() => void copyId(p)}
                            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg transition hover:bg-[var(--sage-muted)] hover:text-[var(--sage-deep)]"
                            aria-label="Copy product ID"
                          >
                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            disabled={deletingId === p.id}
                            onClick={() => void removeProduct(p)}
                            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg transition hover:bg-red-50 hover:text-[var(--red)] disabled:opacity-50"
                            aria-label="Delete"
                          >
                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                              <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        <footer className="flex flex-col gap-4 border-t border-[var(--border)] bg-[var(--off-white-deep)]/60 p-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-[var(--font-dm-sans)] text-xs tracking-wide text-[var(--text-muted)]">
            {filtered.length === 0
              ? "No products match filters"
              : `Showing ${safePage * PAGE_SIZE + 1}-${Math.min((safePage + 1) * PAGE_SIZE, filtered.length)} of ${filtered.length}`}
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              disabled={safePage <= 0}
              onClick={() => setPage((x) => Math.max(0, x - 1))}
              className="border border-[var(--border-mid)] px-5 py-2 font-[var(--font-cormorant)] text-xs uppercase tracking-widest text-[var(--text-secondary)] transition hover:bg-[var(--bg-card)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={safePage >= pageCount - 1}
              onClick={() => setPage((x) => Math.min(pageCount - 1, x + 1))}
              className="border border-[var(--sage)] px-5 py-2 font-[var(--font-cormorant)] text-xs uppercase tracking-widest text-[var(--sage-deep)] transition hover:bg-[var(--sage-muted)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </footer>
      </section>

      {!loading && products.length === 0 && !error && (
        <p className="mt-8 rounded-2xl border border-dashed border-[var(--border-mid)] bg-[var(--bg-card)] p-8 text-center font-[var(--font-dm-sans)] text-sm text-[var(--text-muted)]">
          No products in Firestore. Run <code className="text-[var(--text-primary)]">npm run seed:firestore</code> or add
          one above.
        </p>
      )}

      <div
        className="pointer-events-none fixed -right-24 top-[18%] -z-10 select-none opacity-[0.04]"
        aria-hidden
      >
        <span className="font-[var(--font-cormorant)] text-[280px] leading-none text-[var(--sage)] sm:text-[400px]">
          ن
        </span>
      </div>
    </div>
  );
}
