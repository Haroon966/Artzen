import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import type { Product } from "@/lib/data";
import { getCollectionDisplayName } from "@/lib/data";
import {
  getServerCollection,
  getServerProductBySlug,
  getServerProducts,
  getServerProductsByCollection,
} from "@/lib/catalog-server";
import { absoluteUrl, getDefaultShareImagePath, getSiteOrigin } from "@/lib/site";
import { clipMetaDescription } from "@/lib/seo";
import { productDisplayName } from "@/lib/product-name";
import { ProductImageGallery } from "@/components/ProductImageGallery";
import { ProductCard } from "@/components/ProductCard";
import { ProductPdpBuyBox } from "@/components/ProductPdpBuyBox";
import { ProductPdpTabs } from "@/components/ProductPdpTabs";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 120;
export const dynamicParams = true;

export async function generateStaticParams() {
  const products = await getServerProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const origin = getSiteOrigin();
  const { slug } = await params;
  const product = await getServerProductBySlug(slug);
  if (!product) return { title: "Product" };
  const displayName = productDisplayName(product);
  const rawDesc = `${product.description} Rs. ${product.price.toLocaleString("en-PK")} PKR. Cash on Delivery.`;
  const description = clipMetaDescription(rawDesc);
  const ogImage = absoluteUrl(product.image);
  const url = `${origin}/products/${slug}`;
  const ogFallback = absoluteUrl(getDefaultShareImagePath());
  return {
    title: displayName,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: displayName,
      description,
      url,
      siteName: "Artzen",
      type: "website",
      locale: "en_PK",
      images: [
        { url: ogImage, alt: displayName },
        { url: ogFallback, alt: "Artzen — online shopping in Pakistan" },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: displayName,
      description,
      images: [ogImage],
    },
    other: {
      "product:price:amount": String(product.price),
      "product:price:currency": "PKR",
      "product:availability": "in stock",
    },
  };
}

function formatPrice(price: number) {
  return `Rs. ${price.toLocaleString("en-PK")}`;
}

function galleryImagesFor(product: Product) {
  const set = new Set<string>();
  set.add(product.image);
  for (const u of product.images ?? []) {
    if (u) set.add(u);
  }
  return Array.from(set);
}

