import type { Metadata } from "next";
import "./globals.css";
import { LOGO_MATERIAL_RUNTIME } from "@/components/brand/logo-material";
import { REVEAL_RUNTIME } from "@/components/motion/reveal-runtime";
import { CONTACT_EMAIL, SITE_DESCRIPTION, SITE_NAME, SITE_ORIGIN, SITE_URL, SITE_TITLE } from "@/lib/constants";

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

const ORGANIZATION_ID = `${SITE_URL}/#organization`;

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": ORGANIZATION_ID,
      name: SITE_NAME,
      legalName: "Chinvat Bridge Ltd",
      description: `${SITE_DESCRIPTION} ${SITE_ORIGIN}`,
      url: SITE_URL,
      logo: `${SITE_URL}/brand/chinvat-bridge-mark.png`,
      email: CONTACT_EMAIL,
      areaServed: "Worldwide",
      address: { "@type": "PostalAddress", addressCountry: "GB" },
      knowsAbout: ["Artificial intelligence", "Business automation", "Custom software", "Technical SEO"],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      inLanguage: "en-GB",
      publisher: { "@id": ORGANIZATION_ID },
    },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-GB"
      data-scroll-behavior="smooth"
      className="h-full scroll-smooth antialiased"
      // The logo material choice (chrome by default).
      data-logo-material="chrome"
      // The reveal runtime adds a class and the logo material script an attribute before React hydrates.
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: LOGO_MATERIAL_RUNTIME }} />
        <script dangerouslySetInnerHTML={{ __html: REVEAL_RUNTIME }} />
      </head>
      <body className="flex min-h-full flex-col bg-paper font-body text-ink selection:bg-cobalt-700 selection:text-paper">
        {children}
        <script
          type="application/ld+json"
          // Escaped so no string in the data can close the script element.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
      </body>
    </html>
  );
}
