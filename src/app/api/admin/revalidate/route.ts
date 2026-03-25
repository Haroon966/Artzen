import { NextResponse } from "next/server";
import { adminAuthErrorResponse } from "@/lib/admin-route-errors";
import { verifyAdminBearer } from "@/lib/firebase/admin-auth";
import { revalidateCatalogCache } from "@/lib/revalidate-catalog";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    await verifyAdminBearer(request);
  } catch (e) {
    return adminAuthErrorResponse(e);
  }

  revalidateCatalogCache();
  return NextResponse.json({ ok: true });
}
