"use client";

import Script from "next/script";
import { getGaMeasurementId } from "@/lib/analytics";

export function GoogleAnalytics() {
  const id = getGaMeasurementId();
  if (!id) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`}
        strategy="lazyOnload"
      />
      <Script id="ga4-gtag-init" strategy="lazyOnload">
        {`
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', ${JSON.stringify(id)}, { send_page_view: true });
`}
      </Script>
    </>
  );
}
