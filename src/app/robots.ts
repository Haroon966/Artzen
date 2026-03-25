import type { MetadataRoute } from "next";
import { getSiteOrigin } from "@/lib/site";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const origin = getSiteOrigin();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/checkout", "/cart", "/favorites", "/api"],
    },
    sitemap: `${origin}/sitemap.xml`,
  };
}
