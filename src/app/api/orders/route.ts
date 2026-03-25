import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";

export const runtime = "nodejs";

type OrderLine = {
  id: string;
  slug: string;
  name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  product_url?: string;
};

function isOrderLine(x: unknown): x is OrderLine {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.slug === "string" &&
    typeof o.name === "string" &&
    typeof o.quantity === "number" &&
    typeof o.unit_price === "number" &&
    typeof o.line_total === "number"
  );
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const orderRef =
    typeof b.orderRef === "string" && b.orderRef.length >= 4 ? b.orderRef : null;
  const customer = b.customer;
  if (!customer || typeof customer !== "object") {
    return NextResponse.json({ error: "Missing customer" }, { status: 400 });
  }
  const c = customer as Record<string, unknown>;
  const name = typeof c.name === "string" ? c.name.trim() : "";
  const phone = typeof c.phone === "string" ? c.phone.trim() : "";
  const city = typeof c.city === "string" ? c.city.trim() : "";
  const address = typeof c.address === "string" ? c.address.trim() : "";
  const notes = typeof c.notes === "string" ? c.notes.trim() : "";
  if (name.length < 2 || phone.length < 5 || city.length < 2 || address.length < 5) {
    return NextResponse.json({ error: "Invalid customer fields" }, { status: 400 });
  }

  const linesRaw = b.lines;
  if (!Array.isArray(linesRaw) || !linesRaw.every(isOrderLine)) {
    return NextResponse.json({ error: "Invalid lines" }, { status: 400 });
  }

  const totalAmount = typeof b.totalAmount === "number" ? b.totalAmount : Number(b.totalAmount);
  if (!Number.isFinite(totalAmount) || totalAmount < 0) {
    return NextResponse.json({ error: "Invalid total" }, { status: 400 });
  }

  const totalFormatted =
    typeof b.totalFormatted === "string" ? b.totalFormatted : String(totalAmount);

  const db = getAdminDb();
  if (!db) {
    return NextResponse.json({
      ok: true,
      persisted: false,
      orderRef: orderRef ?? `AZ-${Date.now()}`,
    });
  }

  const ref =
    orderRef ??
    `AZ-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}${String(new Date().getDate()).padStart(2, "0")}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  try {
    await db.collection("orders").add({
      orderRef: ref,
      status: "new",
      customer: { name, phone, city, address, notes },
      lines: linesRaw,
      totalAmount,
      totalFormatted,
      createdAt: FieldValue.serverTimestamp(),
    });
    return NextResponse.json({ ok: true, persisted: true, orderRef: ref });
  } catch {
    return NextResponse.json({ error: "Failed to save order" }, { status: 500 });
  }
}
