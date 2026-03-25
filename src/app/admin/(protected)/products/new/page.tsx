"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { getClientAuth } from "@/lib/firebase/client";

export default function AdminNewProductPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [id, setId] = useState("");
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [collectionSlug, setCollectionSlug] = useState("");
  const [image, setImage] = useState("");
  const [published, setPublished] = useState(true);

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

  const submit = useCallback(async () => {
    if (!token || busy) return;
    const idTrim = id.trim();
    const slugTrim = slug.trim();
    if (!idTrim || !slugTrim) {
      setError("Document ID and slug are required.");
      return;
    }
    const priceNum = Number(price.replace(/,/g, "")) || 0;
    setBusy(true);
    setError(null);
    let res = await fetch("/api/admin/products", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: idTrim,
        slug: slugTrim,
        name: name.trim() || slugTrim,
        price: priceNum,
        collectionSlug: collectionSlug.trim(),
        image: image.trim(),
        published,
      }),
    });
    if (res.status === 401) {
      const auth = getClientAuth();
      const refreshed = auth?.currentUser ? await auth.currentUser.getIdToken(true) : null;
      if (refreshed) {
        setToken(refreshed);
        res = await fetch("/api/admin/products", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${refreshed}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: idTrim,
            slug: slugTrim,
            name: name.trim() || slugTrim,
            price: priceNum,
            collectionSlug: collectionSlug.trim(),
            image: image.trim(),
            published,
          }),
        });
      }
    }
    if (!res.ok) {
      if (res.status === 401) {
        const auth = getClientAuth();
        if (auth) await signOut(auth);
        router.replace("/admin/login");
        setBusy(false);
        return;
      }
      const j = await res.json().catch(() => ({}));
      setError((j as { error?: string }).error ?? `HTTP ${res.status}`);
      setBusy(false);
      return;
    }
    router.push(`/admin/products/${encodeURIComponent(idTrim)}`);
    router.refresh();
  }, [token, busy, id, slug, name, price, collectionSlug, image, published, router]);

  return (
    <div className="mx-auto max-w-lg">
      <p className="font-[var(--font-dm-sans)] text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--sage-deep)]">
        Catalog
      </p>
      <h1 className="font-[var(--font-cormorant)] text-3xl font-semibold sm:text-4xl">New product</h1>
      <p className="mt-2 font-[var(--font-dm-sans)] text-sm text-[var(--text-secondary)]">
        Creates a Firestore document. You can add images and copy on the next screen.
      </p>

      {error && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {error}
        </p>
      )}

      <form
        className="mt-8 space-y-4 font-[var(--font-dm-sans)] text-sm"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <div>
          <label className="mb-1 block text-[var(--text-secondary)]" htmlFor="np-id">
            Document ID <span className="text-[var(--red)]">*</span>
          </label>
          <input
            id="np-id"
            className="w-full border border-[var(--border-mid)] bg-[var(--bg)] px-3 py-2 text-[var(--text-primary)] outline-none focus:border-[var(--sage)]"
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="e.g. my-product-001"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-[var(--text-secondary)]" htmlFor="np-slug">
            Slug <span className="text-[var(--red)]">*</span>
          </label>
          <input
            id="np-slug"
            className="w-full border border-[var(--border-mid)] bg-[var(--bg)] px-3 py-2 text-[var(--text-primary)] outline-none focus:border-[var(--sage)]"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="url-slug"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-[var(--text-secondary)]" htmlFor="np-name">
            Name
          </label>
          <input
            id="np-name"
            className="w-full border border-[var(--border-mid)] bg-[var(--bg)] px-3 py-2 text-[var(--text-primary)] outline-none focus:border-[var(--sage)]"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-[var(--text-secondary)]" htmlFor="np-price">
            Price (PKR)
          </label>
          <input
            id="np-price"
            type="text"
            inputMode="decimal"
            className="w-full border border-[var(--border-mid)] bg-[var(--bg)] px-3 py-2 text-[var(--text-primary)] outline-none focus:border-[var(--sage)]"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0"
          />
        </div>
        <div>
          <label className="mb-1 block text-[var(--text-secondary)]" htmlFor="np-collection">
            Collection slug
          </label>
          <input
            id="np-collection"
            className="w-full border border-[var(--border-mid)] bg-[var(--bg)] px-3 py-2 text-[var(--text-primary)] outline-none focus:border-[var(--sage)]"
            value={collectionSlug}
            onChange={(e) => setCollectionSlug(e.target.value)}
            placeholder="matches Firestore collection slug"
          />
        </div>
        <div>
          <label className="mb-1 block text-[var(--text-secondary)]" htmlFor="np-image">
            Image URL
          </label>
          <input
            id="np-image"
            className="w-full border border-[var(--border-mid)] bg-[var(--bg)] px-3 py-2 text-[var(--text-primary)] outline-none focus:border-[var(--sage)]"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="https://…"
          />
        </div>
        <label className="flex cursor-pointer items-center gap-2">
          <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
          Published on storefront
        </label>
        <div className="flex flex-wrap gap-3 pt-4">
          <button
            type="submit"
            disabled={busy || !token}
            className="bg-[var(--sage)] px-6 py-2.5 text-[var(--off-white)] transition hover:bg-[var(--sage-deep)] disabled:opacity-50"
          >
            {busy ? "Saving…" : "Create product"}
          </button>
          <Link
            href="/admin/products"
            className="border border-[var(--border-mid)] px-6 py-2.5 text-[var(--text-primary)] no-underline transition hover:bg-[var(--bg)]"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
