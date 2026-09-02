// Adding a language is meant to be one dictionary file plus one entry
// here — no code changes anywhere else. See docs/06_DECISIONS.md
// ADR-054.
export const LOCALES = ["en", "tr"] as const;

export type Locale = (typeof LOCALES)[number];

// English stays the default: every provider-supplied event title and
// third-party description is English at the source, so it's the one
// locale where a page is guaranteed internally consistent.
export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  tr: "Türkçe",
};

// The browsing-language cookie proxy.ts reads/writes and the language
// switcher writes directly — shared here so a third reader (the
// welcome/magic-link email, which want "what language was this
// visitor already seeing the site in" at signup time) doesn't
// duplicate the literal.
export const LOCALE_COOKIE_NAME = "modealert-locale";

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

// Picks the best supported locale from an Accept-Language header.
// Deliberately hand-rolled rather than pulling in Negotiator +
// intl-localematcher: the full matching spec buys nothing for a
// two-locale list, and this stays dependency-free and testable.
export function resolveLocale(
  acceptLanguage: string | null
): Locale {
  if (!acceptLanguage) {
    return DEFAULT_LOCALE;
  }

  const ranked = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");

      const qParam = params.find((p) => p.trim().startsWith("q="));
      const quality = qParam
        ? Number.parseFloat(qParam.trim().slice(2))
        : 1;

      return {
        tag: tag.trim().toLowerCase(),
        quality: Number.isFinite(quality) ? quality : 0,
      };
    })
    .filter((entry) => entry.tag.length > 0 && entry.quality > 0)
    .sort((a, b) => b.quality - a.quality);

  for (const { tag } of ranked) {
    // Match "tr" and "tr-TR" alike — region is irrelevant here.
    const base = tag.split("-")[0];

    if (isLocale(base)) {
      return base;
    }
  }

  return DEFAULT_LOCALE;
}
