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

type Props = { params: Promise<{ slug: string }> };

export async function PUT(request: Request, { params }: Props) {
  try {
    await verifyAdminBearer(request);
  } catch (e) {
    return adminAuthErrorResponse(e);
  }

  const { slug } = await params;
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
  const db = getAdminDb();
  if (!db) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const doc: Record<string, unknown> = {
    slug,
    updatedAt: FieldValue.serverTimestamp(),
  };

  if (typeof c.name === "string") doc.name = c.name;
  if (typeof c.description === "string") doc.description = c.description;
  if (typeof c.image === "string") doc.image = c.image;
  if (Array.isArray(c.productIds)) {
    doc.productIds = c.productIds.filter((x): x is string => typeof x === "string");
  }
  if (typeof c.published === "boolean") doc.published = c.published;

  try {
    await db.collection("collections").doc(slug).set(doc, { merge: true });
    revalidateCatalogCache();
    return NextResponse.json({ ok: true });
  } catch (e) {
    return adminOperationErrorResponse("PUT /api/admin/collections/[slug]", e);
  }
}

export async function DELETE(request: Request, { params }: Props) {
  try {
    await verifyAdminBearer(request);
  } catch (e) {
    return adminAuthErrorResponse(e);
  }

  const { slug } = await params;
  const db = getAdminDb();
  if (!db) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  try {
    await db.collection("collections").doc(slug).delete();
    revalidateCatalogCache();
    return NextResponse.json({ ok: true });
  } catch (e) {
    return adminOperationErrorResponse("DELETE /api/admin/collections/[slug]", e);
  }
}
