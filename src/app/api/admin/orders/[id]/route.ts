import { NextResponse } from "next/server";
import {
  adminAuthErrorResponse,
  adminOperationErrorResponse,
} from "@/lib/admin-route-errors";
import { verifyAdminBearer } from "@/lib/firebase/admin-auth";
import { getAdminDb } from "@/lib/firebase/admin";

export const runtime = "nodejs";

type Props = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Props) {
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

  const status =
    body && typeof body === "object" && typeof (body as { status?: string }).status === "string"
      ? (body as { status: string }).status
      : null;

  if (!status || !["new", "processing", "shipped", "cancelled"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const db = getAdminDb();
  if (!db) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  try {
    await db.collection("orders").doc(id).update({ status });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return adminOperationErrorResponse("PATCH /api/admin/orders/[id]", e);
  }
}
