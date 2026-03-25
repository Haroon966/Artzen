import { NextResponse } from "next/server";

export function adminAuthErrorResponse(e: unknown): NextResponse {
  const msg = e instanceof Error ? e.message : "";
  if (msg === "NO_TOKEN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (msg === "INVALID_TOKEN") {
    const dev = process.env.NODE_ENV === "development";
    let detail: string | undefined;
    if (dev && e instanceof Error && e.cause) {
      const c = e.cause;
      if (c instanceof Error) {
        detail = c.message;
      } else if (typeof c === "object" && c !== null && "code" in c) {
        const code = String((c as { code?: unknown }).code ?? "");
        const msg =
          "message" in c && typeof (c as { message?: unknown }).message === "string"
            ? (c as { message: string }).message
            : "";
        detail = [code, msg].filter(Boolean).join(": ");
      }
    }
    return NextResponse.json(
      {
        error: "Invalid or expired session",
        ...(detail ? { detail } : {}),
        ...(dev
          ? {
              hint:
                "If this happens right after sign-in, the Admin SDK is usually using a different Firebase project than NEXT_PUBLIC_FIREBASE_PROJECT_ID (wrong service account JSON). See FIREBASE_SETUP.md.",
            }
          : {}),
      },
      { status: 401 }
    );
  }
  if (msg === "NOT_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (msg === "ADMIN_UNAVAILABLE") {
    return NextResponse.json(
      { error: "Server missing Firebase Admin credentials" },
      { status: 503 }
    );
  }
  return NextResponse.json(
    {
      error: "Auth failed",
      ...(process.env.NODE_ENV === "development" ? { detail: msg } : {}),
    },
    { status: 500 }
  );
}

export function adminOperationErrorResponse(context: string, e: unknown): NextResponse {
  console.error(`[admin-api] ${context}`, e);
  const detail =
    process.env.NODE_ENV === "development" && e instanceof Error ? e.message : undefined;
  return NextResponse.json({ error: "Request failed", detail }, { status: 500 });
}
