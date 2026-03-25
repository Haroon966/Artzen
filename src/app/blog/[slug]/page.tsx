import type { Metadata } from "next";
import {
  absoluteUrl,
  getDefaultShareImagePath,
  getSiteOrigin,
} from "@/lib/site";
import { clipMetaDescription } from "@/lib/seo";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogArticle, getBlogSlugs } from "@/lib/blog";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const origin = getSiteOrigin();
  const { slug } = await params;
  const post = getBlogArticle(slug);
  if (!post) return { title: "Article" };
  const description = clipMetaDescription(post.description);
  const url = `${origin}/blog/${slug}`;
  const ogImage = absoluteUrl(getDefaultShareImagePath());
  return {
    title: post.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description,
      url,
      type: "article",
      publishedTime: post.date,
      images: [{ url: ogImage, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: [ogImage],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogArticle(slug);
  if (!post) notFound();

  const origin = getSiteOrigin();
  const pageUrl = `${origin}/blog/${slug}`;
  const shareImage = absoluteUrl(getDefaultShareImagePath());

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    image: shareImage,
    author: {
      "@type": "Organization",
      name: "Artzen",
      url: origin,
    },
    publisher: {
      "@type": "Organization",
      name: "Artzen",
      logo: {
        "@type": "ImageObject",
        url: shareImage,
        width: 1200,
        height: 630,
      },
    },
    datePublished: post.date,
    dateModified: post.date,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": pageUrl,
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: origin },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${origin}/blog` },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: pageUrl,
      },
    ],
  };

  return (
    <article className="bg-cream-deep">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <header className="relative overflow-hidden bg-[var(--slate)] px-4 pb-14 pt-10 sm:px-6 sm:pb-16 sm:pt-14 md:pb-20 md:pt-16">
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-48 w-[140%] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(125,170,138,0.12)_0%,transparent_60%)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-3xl">
          <nav aria-label="Breadcrumb">
            <ol
              className="breadcrumb-micro mb-10 flex flex-wrap items-center gap-x-2 gap-y-1 font-[var(--font-dm-sans)] text-[11px] font-medium uppercase tracking-wider text-[var(--text-on-dark-muted)] [&>li:not(:last-child)]:after:ml-2 [&>li:not(:last-child)]:after:text-[var(--sage)]/60 [&>li:not(:last-child)]:after:content-['/']"
              itemScope
              itemType="https://schema.org/BreadcrumbList"
            >
              <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                <Link
                  itemProp="item"
                  href="/"
                  className="text-[var(--text-on-dark-muted)] no-underline transition hover:text-[var(--text-on-dark)]"
                >
                  <span itemProp="name">Home</span>
                </Link>
                <meta itemProp="position" content="1" />
              </li>
              <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                <Link
                  itemProp="item"
                  href="/blog"
                  className="text-[var(--sage)] no-underline transition hover:text-[var(--sage-light)]"
                >
                  <span itemProp="name">Blog</span>
                </Link>
                <meta itemProp="position" content="2" />
              </li>
              <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                <span
                  itemProp="name"
                  className="max-w-[min(100%,280px)] truncate text-[var(--text-on-dark)]"
                >
                  {post.title}
                </span>
                <meta itemProp="position" content="3" />
              </li>
            </ol>
          </nav>
          <span className="inline-block rounded-full border border-[var(--border-accent)] bg-[var(--accent-muted)] px-3 py-1 font-[var(--font-dm-sans)] text-[10px] font-semibold uppercase tracking-wider text-[var(--sage-light)]">
            {post.category}
          </span>
          <h1 className="mt-5 font-[var(--font-cormorant)] text-[clamp(2rem,5vw,3.25rem)] font-semibold leading-[1.08] tracking-tight text-[var(--text-on-dark)]">
            {post.title}
          </h1>
          <p className="mt-5 font-[var(--font-dm-sans)] text-[16px] font-light leading-relaxed text-[var(--text-on-dark-muted)]">
            {post.description}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3 font-[var(--font-dm-sans)] text-[12px] text-[var(--text-on-dark-muted)]">
            <time dateTime={post.date}>{post.dateLabel}</time>
            <span className="text-[var(--sage)]/50">·</span>
            <span>{post.readTime} read</span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6 sm:py-16 md:py-20">
        <div className="max-w-none">
          {post.sections.map((section) => (
            <section key={section.heading} className="mb-12 last:mb-0">
              <h2 className="font-[var(--font-cormorant)] text-2xl font-semibold text-[var(--text-primary)]">
                {section.heading}
              </h2>
              {section.paragraphs.map((p, i) => (
                <p
                  key={i}
                  className="mt-4 font-[var(--font-dm-sans)] text-[16px] font-light leading-[1.75] text-muted"
                >
                  {p}
                </p>
              ))}
            </section>
          ))}
        </div>

        <div className="mt-16 rounded-[var(--radius)] border border-[var(--border-mid)] bg-[var(--bg-card)] p-8 shadow-[var(--shadow-card)]">
          <p className="font-[var(--font-cormorant)] text-lg font-semibold text-[var(--text-primary)]">
            Explore collections
          </p>
          <ul className="mt-4 space-y-2 font-[var(--font-dm-sans)] text-[14px]">
            <li>
              <Link
                href="/collections/islamic-calligraphy"
                className="text-[var(--accent)] no-underline hover:underline"
              >
                Islamic calligraphy
              </Link>
            </li>
            <li>
              <Link
                href="/collections/premium-islamic-art-collection"
                className="text-[var(--accent)] no-underline hover:underline"
              >
                Premium Islamic art
              </Link>
            </li>
            <li>
              <Link href="/shop" className="text-[var(--accent)] no-underline hover:underline">
                All products
              </Link>
            </li>
          </ul>
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/blog"
            className="font-[var(--font-dm-sans)] text-[13px] font-medium text-[var(--muted)] no-underline transition hover:text-[var(--dark)]"
          >
            ← Back to journal
          </Link>
        </div>
      </div>
    </article>
  );
}
