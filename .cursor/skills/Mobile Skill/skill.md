# Mobile UI Skill — Cursor Agent
# Artzen.pk — App-Like Mobile Experience

## Mission

Transform the Artzen.pk mobile browser experience to feel like a **native mobile app** — not a shrunk-down desktop website. Desktop design stays 100% untouched. Every rule in this file applies ONLY inside `@media (max-width: 767px)` unless explicitly stated otherwise.

**The standard:** A user on their phone should feel like they downloaded the Artzen app from the App Store. Thumb-friendly, fast, smooth, no horizontal scroll, no tiny text, no desktop navigation trying to squeeze into a small screen.

**Reference feeling:** Daraz app + Noon app + a boutique Pakistani store — clean, fast, tap-friendly.

---

## Core Principles

```
1. THUMB ZONE FIRST
   Most interactions happen in the bottom 60% of the screen.
   Primary actions (Add to Cart, Buy Now, WhatsApp) always live there.

2. ONE COLUMN ALWAYS
   No multi-column layouts on mobile except 2-col product grids.
   Everything stacks vertically.

3. MINIMUM 44px TOUCH TARGETS
   Every tappable element — button, link, icon, tab — minimum 44x44px.
   Never make users tap something smaller than their fingertip.

4. NO HOVER STATES ON MOBILE
   Hover interactions (quick view bar, wishlist appear on hover) don't exist
   on touch screens. Replace all hover-only UI with always-visible UI.

5. BOTTOM NAVIGATION BAR
   Replace desktop top nav with a fixed bottom tab bar — exactly like an app.
   This is the single biggest change that makes a site feel like an app.

6. SWIPE-NATIVE
   Carousels, product sliders, and image galleries use native touch scroll
   (overflow-x: scroll, scroll-snap) — never JS-heavy libraries on mobile.

7. REDUCE COGNITIVE LOAD
   Show less, make it clearer. Mobile users scan — they don't read.
   Shorter text, bigger type, more whitespace between elements.

8. DESKTOP BREAKPOINT GUARD
   Every single CSS rule in this file is wrapped in:
   @media (max-width: 767px) { }
   NEVER write mobile-only rules without this wrapper.
```

---

## Breakpoint Rule — NON-NEGOTIABLE

```css
/* ════════════════════════════════════════════════════
   ALL RULES IN THIS FILE LIVE INSIDE THIS WRAPPER
   Desktop code is NEVER touched or overridden above 768px
   ════════════════════════════════════════════════════ */
@media (max-width: 767px) {
  /* all mobile styles here */
}
```

---

## PART 1 — LAYOUT & SPACING

### Body & Container
```css
@media (max-width: 767px) {
  body {
    font-size: 15px;
    -webkit-text-size-adjust: 100%;
    overflow-x: hidden;
  }

  /* Remove all desktop horizontal padding — use mobile-specific */
  .container,
  .wrapper,
  main,
  section {
    padding-left: 16px !important;
    padding-right: 16px !important;
    width: 100% !important;
    max-width: 100% !important;
  }

  /* Sections breathe differently on mobile */
  section {
    padding-top: 32px !important;
    padding-bottom: 32px !important;
  }

  /* No horizontal overflow ever */
  * {
    max-width: 100%;
    box-sizing: border-box;
  }
}
```

### Typography — Mobile Scale
```css
@media (max-width: 767px) {
  h1 { font-size: clamp(28px, 7vw, 36px) !important; line-height: 1.1 !important; }
  h2 { font-size: clamp(22px, 5.5vw, 28px) !important; line-height: 1.15 !important; }
  h3 { font-size: clamp(18px, 4.5vw, 22px) !important; line-height: 1.2 !important; }
  h4 { font-size: 17px !important; }
  p  { font-size: 14.5px !important; line-height: 1.65 !important; }

  .section-label {
    font-size: 10px !important;
    letter-spacing: 0.1em !important;
  }

  .card__name,
  .product-card__name {
    font-size: 15px !important;
  }

  .price-sale,
  .p-now {
    font-size: 18px !important;
  }
}
```

---

## PART 2 — HIDE DESKTOP NAV, ADD APP BOTTOM BAR

