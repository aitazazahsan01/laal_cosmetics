import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import Script from "next/script";

import "./globals.css";
import { bodyFont, headingFont } from "./fonts";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { SITE } from "@/lib/config";

/**
 * Analytics — GA4 + Meta Pixel, both inert until LAAL supplies an ID.
 *
 * Read at module scope (not client-side) because these are public but still need an
 * env-var presence check; NEXT_PUBLIC_ vars are inlined at build time either way. When unset,
 * these render nothing at all — no empty script tags, no third-party requests.
 */
const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID;
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s — ${SITE.name}`,
  },
  description: SITE.tagline,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Light only, by brand decision — see the note in app/globals.css.
  colorScheme: "light",
  themeColor: "#FFFFFF",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  /*
   * The admin panel is a different application sharing one root layout: it must not get the
   * storefront header, footer or WhatsApp float. The path comes from a header set by
   * middleware, since a server layout cannot otherwise see which route it is wrapping.
   */
  const requestHeaders = await headers();
  const pathname = requestHeaders.get("x-laal-pathname") ?? "";
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");

  return (
    <html
      lang="en"
      className={`${headingFont.variable} ${bodyFont.variable}`}
    >
      <body>
        {isAdmin ? (
          children
        ) : (
          <>
            {GA4_ID ? (
              <>
                <Script
                  src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
                  strategy="afterInteractive"
                />
                <Script id="ga4-init" strategy="afterInteractive">
                  {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA4_ID}');`}
                </Script>
              </>
            ) : null}

            {META_PIXEL_ID ? (
              <Script id="meta-pixel-init" strategy="afterInteractive">
                {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');`}
              </Script>
            ) : null}

            <Header />
            {children}
            <Footer />
            <WhatsAppFloat />
          </>
        )}
      </body>
    </html>
  );
}
