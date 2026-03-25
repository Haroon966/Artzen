import { NextResponse } from "next/server";
import {
  adminAuthErrorResponse,
  adminOperationErrorResponse,
} from "@/lib/admin-route-errors";
import { verifyAdminBearer } from "@/lib/firebase/admin-auth";
import { getAdminDb } from "@/lib/firebase/admin";

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
    const snap = await db.collection("orders").orderBy("createdAt", "desc").limit(200).get();
    const orders = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ orders });
  } catch (e) {
    return adminOperationErrorResponse("GET /api/admin/orders", e);
  }
}
