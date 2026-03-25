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
    const snap = await db.collection("collections").get();
    const collections = snap.docs.map((d) => ({ ...d.data(), id: d.id }));
    return NextResponse.json({ collections });
  } catch (e) {
    return adminOperationErrorResponse("GET /api/admin/collections", e);
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

  const c = body as Record<string, unknown>;
  const slug = typeof c.slug === "string" ? c.slug : null;
  if (!slug) {
    return NextResponse.json({ error: "slug required" }, { status: 400 });
  }

  const db = getAdminDb();
  if (!db) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const doc: Record<string, unknown> = {
    slug,
    name: typeof c.name === "string" ? c.name : slug,
    description: typeof c.description === "string" ? c.description : "",
    productIds: Array.isArray(c.productIds)
      ? c.productIds.filter((x): x is string => typeof x === "string")
      : [],
    published: c.published === false ? false : true,
    updatedAt: FieldValue.serverTimestamp(),
  };

  if (typeof c.image === "string") doc.image = c.image;

  try {
    await db.collection("collections").doc(slug).set(doc, { merge: true });
    revalidateCatalogCache();
    return NextResponse.json({ ok: true, slug });
  } catch (e) {
    return adminOperationErrorResponse("POST /api/admin/collections", e);
  }
}
