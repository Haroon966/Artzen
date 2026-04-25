"use client";

import {
  isSubmissionError,
  type FieldValues,
  type SubmissionError,
} from "@formspree/core";
import { useSubmit } from "@formspree/react";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import {
  trackBeginCheckout,
  trackCheckoutFormStarted,
  trackCheckoutSubmitAttempt,
  trackCheckoutSubmitFailed,
  trackCheckoutValidationError,
  trackPurchase,
  trackWhatsAppFallbackClicked,
  trackWhatsAppOpenAttempt,
} from "@/lib/analytics";
import {
  getLastSavedCustomerForCheckout,
  saveCheckoutDeliveryToLocalStorage,
  saveOrderToHistory,
  type StoredOrderHistoryLine,
} from "@/lib/order-history-db";
import { getSiteOrigin, SITE_BRAND, whatsAppOrderLink } from "@/lib/site";

/** Formspree form key (the ID in https://formspree.io/f/…). Override with NEXT_PUBLIC_FORMSPREE_ID if needed. */
const FORMSPREE_FORM_ID =
  process.env.NEXT_PUBLIC_FORMSPREE_ID?.trim() || "xeepwlnq";
const LAST_ORDER_KEY = "artzen-last-order";
const PAKISTAN_CITIES = [
  "Karachi",
  "Lahore",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Quetta",
  "Hyderabad",
  "Sialkot",
] as const;
const DELIVERY_ESTIMATES: Record<string, string> = {
  karachi: "Rs. 250-350",
  lahore: "Rs. 250-350",
  islamabad: "Rs. 300-400",
  rawalpindi: "Rs. 300-400",
  faisalabad: "Rs. 300-420",
  multan: "Rs. 320-450",
  peshawar: "Rs. 350-500",
  quetta: "Rs. 400-600",
  hyderabad: "Rs. 280-380",
  sialkot: "Rs. 300-420",
};

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
    `${SITE_BRAND} order ${orderRef}`,
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

