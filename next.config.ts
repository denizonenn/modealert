import type { NextConfig } from "next";

// Every third-party call in this app (Riot, Bungie, Resend, etc.)
// happens server-side — the browser never talks to them directly — and
// fonts are self-hosted via next/font at build time, no images are
// loaded from remote hosts. The one exception is Paddle Checkout
// (ADR-066): Paddle.js loads from cdn.paddle.com and renders the
// payment form in an iframe from (sandbox-)buy.paddle.com, so those
// origins are allowlisted — card details never touch our own page.
// `'unsafe-inline'` on script/style is a pragmatic middle ground (it
// covers the homepage's JSON-LD `<script>` and inline `style` props)
// rather than the stricter nonce-based approach, which would need
// deeper integration with the mixed static/dynamic rendering this app
// already uses — a real future improvement, not required to close the
// gap of having no CSP at all.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://cdn.paddle.com",
  "style-src 'self' 'unsafe-inline' https://cdn.paddle.com",
  "img-src 'self' data: https://*.paddle.com",
  "font-src 'self' data:",
  "connect-src 'self' https://*.paddle.com",
  "frame-src https://buy.paddle.com https://sandbox-buy.paddle.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "Content-Security-Policy", value: CSP },
        ],
      },
    ];
  },
};

export default nextConfig;
