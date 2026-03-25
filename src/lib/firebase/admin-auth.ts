import { getAdminAuth } from "@/lib/firebase/admin";

export type AdminUser = { uid: string; email?: string };

export async function verifyAdminBearer(request: Request): Promise<AdminUser> {
  const auth = getAdminAuth();
  if (!auth) {
    throw new Error("ADMIN_UNAVAILABLE");
  }
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) {
    throw new Error("NO_TOKEN");
  }
  const token = header.slice(7).trim();
  if (!token) {
    throw new Error("NO_TOKEN");
  }
  let decoded;
  try {
    decoded = await auth.verifyIdToken(token);
  } catch (cause: unknown) {
    if (process.env.NODE_ENV === "development") {
      console.error("[admin-auth] verifyIdToken failed:", cause);
    }
    throw new Error("INVALID_TOKEN", { cause });
  }
  if (decoded.admin !== true) {
    throw new Error("NOT_ADMIN");
  }
  return { uid: decoded.uid, email: decoded.email };
}
