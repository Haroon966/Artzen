import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  absoluteUrl,
  canonicalUrl,
  getDefaultShareImagePath,
  getSiteOrigin,
  SITE_BRAND,
} from "@/lib/site";
import { clipMetaDescription, collectionSeoTitle } from "@/lib/seo";
import {
  getServerCollection,
  getServerCollections,
  getServerProductsByCollection,
} from "@/lib/catalog-server";
import { AnimatedSection } from "@/components/AnimatedSection";
import { CollectionProductGallery } from "../CollectionProductGallery";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export async function generateStaticParams() {
  const collections = await getServerCollections();
  return collections.map((c) => ({ slug: c.slug }));
}

const genericCollectionDesc = `Shop online at ${SITE_BRAND}. Cash on Delivery across Pakistan.`;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const origin = getSiteOrigin();
  const { slug } = await params;
  const collection = await getServerCollection(slug);
  if (!collection) return { title: "Collection" };
  const title = collectionSeoTitle(slug, collection.name);
  const descBase =
    slug === "islamic-calligraphy"
      ? `${collection.description?.trim() || collection.name}. Premium Islamic calligraphy and MDF wall art. COD nationwide.`
      : `${collection.description?.trim() || `${collection.name} at ${SITE_BRAND}.`} ${genericCollectionDesc}`;
  const description = clipMetaDescription(descBase);
  const url = canonicalUrl(`/collections/${slug}`);
  const ogImage = absoluteUrl(getDefaultShareImagePath());
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_BRAND,
      type: "website",
      locale: "en_PK",
      images: [{ url: ogImage, alt: `${collection.name} — ${SITE_BRAND}` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;
  const collection = await getServerCollection(slug);
  if (!collection) notFound();

  const products = await getServerProductsByCollection(slug);
  const isIslamicCalligraphy = slug === "islamic-calligraphy";
  const origin = getSiteOrigin();
  const collectionUrl = `${origin}/collections/${slug}`;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: origin },
      {
        "@type": "ListItem",
        position: 2,
        name: collection.name,
        item: collectionUrl,
      },
    ],
  };

  const listDescription =
    collection.description?.trim() ||
    `Shop ${collection.name} at ${SITE_BRAND}: handcrafted wall art and decor in multiple sizes, secure packaging, and Cash on Delivery across Pakistan.`;

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: collection.name,
    description: listDescription,
    url: collectionUrl,
    numberOfItems: products.length,
    itemListElement: products.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: p.name,
      item: `${origin}/products/${p.slug}`,
    })),
  };

  const gutterX = "px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-16";

  return (
    <div className="w-full max-w-none">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <div
        className={`collection-page-toolbar sticky z-40 w-full border-b border-[var(--nav-border)] bg-cream/95 py-4 backdrop-blur-md supports-[backdrop-filter]:bg-cream/90 ${gutterX}`}
      >
        <nav aria-label="Breadcrumb">
          <ol
            className="mb-3 flex flex-wrap items-center gap-x-2 text-sm text-[var(--text-secondary)] [&>li:not(:last-child)]:after:mx-2 [&>li:not(:last-child)]:after:content-['/']"
            itemScope
            itemType="https://schema.org/BreadcrumbList"
          >
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <Link
                itemProp="item"
                href="/"
                className="text-[var(--text-primary)]/80 no-underline hover:text-[var(--text-primary)]"
              >
                <span itemProp="name">Home</span>
              </Link>
              <meta itemProp="position" content="1" />
            </li>
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <span itemProp="name" className="text-[var(--text-primary)]">
                {collection.name}
              </span>
              <meta itemProp="position" content="2" />
            </li>
          </ol>
        </nav>
        <AnimatedSection as="div">
          <h1 className="font-serif text-3xl font-bold text-[var(--text-primary)]">
            {collection.name}
          </h1>
        </AnimatedSection>
      </div>
      <div className={`w-full pb-16 pt-6 sm:pb-20 ${gutterX}`}>
        <AnimatedSection as="div">
          <p className="max-w-3xl text-[var(--text-secondary)]">
            {isIslamicCalligraphy ? (
              <>
                {collection.description || ""} Handcrafted Islamic calligraphy and MDF pieces for
                your home. We deliver across Pakistan with Cash on Delivery.
              </>
            ) : (
              <>
                {collection.description ||
                  `Browse ${collection.name} at ${SITE_BRAND} with curated handmade designs, size options, and dependable Cash on Delivery service.`}{" "}
                Every order is packed for safe nationwide delivery.
              </>
            )}
          </p>
        </AnimatedSection>
        <div className="mt-8">
          <CollectionProductGallery products={products} collectionName={collection.name} />
        </div>
      </div>
    </div>
  );
}