### Hide Desktop Navigation
```css
@media (max-width: 767px) {
  /* Hide desktop navbar links */
  .nav-links,
  .navbar__links,
  nav ul {
    display: none !important;
  }

  /* Slim down the top bar — logo + search + cart only */
  nav,
  .navbar {
    height: 56px !important;
    padding: 0 16px !important;
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    z-index: 200 !important;
    background: var(--bg) !important;
    border-bottom: 1px solid var(--border) !important;
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
  }

  /* Push page content below fixed nav */
  body {
    padding-top: 56px !important;
    padding-bottom: 72px !important; /* space for bottom tab bar */
  }

  /* Hide announcement bar on mobile OR make it minimal */
  .announce,
  .announcement-bar {
    font-size: 11px !important;
    height: 36px !important;
    padding: 0 12px !important;
  }
}
```

### Bottom Tab Bar — The Core App Element
```css
@media (max-width: 767px) {
  .mobile-tab-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 64px;
    background: var(--bg);
    border-top: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-around;
    z-index: 300;
    padding-bottom: env(safe-area-inset-bottom); /* iPhone notch support */
  }

  .tab-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    flex: 1;
    height: 100%;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition: opacity 0.15s;
  }

  .tab-item:active { opacity: 0.6; }

  .tab-item svg {
    width: 22px;
    height: 22px;
    stroke: var(--slate-muted);
    fill: none;
    stroke-width: 1.8;
    transition: stroke 0.15s;
  }

  .tab-item span {
    font-size: 10px;
    font-weight: 500;
    color: var(--slate-muted);
    letter-spacing: 0.02em;
    transition: color 0.15s;
  }

  .tab-item.active svg { stroke: var(--sage); }
  .tab-item.active span { color: var(--sage); }

  /* Cart badge on tab icon */
  .tab-item .tab-badge {
    position: absolute;
    top: 6px;
    right: calc(50% - 18px);
    background: var(--red);
    color: #fff;
    font-size: 9px;
    font-weight: 700;
    min-width: 16px;
    height: 16px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 3px;
  }

  .tab-item { position: relative; }
}
```

**HTML for bottom tab bar — add just before `</body>`:**
```html
<nav class="mobile-tab-bar" role="navigation" aria-label="App navigation">
  <a href="/" class="tab-item active" aria-label="Home">
    <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
    <span>Home</span>
  </a>
  <a href="/all-products/" class="tab-item" aria-label="Shop">
    <svg viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
    <span>Shop</span>
    <span class="tab-badge">3</span>
  </a>
  <a href="/all-products/" class="tab-item" aria-label="Categories">
    <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
    <span>Categories</span>
  </a>
  <a href="/wishlist/" class="tab-item" aria-label="Wishlist">
    <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
    <span>Wishlist</span>
  </a>
  <a href="/my-account/" class="tab-item" aria-label="Account">
    <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
    <span>Account</span>
  </a>
</nav>
```

---

## PART 3 — MOBILE HERO SECTION

```css
@media (max-width: 767px) {
  .hero {
    min-height: 85vh !important;
    padding: 28px 16px 32px !important;
    flex-direction: column !important;
    align-items: flex-start !important;
    justify-content: flex-end !important;
    text-align: left !important;
    position: relative !important;
  }

  /* Hero on mobile: image fills background, text overlays bottom */
  .hero__image-wrap {
    position: absolute !important;
    inset: 0 !important;
    width: 100% !important;
    height: 100% !important;
  }

  .hero__image-wrap img {
    width: 100% !important;
    height: 100% !important;
    object-fit: cover !important;
  }

  /* Dark gradient scrim over image — text readable */
  .hero__image-wrap::after {
    content: '' !important;
    position: absolute !important;
    inset: 0 !important;
    background: linear-gradient(
      to top,
      rgba(30,40,50,0.92) 0%,
      rgba(30,40,50,0.5) 50%,
      rgba(30,40,50,0.1) 100%
    ) !important;
  }

  .hero-text,
  .hero__content {
    position: relative !important;
    z-index: 2 !important;
    width: 100% !important;
    padding: 0 !important;
  }

  /* Override text colors — sitting on dark scrim */
  .hero-title,
  .hero__title {
    color: #fff !important;
    font-size: clamp(28px, 8vw, 38px) !important;
  }

  .hero-sub,
  .hero__subtitle {
    color: rgba(255,255,255,0.75) !important;
    font-size: 14px !important;
    margin-bottom: 20px !important;
  }

  /* Stack CTA buttons vertically on mobile */
  .hero-cta,
  .hero__cta {
    flex-direction: column !important;
    gap: 10px !important;
    width: 100% !important;
  }

  .hero-cta .btn-primary,
  .hero-cta .f-btn,
  .hero__cta a {
    width: 100% !important;
    justify-content: center !important;
    height: 50px !important;
    font-size: 15px !important;
  }

  /* Hero badge — smaller on mobile */
  .hero-badge {
    font-size: 10px !important;
    padding: 4px 12px !important;
    margin-bottom: 14px !important;
  }

  /* Hide the fan product cards on mobile — too complex */
  .card-strip {
    display: none !important;
  }

  /* Feature bar below hero — horizontal scroll on mobile */
  .feature-bar {
    display: flex !important;
    overflow-x: auto !important;
    scroll-snap-type: x mandatory !important;
    gap: 0 !important;
    border-radius: 0 !important;
    scrollbar-width: none !important;
    -webkit-overflow-scrolling: touch !important;
  }

  .feature-bar::-webkit-scrollbar { display: none !important; }

  .feature-item {
    min-width: 200px !important;
    scroll-snap-align: start !important;
    flex-shrink: 0 !important;
    border-right: 1px solid var(--border) !important;
    padding: 20px 20px !important;
  }
}
```

