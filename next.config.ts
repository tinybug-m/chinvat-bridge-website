import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keeps local screenshots clean; build and runtime errors still surface.
  devIndicators: false,
  // No X-Powered-By: it only tells a scanner which framework (and so which advisories) to try.
  poweredByHeader: false,
  async redirects() {
    return [
      // There is no services hub page; the homepage section is the hub, and the header's
      // "Services" link already goes there (owner, 21 Nov 2026).
      { source: "/services", destination: "/#services", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Prevents the site being framed by another origin (clickjacking) — relevant
          // here since the app has real login and payment forms.
          { key: "X-Frame-Options", value: "DENY" },
          // Stops browsers from MIME-sniffing a response away from its declared
          // Content-Type, which can otherwise turn an upload into executable script.
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Sends the full URL as a referrer only for same-origin navigations; a
          // cross-origin request only gets the origin, not full paths/query strings
          // (some of which, like Stripe's session_id, are otherwise sensitive).
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Disables browser features this site never uses.
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        // Checkout return and sign-in steps: never cached, never send their URL (which carries a
        // Stripe session id) as a referrer anywhere.
        source: "/subscribe/success",
        headers: [
          { key: "Cache-Control", value: "private, no-store, max-age=0" },
          { key: "Referrer-Policy", value: "no-referrer" },
        ],
      },
      {
        source: "/auth/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-store, max-age=0" },
          { key: "Referrer-Policy", value: "no-referrer" },
        ],
      },
      {
        // Brand textures keep their file names, so revalidate daily rather than
        // pinning them immutable (a replaced texture must not stay stale for a year).
        source: "/brand/:file*.webp",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      },
    ];
  },
};

export default nextConfig;
