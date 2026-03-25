import { AnimatedSection } from "@/components/AnimatedSection";

export type FaqSectionItem = { question: string; answer: string };

type FaqSectionProps = {
  items: FaqSectionItem[];
  headingId: string;
  title?: string;
  subtitle?: string;
  className?: string;
  /** Marketing: full band + geometry. Inline: tighter, for inner pages. */
  variant?: "marketing" | "inline";
};

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M5 7.5L10 12.5L15 7.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FaqSection({
  items,
  headingId,
  title = "Frequently asked questions",
  subtitle = "Orders, delivery, and how to reach us — quick answers below.",
  className = "",
  variant = "marketing",
}: FaqSectionProps) {
  const isMarketing = variant === "marketing";

  return (
    <section
      className={[
        "faq-section relative overflow-hidden border-t border-[var(--nav-border)]",
        isMarketing
          ? "bg-[var(--nav-input-bg)] px-4 py-14 sm:px-6 sm:py-20"
          : "bg-transparent px-0 py-0",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-labelledby={headingId}
    >
      {isMarketing ? (
        <>
          <div
            className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-[var(--sage)]/14"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-16 -left-16 h-44 w-44 rotate-45 bg-[rgba(30,40,50,0.06)]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute bottom-24 right-[12%] h-6 w-6 bg-[var(--sage)]/30"
            aria-hidden
          />
        </>
      ) : null}

      <AnimatedSection
        as="div"
        className={
          isMarketing
            ? "relative mx-auto max-w-3xl"
            : "relative mx-auto max-w-none"
        }
      >
        <header className={isMarketing ? "text-center sm:text-left" : ""}>
          {isMarketing ? (
            <p className="font-[var(--font-dm-sans)] text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--gold)]">
              Help
            </p>
          ) : null}
          <h2
            id={headingId}
            className={[
              "font-[var(--font-cormorant)] font-semibold text-[var(--dark)]",
              isMarketing
                ? "mt-2 text-[clamp(1.75rem,3.5vw,2.5rem)] leading-tight"
                : "text-2xl leading-tight sm:text-3xl",
            ].join(" ")}
          >
            {title}
          </h2>
          {subtitle ? (
            <p
              className={[
                "font-[var(--font-dm-sans)] text-[15px] font-light leading-relaxed text-[var(--nav-link-muted)]",
                isMarketing ? "mx-auto mt-3 max-w-xl sm:mx-0" : "mt-3 max-w-2xl",
              ].join(" ")}
            >
              {subtitle}
            </p>
          ) : null}
        </header>

        <div className={isMarketing ? "mt-10 space-y-3 sm:mt-12" : "mt-8 space-y-3"}>
          {items.map((item) => (
            <details
              key={item.question}
              className="faq-section__item rounded-[var(--radius)] border border-[var(--nav-border)] bg-[var(--cream)] shadow-[var(--shadow-card)] transition-[border-color,box-shadow] duration-[250ms] ease-out open:border-[var(--border-accent)] open:shadow-[var(--shadow-accent)] hover:border-[var(--sage)]/25"
            >
              <summary className="faq-section__summary flex cursor-pointer list-none items-start gap-4 px-5 py-4 text-left outline-none transition-colors duration-[250ms] ease-out focus-visible:ring-2 focus-visible:ring-[var(--sage)]/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--cream)] [&::-webkit-details-marker]:hidden">
                <span className="min-w-0 flex-1 font-[var(--font-dm-sans)] text-[15px] font-semibold leading-snug text-[var(--dark)]">
                  {item.question}
                </span>
                <span className="faq-section__chevron mt-0.5 shrink-0 text-[var(--gold)]">
                  <ChevronDown className="block" />
                </span>
              </summary>
              <div className="faq-section__panel border-t border-[var(--nav-border)] px-5 pb-5 pt-4">
                <p className="font-[var(--font-dm-sans)] text-[15px] font-light leading-relaxed text-[var(--nav-link-muted)]">
                  {item.answer}
                </p>
              </div>
            </details>
          ))}
        </div>
      </AnimatedSection>
    </section>
  );
}