---

## PART 4 — PRODUCT GRID & CARDS

### Product Grid — 2 Column Always
```css
@media (max-width: 767px) {
  /* Force 2-column product grid */
  .showcase,
  .products-grid,
  .product-grid,
  .woocommerce ul.products {
    display: grid !important;
    grid-template-columns: 1fr 1fr !important;
    gap: 12px !important;
    padding: 0 !important;
  }

  /* 1 column for featured/large cards */
  .products-grid--single {
    grid-template-columns: 1fr !important;
  }
}
```

### Product Card — Mobile App Style
```css
@media (max-width: 767px) {
  .product-card,
  .card {
    border-radius: 14px !important;
  }

  /* Image area — taller on mobile for visual impact */
  .card__img,
  .card__image-wrap,
  .product-card__image {
    aspect-ratio: 4 / 5 !important; /* taller than square — more app-like */
  }

  /* ALWAYS show wishlist and add to cart on mobile */
  /* (no hover on touch screens) */
  .card__wish,
  .card__wishlist {
    opacity: 1 !important;
    transform: none !important;
  }

  .card__bar,
  .card__actions {
    transform: translateY(0) !important; /* always visible */
    height: 40px !important;
    font-size: 12px !important;
  }

  /* Compact card body */
  .card__body {
    padding: 10px 12px 14px !important;
  }

  .card__cat,
  .card__category {
    font-size: 9.5px !important;
    margin-bottom: 3px !important;
  }

  .card__name {
    font-size: 13.5px !important;
    -webkit-line-clamp: 2 !important;
    margin-bottom: 6px !important;
  }

  .card__price,
  .p-now {
    font-size: 16px !important;
  }

  .p-was {
    font-size: 12px !important;
  }

  .p-save,
  .price-save {
    font-size: 9.5px !important;
    padding: 2px 6px !important;
  }

  /* Badge sizes */
  .badge {
    font-size: 9px !important;
    padding: 3px 8px !important;
  }
}
```

---

## PART 5 — CATEGORY SECTION

```css
@media (max-width: 767px) {
  /* Category cards — horizontal scroll row (app-style) */
  .category-grid,
  .f-link-cols,
  .category-strip {
    display: flex !important;
    overflow-x: auto !important;
    scroll-snap-type: x mandatory !important;
    gap: 10px !important;
    padding-bottom: 8px !important;
    scrollbar-width: none !important;
    -webkit-overflow-scrolling: touch !important;
    /* Bleed to edges of screen */
    margin-left: -16px !important;
    margin-right: -16px !important;
    padding-left: 16px !important;
    padding-right: 16px !important;
  }

  .category-grid::-webkit-scrollbar { display: none !important; }

  .category-card {
    min-width: 130px !important;
    height: 160px !important;
    scroll-snap-align: start !important;
    flex-shrink: 0 !important;
    border-radius: 14px !important;
  }

  .category-card .category-name {
    font-size: 13px !important;
  }
}
```

---

## PART 6 — PRODUCT DETAIL PAGE (PDP)

