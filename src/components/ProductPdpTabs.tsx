"use client";

import { useState } from "react";

type TabId = "desc" | "info";

export function ProductPdpTabs({
  descriptionParagraphs,
  infoRows,
}: {
  descriptionParagraphs: string[];
  infoRows: { label: string; value: string }[];
}) {
  const [tab, setTab] = useState<TabId>("desc");

  return (
    <>
      <div
        className="mt-12 min-w-0 border-b border-[var(--border-mid)] md:mt-14"
        role="tablist"
        aria-label="Product information"
      >
        <div className="-mx-4 flex min-w-0 gap-0 overflow-x-auto overflow-y-hidden px-4 [-webkit-overflow-scrolling:touch] sm:mx-0 sm:overflow-visible sm:px-0">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "desc"}
            id="tab-desc"
            aria-controls="panel-desc"
            onClick={() => setTab("desc")}
            className={`mb-[-1px] shrink-0 border-b-2 border-transparent px-3 py-3.5 font-[var(--font-dm-sans)] text-[13px] transition-colors sm:px-7 sm:text-[14px] ${
              tab === "desc"
                ? "border-[var(--sage)] font-medium text-[var(--slate)]"
                : "font-normal text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            Description
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "info"}
            id="tab-info"
            aria-controls="panel-info"
            onClick={() => setTab("info")}
            className={`mb-[-1px] shrink-0 border-b-2 border-transparent px-3 py-3.5 text-left font-[var(--font-dm-sans)] text-[13px] transition-colors sm:px-7 sm:text-[14px] ${
              tab === "info"
                ? "border-[var(--sage)] font-medium text-[var(--slate)]"
                : "font-normal text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            <span className="sm:hidden">Specs &amp; info</span>
            <span className="hidden sm:inline">Additional Information</span>
          </button>
        </div>
      </div>

      <div className="pt-7">
        <div
          id="panel-desc"
          role="tabpanel"
          aria-labelledby="tab-desc"
          hidden={tab !== "desc"}
          className={tab === "desc" ? "block" : "hidden"}
        >
          <div className="max-w-[700px] font-[var(--font-dm-sans)] text-[14.5px] leading-[1.8] text-[var(--text-secondary)]">
            {descriptionParagraphs.map((p, i) => (
              <p key={i} className={i > 0 ? "mt-3.5" : ""}>
                {p}
              </p>
            ))}
          </div>
        </div>

        <div
          id="panel-info"
          role="tabpanel"
          aria-labelledby="tab-info"
          hidden={tab !== "info"}
          className={tab === "info" ? "block" : "hidden"}
        >
          <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:overflow-visible sm:px-0">
            <table className="w-full min-w-[min(100%,280px)] border-collapse text-[13.5px]">
              <tbody>
                {infoRows.map((row, i) => (
                  <tr key={row.label}>
                    <td
                      className={`w-[min(180px,38%)] max-w-[10rem] px-3 py-3 align-top font-medium text-[var(--text-primary)] sm:max-w-none sm:px-4 ${
                        i % 2 === 0 ? "bg-[var(--bg-card)]" : ""
                      } border-b border-[var(--border)]`}
                    >
                      {row.label}
                    </td>
                    <td
                      className={`break-words px-3 py-3 text-[var(--text-secondary)] sm:px-4 ${
                        i % 2 === 0 ? "bg-[var(--bg-card)]" : ""
                      } border-b border-[var(--border)]`}
                    >
                      {row.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
