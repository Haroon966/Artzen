export function AnnouncementBar() {
  return (
    <div
      data-announcement-bar
      className="site-announcement-bar bg-[var(--slate)] px-4 py-3 text-center font-[var(--font-dm-sans)] text-[13px] font-medium leading-snug tracking-wide text-[var(--off-white)] max-md:py-2 max-md:px-3 max-md:text-[11px] max-md:leading-tight sm:px-5"
    >
      <p className="m-0 flex flex-col items-center gap-1 sm:inline sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-0">
        <span className="block sm:inline">
          <span className="text-[var(--sage)]">✦</span> Free Rs. 2,000 voucher on Rs. 7,000+ orders
        </span>
        <span
          className="hidden text-[var(--text-on-dark-muted)] sm:mx-2 sm:inline"
          aria-hidden
        >
          |
        </span>
        <span className="block sm:inline">
          <span className="text-[var(--sage)]">Cash on Delivery</span>
          {" — all Pakistan "}
          <span aria-hidden>🚚</span>
        </span>
      </p>
    </div>
  );
}