```css
@media (max-width: 767px) {
  /* Product image — full width, no side margins */
  .product-detail__image,
  .woocommerce div.product div.images {
    margin-left: -16px !important;
    margin-right: -16px !important;
    width: calc(100% + 32px) !important;
    border-radius: 0 !important;
  }

  .product-detail__image img {
    width: 100% !important;
    aspect-ratio: 1 / 1 !important;
    object-fit: cover !important;
    border-radius: 0 !important;
  }

  /* Image thumbnail dots (not prev/next arrows) */
  .product-thumbnails {
    display: flex !important;
    justify-content: center !important;
    gap: 6px !important;
    margin-top: 10px !important;
  }

  .thumb-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--border-mid);
  }

  .thumb-dot.active {
    background: var(--sage);
    width: 18px;
    border-radius: 3px;
  }

  /* Product info — normal padding */
  .product-detail__info {
    padding: 20px 16px !important;
  }

  /* Sticky Add to Cart bar at bottom of PDP */
  .pdp-sticky-bar {
    position: fixed;
    bottom: 64px; /* above tab bar */
    left: 0;
    right: 0;
    background: var(--bg);
    border-top: 1px solid var(--border);
    padding: 10px 16px;
    display: flex;
    gap: 10px;
    z-index: 150;
    padding-bottom: calc(10px + env(safe-area-inset-bottom));
  }

  .pdp-sticky-bar .btn-whatsapp {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: #25D366;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border: none;
    cursor: pointer;
  }

  .pdp-sticky-bar .btn-add-cart {
    flex: 1;
    height: 50px;
    background: var(--slate);
    color: var(--off-white);
    border: none;
    border-radius: 14px;
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    font-family: var(--font-body);
  }

  .pdp-sticky-bar .btn-buy-now {
    flex: 1;
    height: 50px;
    background: var(--sage);
    color: #fff;
    border: none;
    border-radius: 14px;
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    font-family: var(--font-body);
  }

  /* Add bottom padding to page so sticky bar doesn't cover content */
  .product-detail {
    padding-bottom: 80px !important;
  }
}
```

---

## PART 7 — SEARCH

```css
@media (max-width: 767px) {
  /* Full-screen search overlay on mobile */
  .search-overlay {
    position: fixed;
    inset: 0;
    background: var(--bg);
    z-index: 400;
    display: flex;
    flex-direction: column;
    padding: 16px;
    padding-top: calc(16px + env(safe-area-inset-top));
  }

  .search-overlay__bar {
    display: flex;
    align-items: center;
    gap: 12px;
    background: var(--bg-card);
    border-radius: 12px;
    padding: 0 14px;
    height: 48px;
    border: 1px solid var(--border-mid);
    margin-bottom: 20px;
  }

  .search-overlay__bar input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    font-size: 16px; /* 16px prevents iOS zoom on focus */
    font-family: var(--font-body);
    color: var(--text-primary);
  }

  /* Prevent iOS zoom on input focus — CRITICAL */
  input[type="text"],
  input[type="search"],
  input[type="email"],
  input[type="tel"],
  select,
  textarea {
    font-size: 16px !important; /* never below 16px on mobile inputs */
  }
}
```

---

## PART 8 — CART DRAWER

```css
@media (max-width: 767px) {
  /* Cart slides up from bottom on mobile (not right side) */
  .cart-drawer {
    position: fixed !important;
    bottom: 0 !important;
    left: 0 !important;
    right: 0 !important;
    top: auto !important;
    height: 85vh !important;
    border-radius: 20px 20px 0 0 !important;
    transform: translateY(100%) !important;
    transition: transform 0.35s cubic-bezier(0.4,0,0.2,1) !important;
    padding-bottom: calc(24px + env(safe-area-inset-bottom)) !important;
    overflow-y: auto !important;
  }

  .cart-drawer.open {
    transform: translateY(0) !important;
  }

  /* Pull handle at top of drawer */
  .cart-drawer::before {
    content: '' !important;
    display: block !important;
    width: 36px !important;
    height: 4px !important;
    background: var(--border-mid) !important;
    border-radius: 2px !important;
    margin: 12px auto 20px !important;
  }

  /* Backdrop */
  .cart-backdrop {
    position: fixed !important;
    inset: 0 !important;
    background: rgba(30,40,50,0.5) !important;
    z-index: 198 !important;
    opacity: 0 !important;
    pointer-events: none !important;
    transition: opacity 0.3s !important;
  }

  .cart-backdrop.open {
    opacity: 1 !important;
    pointer-events: all !important;
  }
}
```

---

## PART 9 — FOOTER ON MOBILE

