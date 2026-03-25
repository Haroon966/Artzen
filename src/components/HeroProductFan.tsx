import Image from "next/image";
import Link from "next/link";
import type { HeroStripItem } from "@/lib/data";
import { productDisplayName } from "@/lib/product-name";

function formatPrice(price: number) {
  return `Rs. ${price.toLocaleString("en-PK")}`;
}

const cardClasses = [
  "hidden w-[100px] h-[180px] -rotate-[9deg] translate-y-[30px] origin-bottom md:block md:w-[130px] md:h-[240px]",
  "w-[110px] h-[200px] -rotate-[5deg] translate-y-[15px] origin-bottom md:w-[150px] md:h-[270px]",
  "w-[120px] h-[220px] -rotate-[2deg] translate-y-[5px] origin-bottom md:w-[170px] md:h-[310px]",
  "w-[130px] h-[238px] rotate-0 z-[5] origin-bottom md:w-[180px] md:h-[330px]",
  "w-[120px] h-[220px] rotate-[2deg] translate-y-[5px] origin-bottom md:w-[170px] md:h-[310px]",
  "w-[110px] h-[200px] rotate-[5deg] translate-y-[15px] origin-bottom md:w-[150px] md:h-[270px]",
  "hidden w-[100px] h-[180px] rotate-[9deg] translate-y-[30px] origin-bottom md:block md:w-[130px] md:h-[240px]",
];

export function HeroProductFan({ items }: { items: HeroStripItem[] }) {
  return (
    <div className="relative z-[1] flex h-[240px] w-full max-w-[1100px] items-end justify-center gap-1.5 md:h-[340px] md:gap-2.5 animate-[fadeUp_0.9s_0.15s_ease_both]">
      {items.slice(0, 7).map((item, i) => {
        const label = productDisplayName(item.product);
        return (
        <Link
          key={`${item.product.id}-${i}`}
          href={`/products/${item.product.slug}`}
          className={`prod-card group relative shrink-0 overflow-hidden rounded-[var(--radius)] bg-[#c8bfb0] transition-all duration-300 hover:!z-10 hover:!-translate-y-3 hover:!scale-105 hover:!rotate-0 hover:shadow-[0_24px_60px_rgba(0,0,0,0.22)] ${cardClasses[i]}`}
        >
          <Image
            src={item.product.image}
            alt={label}
            width={180}
            height={330}
            className="h-full w-full object-cover"
            unoptimized
          />
          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/55 to-transparent p-3.5">
            <div className="font-[var(--font-cormorant)] text-[15px] font-semibold leading-tight text-white">
              {label.length > 22
                ? label.slice(0, 22) + "…"
                : label}
            </div>
            <div className="mt-0.5 text-[12px] font-medium text-[var(--gold2)]">
              {item.product.originalPrice != null && item.product.originalPrice > item.product.price ? (
                <>
                  <span className="line-through opacity-80 mr-1">{formatPrice(item.product.originalPrice)}</span>
                  {formatPrice(item.product.price)}
                </>
              ) : (
                formatPrice(item.product.price)
              )}
            </div>
          </div>
          {item.badge && (
            <div className="absolute left-3 top-3 rounded-full bg-[var(--gold)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[var(--dark)]">
              {item.badge}
            </div>
          )}
        </Link>
        );
      })}
    </div>
  );
}
