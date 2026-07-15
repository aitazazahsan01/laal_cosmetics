import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";

import "./globals.css";
import { bodyFont, headingFont } from "./fonts";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { SITE } from "@/lib/config";

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
