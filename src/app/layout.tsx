import type { Metadata } from "next";
import "./globals.css";
import { REVEAL_RUNTIME } from "@/components/motion/reveal-runtime";
import { JourneyRecorder } from "@/components/site/JourneyRecorder";
import { ShellChromeProvider } from "@/components/site/ShellChromeProvider";
import { shellChrome } from "@/components/site/nav";
import { SITE_URL } from "@/lib/constants";
import { getSiteChrome } from "@/lib/content/read";

/** Site-wide defaults from settings:site; every page refines them. */
export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getSiteChrome();
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: settings.siteTitle,
      template: `%s — ${settings.siteName}`,
    },
    description: settings.siteDescription,
    openGraph: {
      title: settings.siteTitle,
      description: settings.siteDescription,
      url: SITE_URL,
      siteName: settings.siteName,
      locale: "en_GB",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: settings.siteTitle,
      description: settings.siteDescription,
    },
    robots: {
      index: true,
      follow: true,
    },
    /*
     * Search Console and Bing Webmaster Tools ownership, by meta tag. Only needed if a property is
     * verified with the HTML-tag method rather than DNS (the Domain property uses DNS and needs
     * nothing here). Each tag is emitted only when its variable is set in the environment.
     */
    verification: {
      ...(process.env.GOOGLE_SITE_VERIFICATION && { google: process.env.GOOGLE_SITE_VERIFICATION }),
      ...(process.env.BING_SITE_VERIFICATION && { other: { "msvalidate.01": process.env.BING_SITE_VERIFICATION } }),
    },
  };
}

const ORGANIZATION_ID = `${SITE_URL}/#organization`;

/** Organization (never LocalBusiness, never a legalName) and WebSite, from settings:site. */
function siteJsonLd(settings: Awaited<ReturnType<typeof getSiteChrome>>["settings"]) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": ORGANIZATION_ID,
        name: settings.siteName,
        description: `${settings.siteDescription} ${settings.siteOrigin}`,
        url: SITE_URL,
        logo: `${SITE_URL}/brand/chinvat-bridge-mark.png`,
        email: settings.contactEmail,
        areaServed: settings.organization.areaServed,
        address: { "@type": "PostalAddress", addressCountry: settings.organization.addressCountry },
        knowsAbout: settings.organization.knowsAbout,
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: settings.siteName,
        description: settings.siteDescription,
        inLanguage: "en-GB",
        publisher: { "@id": ORGANIZATION_ID },
      },
    ],
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const { settings, navigation } = await getSiteChrome();
  return (
    <html
      lang="en-GB"
      data-scroll-behavior="smooth"
      className="h-full scroll-smooth antialiased"
      // The reveal runtime adds a class before React hydrates.
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: REVEAL_RUNTIME }} />
      </head>
      <body className="flex min-h-full flex-col bg-paper font-body text-ink selection:bg-cobalt-700 selection:text-paper">
        {/* The shell's copy for Client Components (the error boundary); server pages read it directly. */}
        <ShellChromeProvider chrome={shellChrome(navigation, settings)}>{children}</ShellChromeProvider>
        {/* Every route, whatever its shell, so "page before contact" is always the real one. */}
        <JourneyRecorder />
        <script
          type="application/ld+json"
          // Escaped so no string in the data can close the script element.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd(settings)).replace(/</g, "\\u003c") }}
        />
      </body>
    </html>
  );
}