function deliveryEstimateForCity(city: string): string {
  if (!city.trim()) return "Usually Rs. 250-450 for major cities";
  const normalized = city.trim().toLowerCase();
  return DELIVERY_ESTIMATES[normalized] ?? "Usually Rs. 300-550 (final courier rate varies)";
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

/** When Formspree fails, still lets the customer send cart + address on WhatsApp. */
function buildManualWhatsAppMessage(
  formData: SuccessDetails["formData"],
  items: { name: string; quantity: number; price: number }[],
  totalPrice: number
): string {
  const orderSummary = buildOrderSummaryFromItems(items);
  const lines = [
    `${SITE_BRAND} order (website form could not send — please confirm manually)`,
    "",
    `Name: ${formData.name}`,
    `Phone: ${formData.phone}`,
    `City: ${formData.city}`,
    `Address: ${formData.address}`,
  ];
  if (formData.notes.trim()) lines.push(`Notes: ${formData.notes.trim()}`);
  lines.push("", "Items:", orderSummary, "", `Total: ${formatPrice(totalPrice)}`);
  return lines.join("\n");
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatFormspreeErrors(err: SubmissionError<FieldValues>): string {
  const parts: string[] = err.getFormErrors().map((e) => e.message);
  for (const [field, fieldErrs] of err.getAllFieldErrors()) {
    for (const fe of fieldErrs) {
      parts.push(`${String(field)}: ${fe.message}`);
    }
  }
  return parts.join(" ") || "Submission failed.";
}

function isDeliveryEmpty(data: {
  name: string;
  phone: string;
  city: string;
  address: string;
  notes: string;
}): boolean {
  return (
    !data.name.trim() &&
    !data.phone.trim() &&
    !data.city.trim() &&
    !data.address.trim() &&
    !data.notes.trim()
  );
}

export function CheckoutForm() {
  const submitOrder = useSubmit(FORMSPREE_FORM_ID);
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
  const [whatsAppOpened, setWhatsAppOpened] = useState(false);
  const copyResetRef = useRef<number | null>(null);
  const beginCheckoutTracked = useRef(false);
  const formStartedTracked = useRef(false);

  useEffect(() => {
    return () => {
      if (copyResetRef.current) window.clearTimeout(copyResetRef.current);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    void getLastSavedCustomerForCheckout().then((saved) => {
      if (cancelled || !saved) return;
      setFormData((prev) => {
        if (!isDeliveryEmpty(prev)) return prev;
        return {
          name: saved.name,
          phone: saved.phone,
          city: saved.city,
          address: saved.address,
          notes: saved.notes,
        };
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (items.length === 0 || beginCheckoutTracked.current) return;
    beginCheckoutTracked.current = true;
    trackBeginCheckout(items, totalPrice);
  }, [items, totalPrice]);

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
      for (const [field, message] of Object.entries(errors)) {
        trackCheckoutValidationError(field, message);
      }
      trackCheckoutSubmitFailed("validation");
      queueMicrotask(() => {
        const order = ["name", "phone", "city", "address"] as const;
        for (const id of order) {
          if (!errors[id]) continue;
          const el = document.getElementById(id);
          if (el) {
            el.focus();
            const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
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

  type EmailOutcome =
    | {
        ok: true;
        orderRef: string;
        orderSummaryText: string;
        totalFormatted: string;
      }
    | { ok: false; reason: "network" }
    | { ok: false; reason: "formspree"; detail: string };

  const sendOrderEmail = useCallback(async (): Promise<EmailOutcome> => {
    const orderRef = generateOrderRef();
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

    let result;
    try {
      result = await submitOrder({
        name: formData.name,
        phone: formData.phone,
        city: formData.city,
        address: formData.address,
        notes: formData.notes,
        order_ref: orderRef,
        order: orderSummary,
        order_lines_json: orderLinesJson,
        total: totalFormatted,
        _subject: `${SITE_BRAND} order ${orderRef} — ${formData.name}`,
      });
    } catch {
      return { ok: false, reason: "network" };
    }

    if (isSubmissionError(result)) {
      return {
        ok: false,
        reason: "formspree",
        detail: formatFormspreeErrors(result),
      };
    }

    return {
      ok: true,
      orderRef,
      orderSummaryText: orderSummary,
      totalFormatted,
    };
  }, [items, formData, totalPrice, submitOrder]);

  const applyEmailFailure = (outcome: Extract<EmailOutcome, { ok: false }>) => {
    setStatus("error");
    if (outcome.reason === "network") {
      setErrorDetail(
        "Network error — check your connection and try again, or contact us on WhatsApp."
      );
    } else {
      setErrorDetail(
        `${outcome.detail} Please try again in a moment or contact us on WhatsApp.`
      );
    }
  };

  const submitWithWhatsAppConfirmation = async () => {
    setErrorDetail(null);
    if (items.length === 0) {
      setStatus("error");
      setErrorDetail("Your cart is empty.");
      trackCheckoutSubmitFailed("empty_cart");
      return;
    }
    if (!runValidation()) {
      setStatus("idle");
      return;
    }

    setStatus("sending");
    trackCheckoutSubmitAttempt(items, totalPrice);
    const outcome = await sendOrderEmail();
    if (!outcome.ok) {
      applyEmailFailure(outcome);
      trackCheckoutSubmitFailed(outcome.reason);
      return;
    }

    trackPurchase(outcome.orderRef, items, totalPrice);
    applySuccess({
      orderRef: outcome.orderRef,
      formData: { ...formData },
      orderSummaryText: outcome.orderSummaryText,
      totalFormatted: outcome.totalFormatted,
    });

    const historyItems: StoredOrderHistoryLine[] = items.map((i) => ({
      id: i.id,
      slug: i.slug,
      name: i.name,
      quantity: i.quantity,
      unitPrice: i.price,
      lineTotal: i.price * i.quantity,
    }));
    const customerSnapshot = { ...formData };
    saveCheckoutDeliveryToLocalStorage(customerSnapshot);
    void saveOrderToHistory({
      orderRef: outcome.orderRef,
      createdAt: new Date().toISOString(),
      customer: customerSnapshot,
      items: historyItems,
      totalFormatted: outcome.totalFormatted,
      totalNumeric: totalPrice,
    }).catch(() => {
      // Non-blocking: checkout must succeed even if IndexedDB is unavailable
    });

    setWhatsAppOpened(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitWithWhatsAppConfirmation();
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
      `<html><head><title>${SITE_BRAND} order `,
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
            href={whatsAppOrderLink(
              `Hi ${SITE_BRAND} — I have a question before I order.`
            )}
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
        <div className="rounded-lg border border-emerald-900/15 bg-emerald-50/40 p-8" role="status" aria-live="polite">
          <h2 className="text-center font-serif text-xl font-semibold text-forest">
            Order received
          </h2>
          <p className="mt-4 text-center text-sm font-semibold uppercase tracking-wide text-forest/90">
            Your order reference
          </p>
          <p className="mt-1 text-center font-mono text-xl font-semibold tracking-wide text-forest sm:text-2xl">
            {successDetails.orderRef}
          </p>
          <p className="mt-2 text-center text-sm text-forest/80">
            Quote this reference in WhatsApp so we can match your order quickly.
          </p>
          <p className="mt-3 text-center text-sm text-forest/75">
            Your order is confirmed on the website. Share your reference on WhatsApp for faster
            updates and delivery confirmation.
          </p>
          <p className="sr-only" aria-live="polite">
            {copyFeedback ? "Order reference copied to clipboard." : ""}
          </p>
          {copyFeedback ? (
            <p className="mt-2 text-center text-xs font-medium text-emerald-800" role="status">
              Reference copied — paste it in WhatsApp if needed.
            </p>
          ) : null}
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

          <p className="mt-6 text-center text-sm text-forest/70">
            Questions about delivery fees or timelines? See{" "}
            <Link
              href="/cod"
              className="font-medium text-forest underline underline-offset-2 hover:text-forest/90"
            >
              Cash on Delivery
            </Link>
            ,{" "}
            <Link
              href="/shipping-policy"
              className="font-medium text-forest underline underline-offset-2 hover:text-forest/90"
            >
              Shipping policy
            </Link>
            , and{" "}
            <Link
              href="/returns-policy"
              className="font-medium text-forest underline underline-offset-2 hover:text-forest/90"
            >
              Returns policy
            </Link>
            .
          </p>
          {whatsAppOpened ? (
            <p className="mt-2 text-center text-xs text-forest/65">
              WhatsApp opened. If it did not launch, use the button below any time.
            </p>
          ) : null}
        </div>
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
          <a
            href={waHref}
            onClick={() => {
              trackWhatsAppOpenAttempt("reopen");
              setWhatsAppOpened(true);
            }}
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

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 space-y-6"
      noValidate
      aria-describedby={
        Object.keys(fieldErrors).length > 0 ? "checkout-field-errors" : undefined
      }
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
        <p className="mb-4 font-[var(--font-dm-sans)] text-[11px] font-semibold uppercase tracking-[0.08em] text-forest/60">
          Cart → Details → Confirmed
        </p>
        <h2 className="font-serif text-lg font-semibold text-forest">
          Order summary
        </h2>
        <ul className="mt-2 space-y-1 text-sm text-forest/80">
          {items.map((i) => (
            <li key={i.id} className="break-words">
              {i.name} × {i.quantity} — {formatPrice(i.price * i.quantity)}
            </li>
          ))}
        </ul>
        <p className="mt-4 font-semibold text-forest">
          Total: {formatPrice(totalPrice)}
        </p>
        <p className="mt-3 text-xs leading-relaxed text-forest/65">
          Totals reflect checkout prices. Delivery charges depend on city and are confirmed before
          dispatch. No hidden charges are added after confirmation.
        </p>
        <p className="mt-2 text-xs leading-relaxed text-forest/60">
          Nationwide COD — pay the courier when your parcel arrives.{" "}
          <Link href="/cod" className="font-medium text-forest underline underline-offset-2">
            Delivery &amp; COD details
          </Link>
        </p>
        <p className="mt-2 text-xs leading-relaxed text-forest/60">
          Estimated delivery fee:{" "}
          <span className="font-medium text-forest/80">{deliveryEstimateForCity(formData.city)}</span>
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
        <p className="mt-2 rounded-md border border-emerald-900/10 bg-emerald-50/50 px-3 py-2 text-xs leading-relaxed text-forest/75">
          After your first order on this device, we save your delivery details here so you can edit
          and reuse them next time.
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
                if (!formStartedTracked.current) {
                  formStartedTracked.current = true;
                  trackCheckoutFormStarted();
                }
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
                if (!formStartedTracked.current) {
                  formStartedTracked.current = true;
                  trackCheckoutFormStarted();
                }
                const cleaned = e.target.value.replace(/[^\d+\s()-]/g, "");
                setFormData((p) => ({ ...p, phone: cleaned }));
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
            list="city-suggestions"
            value={formData.city}
            onChange={(e) => {
              if (!formStartedTracked.current) {
                formStartedTracked.current = true;
                trackCheckoutFormStarted();
              }
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
          <datalist id="city-suggestions">
            {PAKISTAN_CITIES.map((city) => (
              <option key={city} value={city} />
            ))}
          </datalist>
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
              if (!formStartedTracked.current) {
                formStartedTracked.current = true;
                trackCheckoutFormStarted();
              }
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
      {status === "error" && errorDetail && (
        <div
          className="rounded-lg border border-red-200 bg-red-50/80 p-4 text-sm text-red-900"
          role="alert"
          aria-live="assertive"
        >
          <p className="font-medium">Could not place order</p>
          <p className="mt-1">{errorDetail}</p>
          <p className="mt-2 text-red-900/90">
            You can still send your cart and address on WhatsApp — we&apos;ll process it manually.
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <a
              href={whatsAppOrderLink(
                buildManualWhatsAppMessage(formData, items, totalPrice)
              )}
              onClick={() => {
                trackWhatsAppOpenAttempt("fallback");
                trackWhatsAppFallbackClicked();
              }}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-md bg-[#25D366] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#20bd5a]"
            >
              Send order on WhatsApp (fallback)
            </a>
            <a
              href={whatsAppOrderLink(
                `Hi ${SITE_BRAND} — I tried to place an order on the website but got an error. My name: ${formData.name || "—"}. Phone: ${formData.phone || "—"}.`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-md border border-red-300 bg-white px-4 py-2.5 text-sm font-medium text-red-900 underline-offset-2 hover:underline"
            >
              Quick message (no cart details)
            </a>
          </div>
        </div>
      )}
      <p className="rounded-lg border border-[#25D366]/30 bg-[#25D366]/10 p-3 text-sm text-[#0f5f55]">
        Submitting places your order on the website immediately. WhatsApp opens as an optional fast
        follow-up channel.
      </p>
      <p className="text-xs text-forest/60">
        By placing the order you agree to our{" "}
        <Link href="/terms" className="underline underline-offset-2">
          Terms
        </Link>
        {" "}and{" "}
        <Link href="/privacy-policy" className="underline underline-offset-2">
          Privacy Policy
        </Link>
        .
      </p>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <button
          type="submit"
          disabled={status === "sending"}
          className="rounded-md bg-[#25D366] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#20bd5a] disabled:opacity-50"
        >
          {status === "sending"
            ? "Placing order..."
            : "Place order securely"}
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
