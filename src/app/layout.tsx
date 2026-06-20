import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import {
  absoluteUrl,
  canonicalUrl,
  getContactPhoneE164,
  getGoogleSiteVerification,
  getOgShareImageMetadata,
  getSameAsUrls,
  getSiteOrigin,
  SITE_BRAND,
} from "@/lib/site";
import "./globals.css";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ClientCartWrapper } from "@/components/ClientCartWrapper";
import { CatalogLiveProvider } from "@/context/CatalogLiveContext";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { MobileTabBar } from "@/components/MobileTabBar";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  adjustFontFallback: true,
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  adjustFontFallback: true,
});

const siteOrigin = getSiteOrigin();
const defaultOgImage = getOgShareImageMetadata();
const siteLogoPath = "/Artzens-logo.png";
const faviconPath = "/Artzen-favicon.png";
const googleVerification = getGoogleSiteVerification();
const sameAs = getSameAsUrls();

const siteDescription =
  "Pakistan's favourite online store. Shop home decor, fashion, gifts, wall art and more. Cash on Delivery nationwide. Shop now at Artzens.com.";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#7DAA8A",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  icons: {
    icon: [{ url: faviconPath, type: "image/png" }],
    shortcut: [faviconPath],
    apple: [{ url: "/apple-touch-icon.png", type: "image/png", sizes: "180x180" }],
  },
  manifest: "/site.webmanifest",
  title: {
    default: `Shop Everything Online | ${SITE_BRAND} — Pakistan's Favourite Store`,
    template: `%s | ${SITE_BRAND}`,
  },
  description: siteDescription,
  authors: [{ name: SITE_BRAND, url: siteOrigin }],
  keywords: [
    "online shopping Pakistan",
    "Cash on Delivery Pakistan",
    "home decor Pakistan",
    "gifts Pakistan",
    "wall art Pakistan",
    SITE_BRAND,
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
    siteName: SITE_BRAND,
    locale: "en_PK",
    description: siteDescription,
    type: "website",
    url: canonicalUrl("/"),
    images: [
      {
        url: defaultOgImage.url,
        width: defaultOgImage.width,
        height: defaultOgImage.height,
        alt: defaultOgImage.alt,
        type: defaultOgImage.type,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    description: siteDescription,
    images: [defaultOgImage.url],
  },
  other: {
    publisher: SITE_BRAND,
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${siteOrigin}/#organization`,
  name: SITE_BRAND,
  alternateName: ["Artzens.com", "Artzen"],
  url: siteOrigin,
  logo: {
    "@type": "ImageObject",
    url: absoluteUrl(siteLogoPath),
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
  name: SITE_BRAND,
  url: siteOrigin,
  publisher: { "@id": `${siteOrigin}/#organization` },
  description: siteDescription,
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
        <GoogleAnalytics />
        <CatalogLiveProvider>
          <ClientCartWrapper>
            <AnnouncementBar />
            <SiteHeader />
            <main className="site-main">{children}</main>
            <SiteFooter />
            <MobileTabBar />
            <WhatsAppFloat />
          </ClientCartWrapper>
        </CatalogLiveProvider>
      </body>
    </html>
  );
}