function descriptionBlocks(product: Product) {
  const raw = product.longDescription?.trim();
  if (raw) {
    return raw.split(/\n\n+/).map((b) => b.trim()).filter(Boolean);
  }
  return [product.description];
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getServerProductBySlug(slug);
  if (!product) notFound();

  const displayName = productDisplayName(product);

  const collection = await getServerCollection(product.collectionSlug);
  const galleryImages = galleryImagesFor(product);
  const related = (await getServerProductsByCollection(product.collectionSlug))
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  const origin = getSiteOrigin();
  const productUrl = `${origin}/products/${product.slug}`;
  const imageUrls = galleryImages.map((path) => `${origin}${path}`);

  const priceValidUntil = `${new Date().getFullYear()}-12-31`;

  const schemaDescriptionRaw = (
    product.longDescription ||
    product.description ||
    ""
  )
    .replace(/\s+/g, " ")
    .trim();
  const schemaDescription =
    schemaDescriptionRaw.length > 5000
      ? `${schemaDescriptionRaw.slice(0, 4997)}...`
      : schemaDescriptionRaw || product.description;

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: displayName,
    description: schemaDescription,
    sku: product.id,
    image: imageUrls,
    brand: {
      "@type": "Brand",
      name: "Artzen",
    },
    offers: {
      "@type": "Offer",
      url: productUrl,
      price: String(product.price),
      priceCurrency: "PKR",
      priceValidUntil,
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: "Artzen",
        url: origin,
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        returnPolicyCategory:
          "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 7,
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: "0",
          currency: "PKR",
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "PK",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 2,
            unitCode: "DAY",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 2,
            maxValue: 5,
            unitCode: "DAY",
          },
        },
      },
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: origin },
      {
        "@type": "ListItem",
        position: 2,
        name: collection?.name ?? "Shop",
        item: `${origin}/collections/${product.collectionSlug}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: displayName,
        item: `${origin}/products/${product.slug}`,
      },
    ],
  };

  const onSale =
    product.originalPrice != null && product.originalPrice > product.price;
  const discountPct =
    onSale && product.originalPrice
      ? Math.round((1 - product.price / product.originalPrice) * 100)
      : 0;

  const categoryLabel = collection
    ? getCollectionDisplayName(collection.slug, collection.name)
    : "Shop";

  const shareText = encodeURIComponent(`Check out: ${displayName} — ${productUrl}`);
  const fbShare = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`;

  const infoRows = [
    {
      label: "Material",
      value: product.material ?? "Premium MDF wood and finishes (see product notes)",
    },
    {
      label: "Available sizes",
      value: product.dimensions ?? "Multiple sizes available — see options above",
    },
    {
      label: "Finish options",
      value: "Natural, Dark Slate, Sage, Walnut (selector above)",
    },
    {
      label: "Hanging",
      value: "Includes wall mount hardware where applicable",
    },
    {
      label: "Delivery",
      value: "3–5 business days across Pakistan",
    },
    {
      label: "Payment",
      value: "Cash on Delivery, JazzCash, EasyPaisa, Bank Transfer",
    },
    {
      label: "Returns",
      value: "7-day return policy on damaged or incorrect items",
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="pdp-page-root max-md:pb-[78px]">
        <div className="mx-auto max-w-[1200px] px-4 pt-4 sm:px-8">
          <nav aria-label="Breadcrumb">
            <ol
              className="m-0 flex list-none flex-wrap items-center gap-x-1.5 gap-y-1 p-0 font-[var(--font-dm-sans)] text-[12.5px] text-[var(--text-muted)] [&>li+li]:before:mr-1.5 [&>li+li]:before:inline [&>li+li]:before:text-[var(--border-mid)] [&>li+li]:before:content-['/']"
              itemScope
              itemType="https://schema.org/BreadcrumbList"
            >
              <li
                itemProp="itemListElement"
                itemScope
                itemType="https://schema.org/ListItem"
              >
                <Link
                  itemProp="item"
                  href="/"
                  className="text-[var(--text-muted)] no-underline transition-colors hover:text-[var(--sage)]"
                >
                  <span itemProp="name">Home</span>
                </Link>
                <meta itemProp="position" content="1" />
              </li>
              <li
                itemProp="itemListElement"
                itemScope
                itemType="https://schema.org/ListItem"
              >
                <Link
                  itemProp="item"
                  href={`/collections/${product.collectionSlug}`}
                  className="max-w-[200px] truncate text-[var(--text-muted)] no-underline transition-colors hover:text-[var(--sage)] sm:max-w-none"
                >
                  <span itemProp="name">{collection?.name ?? "Shop"}</span>
                </Link>
                <meta itemProp="position" content="2" />
              </li>
              <li
                itemProp="itemListElement"
                itemScope
                itemType="https://schema.org/ListItem"
              >
                <span
                  itemProp="name"
                  className="max-w-[min(100%,280px)] truncate text-[var(--text-secondary)]"
                >
                  {displayName}
                </span>
                <meta itemProp="position" content="3" />
              </li>
            </ol>
          </nav>
        </div>

        <main className="mx-auto max-w-[1200px] px-4 pb-12 pt-6 sm:px-8 sm:pb-16 md:pt-8">
          <div className="grid grid-cols-1 items-start gap-6 md:gap-10 lg:grid-cols-2 lg:gap-14">
            <ProductImageGallery
              images={galleryImages}
              productName={displayName}
              saleBadge={onSale && discountPct > 0 ? `${discountPct}% Off` : null}
            />

            <div className="min-w-0">
              <p className="mb-2.5 font-[var(--font-dm-sans)] text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--sage)]">
                {categoryLabel}
              </p>
              <h1 className="font-[var(--font-cormorant)] text-[clamp(1.625rem,3vw,2.375rem)] font-semibold leading-tight tracking-tight text-[var(--text-primary)]">
                {displayName}
              </h1>

              <div className="mt-4">
                <span className="inline-block rounded-[var(--radius-pill)] bg-[var(--sage-muted)] px-2.5 py-0.5 font-[var(--font-dm-sans)] text-[12px] font-medium text-[var(--sage-deep)]">
                  In Stock
                </span>
              </div>

              <div className="mt-4 flex flex-wrap items-baseline gap-2.5 border-b border-[var(--border)] pb-4">
                <span className="font-[var(--font-cormorant)] text-[32px] font-semibold leading-none text-[var(--text-primary)] max-[480px]:text-[26px]">
                  {formatPrice(product.price)}
                </span>
                {onSale && product.originalPrice != null && (
                  <>
                    <span className="font-[var(--font-dm-sans)] text-lg text-[var(--text-muted)] line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                    {discountPct > 0 && (
                      <span className="rounded-[var(--radius-pill)] bg-[rgba(201,68,68,0.09)] px-2.5 py-0.5 font-[var(--font-dm-sans)] text-[12px] font-semibold text-[var(--red)]">
                        Save {discountPct}%
                      </span>
                    )}
                  </>
                )}
              </div>

              <p className="mt-6 font-[var(--font-dm-sans)] text-[14px] leading-[1.75] text-[var(--text-secondary)]">
                {product.description}
              </p>

              <div className="mt-6">
                <ProductPdpBuyBox product={product} />
              </div>

              <div className="mt-6 space-y-1.5 border-t border-[var(--border)] pt-4 font-[var(--font-dm-sans)] text-[13px] text-[var(--text-muted)]">
                <p>
                  SKU: <span className="font-medium text-[var(--text-secondary)]">{product.id}</span>
                </p>
                <p>
                  Tags:{" "}
                  <span className="font-medium text-[var(--text-secondary)]">
                    {categoryLabel}, Wall decor, Pakistan COD
                  </span>
                </p>
                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  <p className="m-0">Share:</p>
                  <a
                    href={fbShare}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-mid)] bg-[var(--bg-card)] text-[var(--slate-muted)] no-underline transition-colors hover:border-[var(--sage)] hover:bg-[var(--sage-muted)] hover:text-[var(--sage-deep)]"
                    aria-label="Share on Facebook"
                  >
                    <svg className="h-[13px] w-[13px]" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                    </svg>
                  </a>
                  <a
                    href={`https://wa.me/?text=${shareText}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-mid)] bg-[var(--bg-card)] text-[var(--slate-muted)] no-underline transition-colors hover:border-[var(--sage)] hover:bg-[var(--sage-muted)] hover:text-[var(--sage-deep)]"
                    aria-label="Share on WhatsApp"
                  >
                    <svg className="h-[13px] w-[13px]" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" />
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.135.558 4.14 1.535 5.874L0 24l6.29-1.508A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.846 0-3.574-.48-5.072-1.32l-.364-.214-3.768.988 1.006-3.672-.236-.376A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                    </svg>
                  </a>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-4 rounded-[var(--radius-md)] bg-[var(--bg-card)] p-4">
                <div className="flex items-center gap-2 font-[var(--font-dm-sans)] text-[12.5px] text-[var(--text-secondary)]">
                  <svg
                    className="h-4 w-4 shrink-0 text-[var(--sage)]"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                  Cash on Delivery
                </div>
                <div className="flex items-center gap-2 font-[var(--font-dm-sans)] text-[12.5px] text-[var(--text-secondary)]">
                  <svg
                    className="h-4 w-4 shrink-0 text-[var(--sage)]"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <polyline points="20 6 9 12 4 9" />
                  </svg>
                  Handcrafted
                </div>
                <div className="flex items-center gap-2 font-[var(--font-dm-sans)] text-[12.5px] text-[var(--text-secondary)]">
                  <svg
                    className="h-4 w-4 shrink-0 text-[var(--sage)]"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  All Pakistan
                </div>
                <div className="flex items-center gap-2 font-[var(--font-dm-sans)] text-[12.5px] text-[var(--text-secondary)]">
                  <svg
                    className="h-4 w-4 shrink-0 text-[var(--sage)]"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                  7-Day Returns
                </div>
              </div>
            </div>
          </div>

          <ProductPdpTabs
            descriptionParagraphs={descriptionBlocks(product)}
            infoRows={infoRows}
          />
        </main>

        {related.length > 0 && (
          <section className="mx-auto max-w-[1200px] border-t border-[var(--border)] px-4 py-12 sm:px-8 sm:py-16">
            <p className="mb-1.5 text-center font-[var(--font-dm-sans)] text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--sage)]">
              You may also like
            </p>
            <h2 className="mb-8 text-center font-[var(--font-cormorant)] text-[clamp(1.5rem,3.5vw,2.5rem)] font-semibold text-[var(--text-primary)]">
              Explore related products
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}

        <section className="border-t border-[var(--border)] bg-[var(--bg-card)] px-4 py-8 text-center sm:px-8">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 font-[var(--font-dm-sans)] text-[14px] font-medium text-[var(--text-primary)] no-underline transition-colors hover:text-[var(--sage)]"
          >
            ← Back to full catalogue
          </Link>
        </section>
      </div>
    </>
  );
}
