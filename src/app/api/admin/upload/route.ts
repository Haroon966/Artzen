import { NextResponse } from "next/server";
import {
  adminAuthErrorResponse,
  adminOperationErrorResponse,
} from "@/lib/admin-route-errors";
import { verifyAdminBearer } from "@/lib/firebase/admin-auth";
import { getAdminBucket } from "@/lib/firebase/admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    await verifyAdminBearer(request);
  } catch (e) {
    return adminAuthErrorResponse(e);
  }

  const bucket = getAdminBucket();
  if (!bucket) {
    return NextResponse.json({ error: "Storage unavailable" }, { status: 503 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart form" }, { status: 400 });
  }

  const file = formData.get("file");
  const productIdRaw = formData.get("productId");
  const productId =
    typeof productIdRaw === "string" && productIdRaw.trim() ? productIdRaw.trim() : "misc";

  if (!file || !(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const maxBytes = 8 * 1024 * 1024;
  if (file.size > maxBytes) {
    return NextResponse.json({ error: "File too large (max 8MB)" }, { status: 400 });
  }

  const orig = file.name || "upload";
  const ext = orig.includes(".") ? orig.split(".").pop()!.toLowerCase().slice(0, 8) : "bin";
  const safeExt = /^[a-z0-9]+$/.test(ext) ? ext : "bin";
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${safeExt}`;
  const objectPath = `products/${productId}/${name}`;

  const buf = Buffer.from(await file.arrayBuffer());
  const fileRef = bucket.file(objectPath);

  try {
    await fileRef.save(buf, {
      contentType: file.type || "application/octet-stream",
      resumable: false,
      metadata: {
        cacheControl: "public, max-age=31536000",
      },
    });
  } catch (e) {
    return adminOperationErrorResponse("POST /api/admin/upload (save)", e);
  }

  let publicUrl: string;
  try {
    await fileRef.makePublic();
    publicUrl = `https://storage.googleapis.com/${bucket.name}/${objectPath}`;
  } catch {
    try {
      const [signed] = await fileRef.getSignedUrl({
        action: "read",
        expires: Date.now() + 1000 * 60 * 60 * 24 * 365 * 5,
      });
      publicUrl = signed;
    } catch (e) {
      return adminOperationErrorResponse("POST /api/admin/upload (signed URL)", e);
    }
  }

  return NextResponse.json({ url: publicUrl, path: objectPath });
}