```css
@media (max-width: 767px) {
  footer,
  .f-main {
    grid-template-columns: 1fr !important;
    padding: 32px 16px 24px !important;
    gap: 28px !important;
    text-align: center !important;
  }

  /* Center brand/logo in middle */
  .f-center {
    order: -1 !important; /* brand first on mobile */
  }

  .f-contact,
  .f-links {
    align-items: center !important;
    text-align: center !important;
  }

  .f-socials a {
    justify-content: center !important;
    gap: 16px !important;
  }

  .f-link-cols {
    justify-content: center !important;
  }

  .f-link-col {
    align-items: center !important;
  }

  .f-btns {
    flex-direction: column !important;
    width: 100% !important;
  }

  .f-btn {
    width: 100% !important;
    justify-content: center !important;
    height: 48px !important;
  }

  /* Bottom bar — stacked on mobile */
  .f-bottom {
    flex-direction: column !important;
    gap: 12px !important;
    padding: 16px !important;
    text-align: center !important;
  }

  /* Hide footer entirely if bottom tab bar covers it */
  /* Uncomment if footer overlaps with tab bar: */
  /* footer { padding-bottom: 80px !important; } */
}
```

---

## PART 10 — MOBILE-ONLY COMPONENTS

### Pull-to-Refresh Indicator
```css
@media (max-width: 767px) {
  .ptr-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 0;
    overflow: hidden;
    transition: height 0.2s;
    color: var(--sage);
    font-size: 13px;
    gap: 8px;
  }

  .ptr-indicator.active { height: 48px; }
}
```

### Swipeable Product Image Gallery
```css
@media (max-width: 767px) {
  .product-gallery {
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
    margin-left: -16px;
    margin-right: -16px;
  }

  .product-gallery::-webkit-scrollbar { display: none; }

  .product-gallery__slide {
    min-width: 100vw;
    scroll-snap-align: center;
    aspect-ratio: 1 / 1;
    flex-shrink: 0;
  }

  .product-gallery__slide img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}
```

### Toast Notification (Add to Cart feedback)
```css
@media (max-width: 767px) {
  .toast {
    position: fixed;
    bottom: 80px; /* above tab bar */
    left: 16px;
    right: 16px;
    background: var(--slate);
    color: var(--off-white);
    border-radius: 12px;
    padding: 14px 16px;
    font-size: 13.5px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 10px;
    z-index: 500;
    transform: translateY(20px);
    opacity: 0;
    transition: transform 0.3s ease, opacity 0.3s ease;
    pointer-events: none;
  }

  .toast.show {
    transform: translateY(0);
    opacity: 1;
  }

  .toast svg {
    width: 18px;
    height: 18px;
    color: var(--sage);
    flex-shrink: 0;
  }
}
```

### Section Scroll Arrows → Dots on Mobile
```css
@media (max-width: 767px) {
  /* Hide left/right scroll arrows */
  .scroll-arrow,
  .slider-arrow,
  .carousel-btn {
    display: none !important;
  }

  /* Show dots indicator instead */
  .scroll-dots {
    display: flex !important;
    justify-content: center;
    gap: 5px;
    margin-top: 12px;
  }

  .scroll-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--border-mid);
    transition: all 0.2s;
  }

  .scroll-dot.active {
    background: var(--sage);
    width: 18px;
    border-radius: 3px;
  }
}
```

---

## PART 11 — TOUCH & INTERACTION POLISH

```css
@media (max-width: 767px) {
  /* Remove tap highlight on all interactive elements */
  a, button, [role="button"], .tab-item, .product-card {
    -webkit-tap-highlight-color: transparent;
  }

  /* Smooth scrolling on mobile */
  html {
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
  }

  /* Active state feedback on tap (replaces hover) */
  .product-card:active {
    transform: scale(0.98) !important;
    transition: transform 0.1s !important;
  }

  button:active,
  .f-btn:active,
  .btn-primary:active {
    transform: scale(0.97) !important;
    transition: transform 0.1s !important;
  }

  /* Minimum touch targets — WCAG 2.1 AA */
  .nav-icon,
  .tab-item,
  .card__wish,
  .card__wishlist {
    min-width: 44px !important;
    min-height: 44px !important;
  }

  /* Prevent text selection on UI elements */
  .tab-item,
  .badge,
  .card__cat {
    user-select: none;
    -webkit-user-select: none;
  }

  /* Momentum scrolling on all scroll containers */
  .category-grid,
  .product-gallery,
  .card-strip,
  .f-link-cols {
    -webkit-overflow-scrolling: touch !important;
  }
}
```

---

## PART 12 — SAFE AREA (NOTCH & HOME INDICATOR)

