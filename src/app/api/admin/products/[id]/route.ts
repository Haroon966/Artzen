import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import {
  adminAuthErrorResponse,
  adminOperationErrorResponse,
} from "@/lib/admin-route-errors";
import { verifyAdminBearer } from "@/lib/firebase/admin-auth";
import { getAdminDb } from "@/lib/firebase/admin";
import { revalidateCatalogCache } from "@/lib/revalidate-catalog";

export const runtime = "nodejs";

type Props = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Props) {
  try {
    await verifyAdminBearer(request);
  } catch (e) {
    return adminAuthErrorResponse(e);
  }

  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const p = body as Record<string, unknown>;
  const db = getAdminDb();
  if (!db) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const doc: Record<string, unknown> = {
    id,
    updatedAt: FieldValue.serverTimestamp(),
  };

  const stringFields = [
    "slug",
    "name",
    "description",
    "longDescription",
    "image",
    "cardImage",
    "hoverImage",
    "collectionSlug",
    "material",
    "dimensions",
  ] as const;
  for (const k of stringFields) {
    if (typeof p[k] === "string") doc[k] = p[k];
  }
  const toFiniteNumber = (v: unknown): number | null => {
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string" && v.trim().length > 0) {
      const n = Number(v);
      if (Number.isFinite(n)) return n;
    }
    return null;
  };

  const basePrice = toFiniteNumber(p.price);
  const salePrice = toFiniteNumber(p.salePrice);

  if (basePrice != null && basePrice > 0 && salePrice != null && salePrice > 0 && salePrice < basePrice) {
    doc.originalPrice = basePrice;
    doc.price = salePrice;
    doc.salePrice = salePrice;
    doc.discountPercent = Math.round(((basePrice - salePrice) / basePrice) * 100);
  } else if (basePrice != null) {
    doc.price = basePrice;
    if (salePrice != null) doc.salePrice = salePrice;
    if (typeof p.originalPrice === "number") doc.originalPrice = p.originalPrice;
    if (p.discountPercent == null) doc.discountPercent = FieldValue.delete();
  }

  if (typeof p.originalPrice === "number") doc.originalPrice = p.originalPrice;
  if (Array.isArray(p.images)) {
    doc.images = p.images.filter((x): x is string => typeof x === "string");
  }
  if (typeof p.isNew === "boolean") doc.isNew = p.isNew;
  if (typeof p.published === "boolean") doc.published = p.published;
  if (typeof p.sku === "string") doc.sku = p.sku;
  if (typeof p.stock === "number") doc.stock = p.stock;
  if (typeof p.lowStockAlert === "number") doc.lowStockAlert = p.lowStockAlert;

  try {
    await db.collection("products").doc(id).set(doc, { merge: true });
    revalidateCatalogCache();
    return NextResponse.json({ ok: true });
  } catch (e) {
    return adminOperationErrorResponse("PUT /api/admin/products/[id]", e);
  }
}

export async function DELETE(request: Request, { params }: Props) {
  try {
    await verifyAdminBearer(request);
  } catch (e) {
    return adminAuthErrorResponse(e);
  }

  const { id } = await params;
  const db = getAdminDb();
  if (!db) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  try {
    await db.collection("products").doc(id).delete();
    revalidateCatalogCache();
    return NextResponse.json({ ok: true });
  } catch (e) {
    return adminOperationErrorResponse("DELETE /api/admin/products/[id]", e);
  }
}
