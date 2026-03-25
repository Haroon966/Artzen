import type { Metadata } from "next";
import Link from "next/link";
import { getSiteOrigin } from "@/lib/site";

export const metadata: Metadata = {
  title: "Buying Guide | How to Choose Islamic Wall Art",
  description:
    "How to choose Islamic wall art for your home. MDF vs other materials, sizing, and placement. Premium Islamic home decor Pakistan.",
  alternates: { canonical: `${getSiteOrigin()}/guide` },
};

export default function GuidePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-serif text-3xl font-bold text-forest">
        Buying Guide: Islamic Wall Art
      </h1>
      <p className="mt-4 text-lg text-forest/80">
        A short guide to choosing the right Islamic wall art and MDF
        calligraphy for your space.
      </p>
      <div className="mt-10 space-y-8 text-forest/80">
        <section>
          <h2 className="font-serif text-xl font-semibold text-forest">
            Why Islamic wall art?
          </h2>
          <p className="mt-2">
            Islamic calligraphy and wall art bring meaning and barakah into
            your home. Pieces like Allah name, Bismillah, Ayatul Kursi, and
            Loh-e-Qurani are timeless and suit living rooms, bedrooms, and
            entrance halls.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-xl font-semibold text-forest">
            MDF vs other materials
          </h2>
          <p className="mt-2">
            MDF (medium-density fibreboard) is durable, smooth, and holds
            detail well. It is lighter than solid wood and often more
            affordable, while still looking premium when hand-finished. Our
            MDF pieces are finished with care for a long-lasting look.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-xl font-semibold text-forest">
            Sizing and placement
          </h2>
          <p className="mt-2">
            Choose a size that fits your wall. Above the sofa or bed, larger
            pieces (e.g. 24&quot; x 24&quot;) work well. For doorways or smaller
            walls, 12&quot; x 24&quot; or 16&quot; x 16&quot; can be ideal.
            Check product dimensions before ordering.
          </p>
        </section>
      </div>
      <div className="mt-10 border-t border-amber-900/10 pt-8">
        <p className="font-medium text-forest">Explore our collections:</p>
        <ul className="mt-2 space-y-1">
          <li>
            <Link
              href="/collections/islamic-calligraphy"
              className="text-gold hover:underline"
            >
              Islamic Calligraphy
            </Link>
          </li>
          <li>
            <Link
              href="/collections/mdf-wall-art"
              className="text-gold hover:underline"
            >
              MDF Wall Art
            </Link>
          </li>
          <li>
            <Link
              href="/collections/home-decor"
              className="text-gold hover:underline"
            >
              Home Decor
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
