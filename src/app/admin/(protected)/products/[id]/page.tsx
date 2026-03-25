"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { getClientAuth } from "@/lib/firebase/client";

type ProductDoc = Record<string, unknown> & { id?: string };

export default function AdminProductEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "";
  const [token, setToken] = useState<string | null>(null);
  const [doc, setDoc] = useState<ProductDoc | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState("");

  useEffect(() => {
    const auth = getClientAuth();
    if (!auth) return;
    return onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setToken(null);
        return;
      }
      setToken(await user.getIdToken());
    });
  }, []);

  const load = useCallback(async () => {
    if (!token || !id) return;
    setLoading(true);
    setError(null);
    const res = await fetch("/api/admin/products", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      setError("Failed to load products");
      setLoading(false);
      return;
    }
    const data = (await res.json()) as { products?: ProductDoc[] };
    const p = (data.products ?? []).find((x) => x.id === id);
    if (!p) {
      setError("Product not found");
      setLoading(false);
      return;
    }
    const fromImages = Array.isArray(p.images)
      ? p.images.filter((x): x is string => typeof x === "string" && x.trim().length > 0)
      : [];
    const mainImage = typeof p.image === "string" ? p.image : "";
    const cardImage = typeof p.cardImage === "string" ? p.cardImage : mainImage;
    const merged = Array.from(new Set([cardImage, ...fromImages])).filter(Boolean);
    const effectiveBasePrice =
      typeof p.originalPrice === "number" && p.originalPrice > 0
        ? p.originalPrice
        : typeof p.price === "number"
          ? p.price
          : 0;
    const effectiveSalePrice =
      typeof p.originalPrice === "number" && typeof p.price === "number" && p.price < p.originalPrice
        ? p.price
        : typeof p.salePrice === "number"
          ? p.salePrice
          : 0;

    setDoc({
      ...p,
      image: cardImage,
      cardImage,
      images: merged,
      price: effectiveBasePrice,
      salePrice: effectiveSalePrice,
    });
    setLoading(false);
  }, [token, id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function save() {
    if (!token || !doc) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/products/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(doc),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError((j as { error?: string }).error ?? "Save failed");
        return;
      }
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  function getImagesFromDoc(d: ProductDoc | null): string[] {
    if (!d || !Array.isArray(d.images)) return [];
    return d.images.filter((x): x is string => typeof x === "string" && x.trim().length > 0);
  }

  function updateImages(next: string[]) {
    const clean = next.map((x) => x.trim()).filter(Boolean);
    setDoc((d) => {
      if (!d) return d;
      const currentPrimary = typeof d.cardImage === "string" ? d.cardImage : "";
      const currentImage = typeof d.image === "string" ? d.image : "";
      const currentHover = typeof d.hoverImage === "string" ? d.hoverImage : "";
      const cardImage = clean.includes(currentPrimary)
        ? currentPrimary
        : clean.includes(currentImage)
          ? currentImage
          : clean[0] ?? "";
      const hoverImage =
        currentHover && clean.includes(currentHover) && currentHover !== cardImage ? currentHover : "";
      return {
        ...d,
        images: clean,
        image: cardImage,
        cardImage,
        hoverImage,
      };
    });
  }

  function addImageUrl() {
    const v = newImageUrl.trim();
    if (!v) return;
    const current = getImagesFromDoc(doc);
    if (!current.includes(v)) updateImages([...current, v]);
    setNewImageUrl("");
  }

  function removeImage(url: string) {
    const current = getImagesFromDoc(doc);
    updateImages(current.filter((x) => x !== url));
  }

  function assignCardImage(url: string) {
    setDoc((d) => (d ? { ...d, image: url, cardImage: url } : d));
  }

  function assignHoverImage(url: string) {
    const card = str("cardImage") || str("image");
    if (url === card) return;
    setField("hoverImage", url);
  }

  async function onUpload(file: File | null) {
    if (!file || !token || !id) return;
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("productId", id);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) {
        setError("Upload failed");
        return;
      }
      const data = (await res.json()) as { url?: string };
      if (data.url) {
        const current = getImagesFromDoc(doc);
        const next = current.includes(data.url) ? current : [...current, data.url];
        updateImages(next);
      }
    } finally {
      setUploading(false);
    }
  }

  if (!doc || loading) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-[var(--shadow-sm)]">
        <div className="h-4 w-32 animate-pulse rounded bg-[var(--off-white-deep)]" />
        <div className="mt-3 h-8 w-56 animate-pulse rounded bg-[var(--off-white-deep)]" />
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-11 animate-pulse rounded-xl bg-[var(--off-white-deep)]" />
          ))}
        </div>
        <p className="mt-4 font-[var(--font-dm-sans)] text-sm text-[var(--text-muted)]">
          {error ?? "Loading…"}
        </p>
      </div>
    );
  }

  const str = (k: string) => (typeof doc[k] === "string" ? (doc[k] as string) : "");
  const num = (k: string) => (typeof doc[k] === "number" ? (doc[k] as number) : 0);
  const images = getImagesFromDoc(doc);

  function setField(k: string, v: string | number | boolean) {
    setDoc((d) => (d ? { ...d, [k]: v } : d));
  }

  const createdAt =
    typeof doc.createdAt === "string"
      ? doc.createdAt
      : typeof doc.createdAtLabel === "string"
        ? doc.createdAtLabel
        : "Unknown";
  const updatedAt =
    typeof doc.updatedAt === "string"
      ? doc.updatedAt
      : typeof doc.updatedAtLabel === "string"
        ? doc.updatedAtLabel
        : "Just now";
  const basePriceValue = num("price");
  const salePriceValue = num("salePrice");
  const discountPct =
    basePriceValue > 0 && salePriceValue > 0 && salePriceValue < basePriceValue
      ? Math.round(((basePriceValue - salePriceValue) / basePriceValue) * 100)
      : 0;

  return (
    <section className="max-w-[1300px] text-[#1c1c1e]">
      <div className="mb-8">
        <nav className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8e8e93]">
          <Link href="/admin/products" className="transition-colors hover:text-[#c9a84c]">
            Products
          </Link>
          <span>/</span>
          <span className="text-[#1c1c1e]">Edit Product</span>
          <span>/</span>
          <span className="max-w-[220px] truncate text-[#1c1c1e]">{str("name") || id}</span>
        </nav>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <h1 className="font-[var(--font-cormorant)] text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
            Edit Product: {str("name") || id}
          </h1>
          <div className="flex gap-3">
            <Link
              href="/admin/products"
              className="border border-[#d1d1d6] px-5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#1c1c1e] transition hover:bg-[#f2f2f7]"
            >
              Discard
            </Link>
            <button
              type="button"
              disabled={saving}
              onClick={() => void save()}
              className="bg-[#c9a84c] px-6 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white shadow-[0_10px_24px_-12px_rgba(201,168,76,0.6)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Updating..." : "Update Product"}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <p
          className="mb-6 rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          role="alert"
        >
          {error}
        </p>
      )}

      <div className="grid grid-cols-12 gap-6 lg:gap-8">
        <div className="col-span-12 space-y-6 lg:col-span-8">
          <section className="rounded-sm bg-white p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] sm:p-8">
            <h2 className="mb-6 font-[var(--font-cormorant)] text-2xl font-semibold text-[#c9a84c]">
              Basic Information
            </h2>
            <div className="space-y-6">
              <label className="block">
                <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-[#8e8e93]">Product Name</span>
                <input
                  className="w-full border-0 border-b border-[#d1d1d6] bg-transparent px-0 py-3 font-[var(--font-cormorant)] text-2xl text-[#1c1c1e] outline-none transition-colors focus:border-[#c9a84c]"
                  value={str("name")}
                  onChange={(e) => setField("name", e.target.value)}
                />
              </label>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-[#8e8e93]">Slug</span>
                  <input
                    className="w-full border-0 border-b border-[#d1d1d6] bg-transparent px-0 py-2 text-sm font-semibold text-[#1c1c1e] outline-none transition-colors focus:border-[#c9a84c]"
                    value={str("slug")}
                    onChange={(e) => setField("slug", e.target.value)}
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-[#8e8e93]">SKU</span>
                  <input
                    className="w-full border-0 border-b border-[#d1d1d6] bg-transparent px-0 py-2 text-sm font-semibold text-[#1c1c1e] outline-none transition-colors focus:border-[#c9a84c]"
                    value={str("sku")}
                    onChange={(e) => setField("sku", e.target.value)}
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-[#8e8e93]">Description</span>
                <textarea
                  rows={6}
                  className="w-full rounded-sm border border-[#d1d1d6] bg-white p-4 text-sm leading-relaxed text-[#1c1c1e] outline-none transition-colors focus:border-[#c9a84c]"
                  value={str("longDescription") || str("description")}
                  onChange={(e) => setField("longDescription", e.target.value)}
                />
              </label>
            </div>
          </section>

          <section className="rounded-sm bg-white p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-[var(--font-cormorant)] text-2xl font-semibold text-[#c9a84c]">Media Gallery</h2>
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8e8e93]">{images.length} image(s)</span>
            </div>

            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
              <input
                className="w-full border-0 border-b border-[#d1d1d6] bg-transparent px-0 py-2 text-sm text-[#1c1c1e] outline-none transition-colors focus:border-[#c9a84c]"
                placeholder="Paste image URL..."
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={addImageUrl}
                  className="border border-[#d1d1d6] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#1c1c1e] transition hover:bg-[#f2f2f7]"
                >
                  Add URL
                </button>
                <label className="cursor-pointer border border-dashed border-[#c9a84c]/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#c9a84c] transition hover:bg-[#c9a84c]/5">
                  {uploading ? "Uploading..." : "Upload"}
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploading}
                    className="hidden"
                    onChange={(e) => onUpload(e.target.files?.[0] ?? null)}
                  />
                </label>
              </div>
            </div>

            {images.length === 0 ? (
              <p className="rounded-sm border border-dashed border-[#d1d1d6] bg-[#f8f8fa] px-4 py-6 text-center text-sm text-[#8e8e93]">
                No media yet. Add URL(s) or upload an image.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {images.map((img) => {
                  const isCard = (str("cardImage") || str("image")) === img;
                  const isHover = str("hoverImage") === img;
                  return (
                    <div key={img} className="group overflow-hidden rounded-sm border border-[#e4e4e7] bg-[#f8f8fa]">
                      <img src={img} alt="" className="aspect-square w-full object-cover" />
                      <div className="space-y-2 p-2">
                        <button
                          type="button"
                          onClick={() => assignCardImage(img)}
                          className={`w-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${
                            isCard
                              ? "bg-[#1c1c1e] text-white"
                              : "border border-[#d1d1d6] text-[#1c1c1e] hover:bg-[#f2f2f7]"
                          }`}
                        >
                          {isCard ? "Featured" : "Set Featured"}
                        </button>
                        <button
                          type="button"
                          onClick={() => assignHoverImage(img)}
                          disabled={isCard}
                          className={`w-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${
                            isHover
                              ? "bg-[#c9a84c] text-white"
                              : "border border-[#d1d1d6] text-[#1c1c1e] hover:bg-[#f2f2f7]"
                          } disabled:cursor-not-allowed disabled:opacity-50`}
                        >
                          Hover Image
                        </button>
                        <button
                          type="button"
                          onClick={() => removeImage(img)}
                          className="w-full border border-red-200 bg-red-50 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        <div className="col-span-12 space-y-6 lg:col-span-4">
          <section className="rounded-sm bg-white p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] sm:p-8">
            <h3 className="mb-6 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8e8e93]">Status & Visibility</h3>
            <label className="flex cursor-pointer items-center justify-between">
              <span className="text-sm font-semibold text-[#1c1c1e]">Published</span>
              <input
                type="checkbox"
                checked={doc.published !== false}
                onChange={(e) => setField("published", e.target.checked)}
                className="h-4 w-4 border-[#d1d1d6] text-[#c9a84c] focus:ring-[#c9a84c]"
              />
            </label>
            <p className="mt-2 text-xs text-[#8e8e93]">
              {doc.published !== false ? "Visible on storefront" : "Saved as draft"}
            </p>
          </section>

          <section className="rounded-sm bg-white p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] sm:p-8">
            <h3 className="mb-6 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8e8e93]">Pricing & Inventory</h3>
            <div className="space-y-5">
              <label className="block">
                <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-[#8e8e93]">Base Price (PKR)</span>
                <input
                  type="number"
                  className="w-full border-0 border-b border-[#d1d1d6] bg-transparent px-0 py-2 text-lg font-semibold text-[#1c1c1e] outline-none transition-colors focus:border-[#c9a84c]"
                  value={basePriceValue || ""}
                  onChange={(e) => setField("price", Number(e.target.value))}
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-[#8e8e93]">Sale Price (PKR)</span>
                <input
                  type="number"
                  className="w-full border-0 border-b border-[#d1d1d6] bg-transparent px-0 py-2 text-lg font-semibold text-[#c9a84c] outline-none transition-colors focus:border-[#c9a84c]"
                  value={salePriceValue || ""}
                  onChange={(e) => setField("salePrice", Number(e.target.value))}
                />
              </label>
              {discountPct > 0 && (
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#c9a84c]">
                  Auto discount: {discountPct}% off
                </p>
              )}
              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-[#8e8e93]">Stock</span>
                  <input
                    type="number"
                    className="w-full border-0 border-b border-[#d1d1d6] bg-transparent px-0 py-2 text-sm font-semibold text-[#1c1c1e] outline-none transition-colors focus:border-[#c9a84c]"
                    value={num("stock") || ""}
                    onChange={(e) => setField("stock", Number(e.target.value))}
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-[#8e8e93]">Low Alert</span>
                  <input
                    type="number"
                    className="w-full border-0 border-b border-[#d1d1d6] bg-transparent px-0 py-2 text-sm font-semibold text-[#1c1c1e] outline-none transition-colors focus:border-[#c9a84c]"
                    value={num("lowStockAlert") || ""}
                    onChange={(e) => setField("lowStockAlert", Number(e.target.value))}
                  />
                </label>
              </div>
              <label className="block">
                <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-[#8e8e93]">Category Slug</span>
                <input
                  className="w-full border-0 border-b border-[#d1d1d6] bg-transparent px-0 py-2 text-sm font-semibold text-[#1c1c1e] outline-none transition-colors focus:border-[#c9a84c]"
                  value={str("collectionSlug")}
                  onChange={(e) => setField("collectionSlug", e.target.value)}
                />
              </label>
            </div>
          </section>

          <section className="rounded-sm border border-[#d1d1d6]/40 bg-[#f5f5f7] p-6">
            <div className="space-y-3 text-[10px] font-bold uppercase tracking-[0.15em] text-[#8e8e93]">
              <div className="flex items-center justify-between">
                <span>Created At</span>
                <span className="text-[#1c1c1e]">{createdAt}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Last Modified</span>
                <span className="text-[#1c1c1e]">{updatedAt}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Product ID</span>
                <span className="max-w-[130px] truncate text-[#c9a84c]">{id}</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
