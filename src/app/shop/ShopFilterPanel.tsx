"use client";

import { useId, useState } from "react";
import type { ShopTypeFacetRow } from "@/lib/shop-types";

export type { ShopTypeFacetRow } from "@/lib/shop-types";

function formatRsAmount(n: number): string {
  return n.toLocaleString("en-PK");
}

function AccordionSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();
  const headingId = useId();

  return (
    <div className="border-b border-black/[0.08] pb-4 pt-1 last:border-b-0 last:pb-0">
      <button
        type="button"
        id={headingId}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 py-2 text-left font-[var(--font-dm-sans)] text-[14px] font-semibold text-[var(--dark)]/90 transition hover:text-[var(--dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/35 focus-visible:ring-offset-2"
      >
        <span>{title}</span>
        <span
          className={`inline-block text-[var(--dark)]/45 transition-transform duration-200 ${
            open ? "-rotate-180" : ""
          }`}
          aria-hidden
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </button>
      <div
        id={panelId}
        role="region"
        aria-labelledby={headingId}
        hidden={!open}
        className={open ? "pt-1" : ""}
      >
        {open ? children : null}
      </div>
    </div>
  );
}

const inputClass =
  "min-w-0 flex-1 rounded-[10px] border border-black/[0.1] bg-white px-2.5 py-2 font-[var(--font-dm-sans)] text-[13px] text-[var(--dark)] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.08)] placeholder:text-[var(--dark)]/35 focus:border-[var(--gold)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/25";

export function ShopFilterPanel({
  maxPrice,
  typeRows,
  selectedFacetIds,
  onToggleFacet,
  priceFrom,
  priceTo,
  onPriceFromChange,
  onPriceToChange,
  className = "",
  /** Disambiguate checkbox ids when two panels mount (e.g. drawer + sidebar during resize). */
  facetControlPrefix = "f-",
}: {
  maxPrice: number;
  typeRows: ShopTypeFacetRow[];
  selectedFacetIds: string[];
  onToggleFacet: (id: string, checked: boolean) => void;
  priceFrom: string;
  priceTo: string;
  onPriceFromChange: (v: string) => void;
  onPriceToChange: (v: string) => void;
  className?: string;
  facetControlPrefix?: string;
}) {
  const fromId = useId();
  const toId = useId();
  const priceHelperId = useId();
  const selectedSet = new Set(selectedFacetIds);

  return (
    <div className={`font-[var(--font-dm-sans)] ${className}`}>
      <h2 className="pb-2 font-[var(--font-dm-sans)] text-[15px] font-semibold text-[var(--dark)]/90">
        Filter:
      </h2>
      <div className="border-b border-black/[0.08] pb-3" />

      <AccordionSection title="Price">
        <p id={priceHelperId} className="mb-3 text-[13px] text-[var(--dark)]/55">
          The highest price is Rs.{formatRsAmount(maxPrice)}
        </p>
        <div className="flex flex-wrap items-stretch gap-2">
          <span
            className="flex shrink-0 items-center rounded-[10px] border border-black/[0.08] bg-[var(--cream-soft)]/80 px-2.5 py-2 text-[13px] font-medium text-[var(--dark)]/70"
            aria-hidden
          >
            Rs
          </span>
          <div className="flex min-w-0 flex-1 gap-2">
            <label htmlFor={fromId} className="sr-only">
              Minimum price
            </label>
            <input
              id={fromId}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="From"
              value={priceFrom}
              onChange={(e) => onPriceFromChange(e.target.value)}
              aria-describedby={priceHelperId}
              className={inputClass}
            />
            <label htmlFor={toId} className="sr-only">
              Maximum price
            </label>
            <input
              id={toId}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="To"
              value={priceTo}
              onChange={(e) => onPriceToChange(e.target.value)}
              aria-describedby={priceHelperId}
              className={inputClass}
            />
          </div>
        </div>
      </AccordionSection>

      {typeRows.length > 0 ? (
        <AccordionSection title="Type">
          <fieldset className="mt-1 border-0 p-0">
            <legend className="sr-only">Filter by type</legend>
            <ul className="space-y-2.5">
              {typeRows.map((row) => {
                const checked = selectedSet.has(row.id);
                const cbId = `${facetControlPrefix}shop-facet-${row.id}`;
                return (
                  <li key={row.id} className="flex items-start gap-2.5">
                    <input
                      id={cbId}
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => onToggleFacet(row.id, e.target.checked)}
                      className="mt-0.5 h-[15px] w-[15px] shrink-0 rounded border-black/[0.2] text-[var(--dark)] focus:ring-[var(--gold)]/35"
                    />
                    <label
                      htmlFor={cbId}
                      className="cursor-pointer text-[13px] leading-snug text-[var(--dark)]/65"
                    >
                      {row.label}{" "}
                      <span className="text-[var(--dark)]/45">({row.count})</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </fieldset>
        </AccordionSection>
      ) : null}
    </div>
  );
}
