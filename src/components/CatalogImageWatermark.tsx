/**
 * CSS overlay “watermark” so saved copies still show brand context.
 * `pointer-events-none` so links and buttons keep working.
 */
export function CatalogImageWatermark({
  variant,
}: {
  variant: "pdp" | "card" | "category";
}) {
  const tone =
    variant === "category"
      ? "text-white/[0.14]"
      : variant === "card"
        ? "text-[#2c1810]/[0.09]"
        : "text-[#2c1810]/[0.075]";

  return (
    <div
      className="pointer-events-none absolute inset-0 z-[1] overflow-hidden"
      aria-hidden
    >
      <div
        className={`flex h-full w-full items-center justify-center ${tone} rotate-[-22deg]`}
      >
        <span className="font-[var(--font-cormorant)] text-[clamp(0.7rem,3.2vw,1.65rem)] font-semibold uppercase tracking-[0.42em]">
          Artzens
        </span>
      </div>
    </div>
  );
}
