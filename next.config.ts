import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
    ];
  },
};

export default nextConfig;