```css
@media (max-width: 767px) {
  /* iPhone notch + home indicator support */
  .mobile-tab-bar {
    padding-bottom: env(safe-area-inset-bottom);
    height: calc(64px + env(safe-area-inset-bottom));
  }

  nav, .navbar {
    padding-top: env(safe-area-inset-top);
  }

  .cart-drawer,
  .search-overlay {
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
  }

  /* Body padding accounts for safe areas */
  body {
    padding-top: calc(56px + env(safe-area-inset-top)) !important;
    padding-bottom: calc(64px + env(safe-area-inset-bottom)) !important;
  }
}
```

---

## PART 13 — WHATSAPP FLOAT ON MOBILE

```css
@media (max-width: 767px) {
  /* Move WhatsApp float above tab bar */
  .whatsapp-float {
    bottom: calc(76px + env(safe-area-inset-bottom)) !important;
    right: 16px !important;
    width: 50px !important;
    height: 50px !important;
  }
}
```

---

## PART 14 — PERFORMANCE (MOBILE-SPECIFIC)

```
Mobile-specific performance rules:

✅ All images: loading="lazy" — critical for mobile data connections
✅ Hero image: loading="eager" fetchpriority="high" — only the first visible image
✅ Use srcset with small sizes for mobile:
   srcset="image-400.webp 400w, image-800.webp 800w"
   sizes="(max-width: 767px) 100vw, 50vw"
✅ Avoid loading desktop-sized images on mobile
✅ Font display: swap — prevents invisible text on slow connections
✅ Minimal JS on mobile — every extra KB is a slower first load
✅ No autoplay videos on mobile — they consume data and drain battery
✅ Compress all images to WebP — biggest win on mobile
✅ Test on actual device or Chrome DevTools with throttled 3G
```

---

## PART 15 — WHAT NOT TO DO ON MOBILE

```
❌ NEVER style above @media (max-width: 767px) in this file
❌ NEVER change grid layouts on desktop — this file touches mobile ONLY
❌ NEVER use hover states — use :active for touch feedback instead
❌ NEVER use font-size below 13px — unreadable on small screens
❌ NEVER use input font-size below 16px — causes iOS zoom bug
❌ NEVER use fixed widths in px on containers — use 100% or vw
❌ NEVER remove the bottom tab bar on product/cart pages — it's core UX
❌ NEVER show the desktop nav links on mobile — they belong in bottom bar
❌ NEVER use JS carousels when CSS scroll-snap works
❌ NEVER forget safe-area-inset for iPhone X+ notch/home indicator
❌ NEVER load desktop hero animations on mobile — skip or simplify them
❌ NEVER show more than 2 columns in product grids on mobile
❌ NEVER use position:fixed elements that stack without accounting for each other
```

---

## PART 16 — MOBILE CSS FILE STRUCTURE

```
/artzen/css/
  variables.css        ← shared CSS variables (no breakpoint)
  base.css             ← desktop base styles
  components.css       ← desktop components
  layout.css           ← desktop layout
  sections.css         ← desktop sections
  animations.css       ← shared animations
  responsive.css       ← tablet breakpoints (768px–1023px)
  mobile.css           ← THIS FILE — all @media (max-width: 767px) rules
```

**Load order in HTML:**
```html
<link rel="stylesheet" href="/css/variables.css" />
<link rel="stylesheet" href="/css/base.css" />
<link rel="stylesheet" href="/css/components.css" />
<link rel="stylesheet" href="/css/layout.css" />
<link rel="stylesheet" href="/css/sections.css" />
<link rel="stylesheet" href="/css/animations.css" />
<link rel="stylesheet" href="/css/responsive.css" />
<link rel="stylesheet" href="/css/mobile.css" />
<!-- mobile.css always loads last — overrides desktop where needed -->
```

---

## How to Handle Mobile Tasks

When asked to implement or fix anything on mobile:

```
1. Open mobile.css ONLY — never touch any other CSS file
2. Write ALL rules inside @media (max-width: 767px) { }
3. Check the element on desktop first — confirm desktop looks correct
4. Apply mobile override using !important where needed to win specificity
5. Test mentally: can a thumb reach it? Is text readable? Does it scroll horizontally?
6. Check bottom tab bar doesn't overlap content
7. Check safe-area-inset is applied to any fixed/sticky elements
8. Check all touch targets are minimum 44x44px
9. Check no input has font-size below 16px (iOS zoom bug)
10. Never add new JS for things CSS can do (scroll-snap, etc.)
```

**The one-line test:** Open the page on a phone. Can you use the entire site comfortably with your thumb, without zooming, without horizontal scrolling, in under 3 seconds of load time? If yes — the mobile skill is working.