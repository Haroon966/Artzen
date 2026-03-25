import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import {
  absoluteUrl,
  getContactPhoneE164,
  getDefaultShareImagePath,
  getGoogleSiteVerification,
  getSameAsUrls,
  getSiteOrigin,
} from "@/lib/site";
import "./globals.css";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { ClientCartWrapper } from "@/components/ClientCartWrapper";
import { MobileTabBar } from "@/components/MobileTabBar";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const siteOrigin = getSiteOrigin();
const defaultShareImageUrl = absoluteUrl(getDefaultShareImagePath());
const googleVerification = getGoogleSiteVerification();
const sameAs = getSameAsUrls();

const siteDescription =
  "Pakistan's favourite online store. Shop home decor, fashion, gifts, wall art and more. Cash on Delivery nationwide. Shop now at Artzen.pk.";

export const viewport: Viewport = {
  themeColor: "#7DAA8A",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: {
    default: "Shop Everything Online | Artzen — Pakistan's Favourite Store",
    template: "%s | Artzen",
  },
  description: siteDescription,
  authors: [{ name: "Artzen", url: siteOrigin }],
  keywords: [
    "online shopping Pakistan",
    "Cash on Delivery Pakistan",
    "home decor Pakistan",
    "gifts Pakistan",
    "wall art Pakistan",
    "Artzen",
    "ecommerce Pakistan",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  ...(googleVerification
    ? { verification: { google: googleVerification } }
    : {}),
  openGraph: {
    siteName: "Artzen",
    locale: "en_PK",
    description: siteDescription,
    type: "website",
    images: [{ url: defaultShareImageUrl, alt: "Artzen — online shopping in Pakistan" }],
  },
  twitter: {
    card: "summary_large_image",
    description: siteDescription,
    images: [defaultShareImageUrl],
  },
  other: {
    publisher: "Artzen",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${siteOrigin}/#organization`,
  name: "Artzen",
  alternateName: "Artzen.pk",
  url: siteOrigin,
  logo: {
    "@type": "ImageObject",
    url: defaultShareImageUrl,
  },
  description: siteDescription,
  areaServed: { "@type": "Country", name: "Pakistan" },
  address: {
    "@type": "PostalAddress",
    addressCountry: "PK",
    addressRegion: "Punjab",
    addressLocality: "Lahore",
  },
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone: getContactPhoneE164(),
      contactType: "customer service",
      areaServed: "PK",
      availableLanguage: ["English", "Urdu"],
    },
  ],
  ...(sameAs.length > 0 ? { sameAs } : {}),
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${siteOrigin}/#website`,
  name: "Artzen",
  url: siteOrigin,
  publisher: { "@id": `${siteOrigin}/#organization` },
  description: siteDescription,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${siteOrigin}/shop?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${dmSans.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema),
          }}
        />
      </head>
      <body className="min-h-screen bg-cream text-muted antialiased">
        <ClientCartWrapper>
          <AnnouncementBar />
          <SiteHeader />
          <main className="site-main">{children}</main>
          <SiteFooter />
          <MobileTabBar />
          <WhatsAppFloat />
        </ClientCartWrapper>
      </body>
    </html>
  );
}
