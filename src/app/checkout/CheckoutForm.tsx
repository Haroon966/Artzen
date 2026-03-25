"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { getSiteOrigin, whatsAppOrderLink } from "@/lib/site";

const FORMSPREE_ID = process.env.NEXT_PUBLIC_FORMSPREE_ID || "";
const HAS_FIREBASE_PROJECT = Boolean(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
const LAST_ORDER_KEY = "artzen-last-order";

function formatPrice(price: number) {
  return `Rs. ${price.toLocaleString("en-PK")}`;
}

function generateOrderRef(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `AZ-${y}${m}${day}-${rand}`;
}

type SuccessDetails = {
  orderRef: string;
  formData: {
    name: string;
    phone: string;
    city: string;
    address: string;
    notes: string;
  };
  orderSummaryText: string;
  totalFormatted: string;
};

function buildWhatsAppMessage(details: SuccessDetails): string {
  const { orderRef, formData, orderSummaryText, totalFormatted } = details;
  const lines = [
    `Artzen order ${orderRef}`,
    "",
    `Name: ${formData.name}`,
    `Phone: ${formData.phone}`,
    `City: ${formData.city}`,
    `Address: ${formData.address}`,
  ];
  if (formData.notes.trim()) lines.push(`Notes: ${formData.notes.trim()}`);
  lines.push("", "Items:", orderSummaryText, "", `Total: ${totalFormatted}`);
  return lines.join("\n");
}

function digitsOnly(s: string): string {
  return s.replace(/\D/g, "");
}

function validateCheckoutFields(data: SuccessDetails["formData"]): Record<string, string> {
  const errors: Record<string, string> = {};
  const name = data.name.trim();
  if (name.length < 2) {
    errors.name = "Enter your full name (at least 2 characters).";
  }
  const phoneDigits = digitsOnly(data.phone);
  if (phoneDigits.length < 10) {
    errors.phone =
      "Enter a valid mobile number (at least 10 digits). Use the same number you use on WhatsApp if possible.";
  } else if (phoneDigits.length > 15) {
    errors.phone =
      "That number looks too long. Use 10–15 digits (country code without extra prefixes).";
  }
  const city = data.city.trim();
  if (city.length < 2) {
    errors.city = "Enter your city.";
  }
  const address = data.address.trim();
  if (address.length < 10) {
    errors.address =
      "Enter your full delivery address (area, street, house — at least 10 characters).";
  }
  return errors;
}

function buildOrderSummaryFromItems(
  items: { name: string; quantity: number; price: number }[]
): string {
  return items
    .map(
      (i) =>
        `${i.name} × ${i.quantity} = ${formatPrice(i.price * i.quantity)}`
    )
    .join("\n");
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function CheckoutForm() {
  const { items, totalPrice, clearCart } = useCart();
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">(
    "idle"
  );
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [successDetails, setSuccessDetails] = useState<SuccessDetails | null>(
    null
  );
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    city: "",
    address: "",
    notes: "",
  });
  const [copyFeedback, setCopyFeedback] = useState(false);
  const copyResetRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (copyResetRef.current) window.clearTimeout(copyResetRef.current);
    };
  }, []);

  useEffect(() => {
    if (status !== "success" || !successDetails) return;
    try {
      sessionStorage.setItem(
        LAST_ORDER_KEY,
        JSON.stringify({
          orderRef: successDetails.orderRef,
          savedAt: new Date().toISOString(),
        })
      );
    } catch {
      // ignore quota / private mode
    }
  }, [status, successDetails]);

  const runValidation = (): boolean => {
    const errors = validateCheckoutFields(formData);
    setFieldErrors(errors);
    const ok = Object.keys(errors).length === 0;
    if (!ok) {
      queueMicrotask(() => {
        const order = ["name", "phone", "city", "address"] as const;
        for (const id of order) {
          if (!errors[id]) continue;
          const el = document.getElementById(id);
          if (el) {
            el.focus();
            el.scrollIntoView({ behavior: "smooth", block: "center" });
          }
          break;
        }
      });
    }
    return ok;
  };

  const applySuccess = (details: SuccessDetails) => {
    setSuccessDetails(details);
    setStatus("success");
    setFieldErrors({});
    setErrorDetail(null);
    clearCart();
  };

  const submitViaWhatsApp = () => {
    setErrorDetail(null);
    if (items.length === 0) {
      setStatus("error");
      setErrorDetail("Your cart is empty.");
      return;
    }
    if (!runValidation()) {
      setStatus("idle");
      return;
    }
    const orderRef = generateOrderRef();
    const orderSummary = buildOrderSummaryFromItems(items);
    const totalFormatted = formatPrice(totalPrice);
    applySuccess({
      orderRef,
      formData: { ...formData },
      orderSummaryText: orderSummary,
      totalFormatted,
    });
    const href = whatsAppOrderLink(
      buildWhatsAppMessage({
        orderRef,
        formData: { ...formData },
        orderSummaryText: orderSummary,
        totalFormatted,
      })
    );
    window.open(href, "_blank", "noopener,noreferrer");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorDetail(null);
    if (!runValidation()) {
      return;
    }
    if (items.length === 0) {
      setStatus("error");
      setErrorDetail("Your cart is empty.");
      return;
    }

    setStatus("sending");
    let orderRef = generateOrderRef();
    const origin = getSiteOrigin();

    const orderLines = items.map((i) => {
      const lineTotal = i.price * i.quantity;
      return {
        id: i.id,
        slug: i.slug,
        name: i.name,
        quantity: i.quantity,
        unit_price: i.price,
        line_total: lineTotal,
        product_url: `${origin}/products/${encodeURIComponent(i.slug)}`,
      };
    });

    const orderSummary = buildOrderSummaryFromItems(items);
    const orderLinesJson = JSON.stringify(orderLines, null, 0);
    const totalFormatted = formatPrice(totalPrice);

    let persisted = false;
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderRef,
          customer: { ...formData },
          lines: orderLines,
          totalAmount: totalPrice,
          totalFormatted,
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as { orderRef?: string; persisted?: boolean };
        if (typeof data.orderRef === "string" && data.orderRef.length >= 4) {
          orderRef = data.orderRef;
        }
        persisted = data.persisted === true;
      }
    } catch {
      // network — may still succeed via Formspree
    }

    let formspreeOk = !FORMSPREE_ID;
    if (FORMSPREE_ID) {
      try {
        const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            order_ref: orderRef,
            order: orderSummary,
            order_lines_json: orderLinesJson,
            total: totalFormatted,
            _subject: `Artzen order ${orderRef} — ${formData.name}`,
          }),
        });
        formspreeOk = res.ok;
        if (!res.ok) {
          const code = res.status;
          let hint = "";
          if (code === 422) {
            hint =
              " The form may be misconfigured in Formspree (e.g. required fields).";
          } else if (code >= 500) {
            hint = " Formspree may be temporarily unavailable.";
          }
          if (!persisted) {
            setStatus("error");
            setErrorDetail(
              `We could not send your order (HTTP ${code}).${hint} Please try again in a moment or send your order via WhatsApp below.`
            );
            return;
          }
        }
      } catch {
        if (!persisted) {
          setStatus("error");
          setErrorDetail(
            "Network error — check your connection and try again, or contact us on WhatsApp."
          );
          return;
        }
      }
    }

    if (!persisted && !formspreeOk) {
      setStatus("error");
      setErrorDetail(
        "Orders are not configured: set up Firebase (see FIREBASE_SETUP.md) and/or NEXT_PUBLIC_FORMSPREE_ID, or send your order on WhatsApp."
      );
      return;
    }

    applySuccess({
      orderRef,
      formData: { ...formData },
      orderSummaryText: orderSummary,
      totalFormatted,
    });
  };

  const copyOrderRef = async (ref: string) => {
    try {
      await navigator.clipboard.writeText(ref);
      setCopyFeedback(true);
      if (copyResetRef.current) window.clearTimeout(copyResetRef.current);
      copyResetRef.current = window.setTimeout(() => setCopyFeedback(false), 2500);
    } catch {
      // ignore — e.g. denied clipboard permission
    }
  };

  const printConfirmation = (details: SuccessDetails) => {
    const w = window.open("", "_blank");
    if (!w) return;
    const body = [
      "<html><head><title>Artzen order ",
      details.orderRef,
      "</title></head><body style='font-family:sans-serif;padding:24px'>",
      "<h1>Order ",
      details.orderRef,
      "</h1>",
      "<p><strong>Name:</strong> ",
      escapeHtml(details.formData.name),
      "</p>",
      "<p><strong>Phone:</strong> ",
      escapeHtml(details.formData.phone),
      "</p>",
      "<p><strong>City:</strong> ",
      escapeHtml(details.formData.city),
      "</p>",
      "<p><strong>Address:</strong><br>",
      escapeHtml(details.formData.address).replace(/\n/g, "<br>"),
      "</p>",
      "<pre style='white-space:pre-wrap'>",
      escapeHtml(details.orderSummaryText),
      "</pre>",
      "<p><strong>Total:</strong> ",
      escapeHtml(details.totalFormatted),
      "</p>",
      "</body></html>",
    ].join("");
    w.document.write(body);
    w.document.close();
    w.print();
  };

  if (items.length === 0 && status !== "success") {
    return (
      <div className="mt-8 rounded-lg border border-amber-900/10 bg-white p-8 text-center">
        <p className="text-forest/70">Your cart is empty.</p>
        <Link
          href="/shop"
          className="mt-4 inline-block rounded-md bg-forest px-5 py-2.5 text-sm font-medium text-cream transition hover:bg-forest/90"
        >
          Continue shopping
        </Link>
        <p className="mt-4 text-sm text-forest/60">
          Need help?{" "}
          <a
            href={whatsAppOrderLink("Hi Artzen — I have a question before I order.")}
            className="font-medium text-forest underline hover:text-forest/90"
            target="_blank"
            rel="noopener noreferrer"
          >
            Message us on WhatsApp
          </a>
        </p>
      </div>
    );
  }

  if (status === "success" && successDetails) {
    const waHref = whatsAppOrderLink(buildWhatsAppMessage(successDetails));
    return (
      <div className="mt-8 space-y-6">
        <div
          className="rounded-lg border border-emerald-900/15 bg-emerald-50/40 p-8"
          role="status"
          aria-live="polite"
        >
          <h2 className="text-center font-serif text-xl font-semibold text-forest">
            Order received
          </h2>
          <p className="mt-3 text-center font-mono text-lg font-semibold tracking-wide text-forest">
            {successDetails.orderRef}
          </p>
          <p className="mt-2 text-center text-sm text-forest/80">
            Save this reference if you contact us about your order.
          </p>
          <p className="sr-only" aria-live="polite">
            {copyFeedback ? "Order reference copied to clipboard." : ""}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => copyOrderRef(successDetails.orderRef)}
              className="rounded-md border border-forest/25 bg-white px-4 py-2 text-sm font-medium text-forest transition hover:bg-forest/5"
            >
              {copyFeedback ? "Copied!" : "Copy reference"}
            </button>
            <button
              type="button"
              onClick={() => printConfirmation(successDetails)}
              className="rounded-md border border-forest/25 bg-white px-4 py-2 text-sm font-medium text-forest transition hover:bg-forest/5"
            >
              Print summary
            </button>
          </div>

          <ol className="mx-auto mt-8 max-w-md list-none space-y-4 p-0 text-left text-sm text-forest/90">
            <li className="flex gap-3">
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-xs font-bold text-white"
                aria-hidden
              >
                1
              </span>
              <div>
                <p className="font-semibold text-forest">Order placed</p>
                <p className="text-forest/75">
                  We have your delivery details and cart summary.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-forest/15 text-xs font-bold text-forest"
                aria-hidden
              >
                2
              </span>
              <div>
                <p className="font-semibold text-forest">Confirmation</p>
                <p className="text-forest/75">
                  Our team confirms availability and delivery — usually within 1–2
                  business days.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-forest/15 text-xs font-bold text-forest"
                aria-hidden
              >
                3
              </span>
              <div>
                <p className="font-semibold text-forest">Packed &amp; shipped</p>
                <p className="text-forest/75">
                  Your order is packed carefully and sent to your address.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-forest/15 text-xs font-bold text-forest"
                aria-hidden
              >
                4
              </span>
              <div>
                <p className="font-semibold text-forest">Pay on delivery</p>
                <p className="text-forest/75">
                  <strong>Cash on Delivery</strong> — pay the courier when your
                  parcel arrives.
                </p>
              </div>
            </li>
          </ol>

          <p className="mt-6 text-center text-sm text-forest/70">
            Questions anytime? Message us on WhatsApp — include your order reference.
          </p>
        </div>
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-md bg-[#25D366] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#20bd5a]"
          >
            Open WhatsApp with order details
          </a>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-forest/30 px-6 py-3 text-sm font-medium text-forest transition hover:bg-forest/5"
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  const showConfigHint = !FORMSPREE_ID && !HAS_FIREBASE_PROJECT;

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 space-y-6"
      noValidate
      aria-describedby={showConfigHint ? "checkout-config-hint" : undefined}
    >
      <div
        id="checkout-field-errors"
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      >
        {Object.keys(fieldErrors).length > 0
          ? `Please fix: ${Object.values(fieldErrors).join(" ")}`
          : ""}
      </div>

      <div className="rounded-lg border border-amber-900/10 bg-white p-6">
        <h2 className="font-serif text-lg font-semibold text-forest">
          Order summary
        </h2>
        <ul className="mt-2 space-y-1 text-sm text-forest/80">
          {items.map((i) => (
            <li key={i.id}>
              {i.name} × {i.quantity} — {formatPrice(i.price * i.quantity)}
            </li>
          ))}
        </ul>
        <p className="mt-4 font-semibold text-forest">
          Total: {formatPrice(totalPrice)}
        </p>
      </div>
      <div className="rounded-lg border border-amber-900/10 bg-white p-6">
        <h2 className="font-serif text-lg font-semibold text-forest">
          Delivery details (Cash on Delivery)
        </h2>
        <p className="mt-2 text-sm text-forest/70">
          Use a phone number you use on{" "}
          <span className="font-medium text-forest/90">WhatsApp</span> so we can
          reach you quickly.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-forest">
              Full name *
            </label>
            <input
              id="name"
              name="name"
              required
              autoComplete="name"
              value={formData.name}
              onChange={(e) => {
                setFormData((p) => ({ ...p, name: e.target.value }));
                if (fieldErrors.name)
                  setFieldErrors((fe) => {
                    const next = { ...fe };
                    delete next.name;
                    return next;
                  });
              }}
              aria-invalid={Boolean(fieldErrors.name)}
              aria-describedby={fieldErrors.name ? "name-error" : undefined}
              className="mt-1 w-full rounded border border-amber-900/20 px-3 py-2 text-forest aria-invalid:border-red-400"
            />
            {fieldErrors.name && (
              <p id="name-error" className="mt-1 text-sm text-red-800" role="alert">
                {fieldErrors.name}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-forest">
              Phone *
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              autoComplete="tel"
              inputMode="tel"
              placeholder="03XX XXXXXXX"
              value={formData.phone}
              onChange={(e) => {
                setFormData((p) => ({ ...p, phone: e.target.value }));
                if (fieldErrors.phone)
                  setFieldErrors((fe) => {
                    const next = { ...fe };
                    delete next.phone;
                    return next;
                  });
              }}
              aria-invalid={Boolean(fieldErrors.phone)}
              aria-describedby={fieldErrors.phone ? "phone-error" : undefined}
              className="mt-1 w-full rounded border border-amber-900/20 px-3 py-2 text-forest aria-invalid:border-red-400"
            />
            {fieldErrors.phone && (
              <p id="phone-error" className="mt-1 text-sm text-red-800" role="alert">
                {fieldErrors.phone}
              </p>
            )}
          </div>
        </div>
        <div className="mt-4">
          <label htmlFor="city" className="block text-sm font-medium text-forest">
            City *
          </label>
          <input
            id="city"
            name="city"
            required
            autoComplete="address-level2"
            value={formData.city}
            onChange={(e) => {
              setFormData((p) => ({ ...p, city: e.target.value }));
              if (fieldErrors.city)
                setFieldErrors((fe) => {
                  const next = { ...fe };
                  delete next.city;
                  return next;
                });
            }}
            aria-invalid={Boolean(fieldErrors.city)}
            aria-describedby={fieldErrors.city ? "city-error" : undefined}
            className="mt-1 w-full rounded border border-amber-900/20 px-3 py-2 text-forest aria-invalid:border-red-400"
          />
          {fieldErrors.city && (
            <p id="city-error" className="mt-1 text-sm text-red-800" role="alert">
              {fieldErrors.city}
            </p>
          )}
        </div>
        <div className="mt-4">
          <label htmlFor="address" className="block text-sm font-medium text-forest">
            Full address *
          </label>
          <textarea
            id="address"
            name="address"
            required
            rows={3}
            autoComplete="street-address"
            value={formData.address}
            onChange={(e) => {
              setFormData((p) => ({ ...p, address: e.target.value }));
              if (fieldErrors.address)
                setFieldErrors((fe) => {
                  const next = { ...fe };
                  delete next.address;
                  return next;
                });
            }}
            aria-invalid={Boolean(fieldErrors.address)}
            aria-describedby={fieldErrors.address ? "address-error" : undefined}
            className="mt-1 w-full rounded border border-amber-900/20 px-3 py-2 text-forest aria-invalid:border-red-400"
          />
          {fieldErrors.address && (
            <p id="address-error" className="mt-1 text-sm text-red-800" role="alert">
              {fieldErrors.address}
            </p>
          )}
        </div>
        <div className="mt-4">
          <label htmlFor="notes" className="block text-sm font-medium text-forest">
            Notes (optional)
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={2}
            value={formData.notes}
            onChange={(e) =>
              setFormData((p) => ({ ...p, notes: e.target.value }))
            }
            className="mt-1 w-full rounded border border-amber-900/20 px-3 py-2 text-forest"
          />
        </div>
      </div>
      {showConfigHint && (
        <p id="checkout-config-hint" className="text-sm text-amber-900">
          Online form submission is optional. You can{" "}
          <strong>send your order on WhatsApp</strong> with the button below — fill
          in your details first so we can deliver.
        </p>
      )}
      {status === "error" && errorDetail && (
        <div
          className="rounded-lg border border-red-200 bg-red-50/80 p-4 text-sm text-red-900"
          role="alert"
          aria-live="assertive"
        >
          <p className="font-medium">Could not place order</p>
          <p className="mt-1">{errorDetail}</p>
          <a
            href={whatsAppOrderLink(
              `Hi Artzen — I tried to place an order on the website but got an error. My name: ${formData.name || "—"}. Phone: ${formData.phone || "—"}.`
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block font-medium text-red-800 underline hover:text-red-950"
          >
            Message us on WhatsApp
          </a>
        </div>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <button
          type="submit"
          disabled={status === "sending"}
          title={
            showConfigHint
              ? "Configure Firebase and/or Formspree for online submit, or use WhatsApp"
              : undefined
          }
          className="rounded-md bg-forest px-6 py-3 text-sm font-medium text-cream transition hover:bg-forest/90 disabled:opacity-50"
        >
          {status === "sending" ? "Placing order…" : "Place order (COD)"}
        </button>
        <button
          type="button"
          disabled={status === "sending"}
          onClick={submitViaWhatsApp}
          className="rounded-md border-2 border-[#25D366] bg-[#25D366]/10 px-6 py-3 text-sm font-semibold text-[#128C7E] transition hover:bg-[#25D366]/15 disabled:opacity-50"
        >
          Send order on WhatsApp
        </button>
        <Link
          href="/cart"
          className="inline-flex items-center justify-center rounded-md border border-forest/30 px-6 py-3 text-sm font-medium text-forest transition hover:bg-forest/5"
        >
          ← Back to cart
        </Link>
      </div>
    </form>
  );
}
