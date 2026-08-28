import type { MetadataRoute } from "next"

import { SITE_URL } from "@/lib/constants/site"
import { LOCALES } from "@/lib/i18n/config"

// Every real page lives under /<locale>/..., so a bare "/dashboard"
// disallow rule (robots.txt matches by prefix) never actually matched
// the real URL "/en/dashboard" — this crawled and indexed pages that
// were supposed to be blocked. Generated per locale instead of
// hand-listing "/en/dashboard", "/tr/dashboard", etc., so a third
// locale doesn't silently reopen this same gap.
const PRIVATE_PATHS = ["/dashboard", "/onboarding", "/signin"]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        ...LOCALES.flatMap((locale) =>
          PRIVATE_PATHS.map((path) => `/${locale}${path}`)
        ),
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
