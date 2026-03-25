import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { absoluteUrl, getDefaultShareImagePath, getSiteOrigin } from "@/lib/site";
import { clipMetaDescription, collectionSeoTitle } from "@/lib/seo";
import {
  getServerCollection,
  getServerCollections,
  getServerProductsByCollection,
} from "@/lib/catalog-server";
import { ProductCard } from "@/components/ProductCard";
import { AnimatedSection } from "@/components/AnimatedSection";
import { AnimatedStagger } from "@/components/AnimatedStagger";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 120;
export const dynamicParams = true;

export async function generateStaticParams() {
  const collections = await getServerCollections();
  return collections.map((c) => ({ slug: c.slug }));
}

const genericCollectionDesc =
  "Shop online at Artzen. Cash on Delivery across Pakistan.";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const origin = getSiteOrigin();
  const { slug } = await params;
  const collection = await getServerCollection(slug);
  if (!collection) return { title: "Collection" };
  const title = collectionSeoTitle(slug, collection.name);
  const descBase =
    slug === "islamic-calligraphy"
      ? `${collection.description?.trim() || collection.name}. Premium Islamic calligraphy and MDF wall art. COD nationwide.`
      : `${collection.description?.trim() || `${collection.name} at Artzen.`} ${genericCollectionDesc}`;
  const description = clipMetaDescription(descBase);
  const url = `${origin}/collections/${slug}`;
  const ogImage = absoluteUrl(getDefaultShareImagePath());
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "Artzen",
      type: "website",
      locale: "en_PK",
      images: [{ url: ogImage, alt: `${collection.name} — Artzen` }],
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
    `${collection.name} — wall art and decor at Artzen. Cash on Delivery in Pakistan.`;

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

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <nav aria-label="Breadcrumb">
        <ol
          className="mb-6 flex flex-wrap items-center gap-x-2 text-sm text-[var(--text-secondary)] [&>li:not(:last-child)]:after:mx-2 [&>li:not(:last-child)]:after:content-['/']"
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
        <p className="mt-2 max-w-2xl text-[var(--text-secondary)]">
          {isIslamicCalligraphy ? (
            <>
              {collection.description || ""} Handcrafted Islamic calligraphy and
              MDF pieces for your home. We deliver across Pakistan with Cash on
              Delivery.
            </>
          ) : (
            <>
              {collection.description || `Browse ${collection.name} at Artzen.`}{" "}
              Quality picks, careful packaging, Cash on Delivery nationwide.
            </>
          )}
        </p>
      </AnimatedSection>
      <AnimatedStagger
        className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        childClassName=""
      >
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </AnimatedStagger>
    </div>
  );
}
