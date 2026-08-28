import type { Metadata } from "next";

import { LOCALES, type Locale } from "./config";

// Page-level hreflang, on top of the sitemap-level hreflang already
// in app/sitemap.ts (see docs/06_DECISIONS.md ADR-054 "Faz 4") — an
// extra signal layer, not a replacement. Relative paths resolve
// against the root layout's `metadataBase`. Only worth adding to
// pages that are actually indexable — every route behind
// `robots: { index: false }` (dashboard, admin, auth, onboarding,
// unsubscribed) skips this on purpose, since hreflang on a page
// search engines are told not to index has no effect.
export function localeAlternates(
  locale: Locale,
  path: string
): Metadata["alternates"] {
  return {
    canonical: `/${locale}${path}`,
    languages: Object.fromEntries(
      LOCALES.map((l) => [l, `/${l}${path}`])
    ),
  };
}
