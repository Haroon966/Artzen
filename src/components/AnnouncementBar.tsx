export function AnnouncementBar() {
  return (
    <div
      data-announcement-bar
      className="site-announcement-bar bg-[var(--slate)] py-3 px-5 text-center font-[var(--font-dm-sans)] text-[13px] font-medium leading-snug tracking-wide text-[var(--off-white)] max-md:py-2 max-md:px-3 max-md:text-[11px] max-md:leading-tight"
    >
      <span className="text-[var(--sage)]">✦</span> Free Rs. 2,000 voucher on Rs. 7,000+ orders
      <span className="mx-2 text-[var(--text-on-dark-muted)]">|</span>
      <span className="text-[var(--sage)]">Cash on Delivery</span>
      {" — all Pakistan "}
      <span aria-hidden>🚚</span>
    </div>
  );
}
