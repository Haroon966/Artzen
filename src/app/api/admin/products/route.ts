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

export async function GET(request: Request) {
  try {
    await verifyAdminBearer(request);
  } catch (e) {
    return adminAuthErrorResponse(e);
  }

  const db = getAdminDb();
  if (!db) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  try {
    const snap = await db.collection("products").get();
    const products = snap.docs.map((d) => ({ ...d.data(), id: d.id }));
    return NextResponse.json({ products });
  } catch (e) {
    return adminOperationErrorResponse("GET /api/admin/products", e);
  }
}

export async function POST(request: Request) {
  try {
    await verifyAdminBearer(request);
  } catch (e) {
    return adminAuthErrorResponse(e);
  }

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
  const id = typeof p.id === "string" ? p.id : null;
  const slug = typeof p.slug === "string" ? p.slug : null;
  if (!id || !slug) {
    return NextResponse.json({ error: "id and slug required" }, { status: 400 });
  }

  const db = getAdminDb();
  if (!db) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const doc = {
    id,
    slug,
    name: typeof p.name === "string" ? p.name : "",
    description: typeof p.description === "string" ? p.description : "",
    longDescription: typeof p.longDescription === "string" ? p.longDescription : "",
    price: typeof p.price === "number" ? p.price : Number(p.price) || 0,
    image: typeof p.image === "string" ? p.image : "",
    collectionSlug: typeof p.collectionSlug === "string" ? p.collectionSlug : "",
    published: p.published === false ? false : true,
    updatedAt: FieldValue.serverTimestamp(),
  } as Record<string, unknown>;

  if (typeof p.originalPrice === "number") doc.originalPrice = p.originalPrice;
  if (Array.isArray(p.images)) {
    doc.images = p.images.filter((x): x is string => typeof x === "string");
  }
  if (typeof p.cardImage === "string") doc.cardImage = p.cardImage;
  if (typeof p.hoverImage === "string") doc.hoverImage = p.hoverImage;
  if (typeof p.material === "string") doc.material = p.material;
  if (typeof p.dimensions === "string") doc.dimensions = p.dimensions;
  if (p.isNew === true) doc.isNew = true;

  try {
    await db.collection("products").doc(id).set(doc, { merge: true });
    revalidateCatalogCache();
    return NextResponse.json({ ok: true, id });
  } catch (e) {
    return adminOperationErrorResponse("POST /api/admin/products", e);
  }
}
