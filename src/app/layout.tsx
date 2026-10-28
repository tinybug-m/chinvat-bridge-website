import type { Metadata } from "next";
import "./globals.css";
import { archivo, martianMono } from "@/styles/fonts";
import { REVEAL_RUNTIME } from "@/components/motion/reveal-runtime";
import { CONTACT_EMAIL, SITE_DESCRIPTION, SITE_NAME, SITE_URL, SITE_TITLE } from "@/lib/constants";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: SITE_NAME,
  description: SITE_DESCRIPTION,
  url: SITE_URL,
  email: CONTACT_EMAIL,
  areaServed: "Worldwide",
  address: {
    "@type": "PostalAddress",
    addressCountry: "GB",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-GB"
      data-scroll-behavior="smooth"
      className={`${archivo.variable} ${martianMono.variable} h-full scroll-smooth antialiased`}
      // The reveal runtime adds a class before React hydrates.
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: REVEAL_RUNTIME }} />
      </head>
      <body className="flex min-h-full flex-col bg-paper font-body text-ink selection:bg-cobalt-700 selection:text-paper">
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </body>
    </html>
  );
}
