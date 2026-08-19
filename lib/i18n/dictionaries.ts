import { lang } from "next/root-params";

import { DEFAULT_LOCALE, isLocale, type Locale } from "./config";

import type en from "./dictionaries/en.json";

// English is the source of truth for the shape — every other
// dictionary is type-checked against it, so a missing or misspelled
// key in tr.json is a build error rather than an "undefined" rendered
// to a real user.
export type Dictionary = typeof en;

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () =>
    import("./dictionaries/en.json").then((m) => m.default),
  tr: () =>
    import("./dictionaries/tr.json").then(
      (m) => m.default as Dictionary
    ),
};

export async function getDictionaryFor(
  locale: Locale
): Promise<Dictionary> {
  return dictionaries[locale]();
}

// Resolves the locale from the [lang] root param, so pages and
// components don't have to thread it through props. Falls back to the
// default rather than 404-ing: proxy.ts guarantees a valid locale
// prefix on every real request, so an unknown value here means
// something internal went wrong, and showing English beats showing an
// error page.
export async function getLocale(): Promise<Locale> {
  const value = await lang();

  return value && isLocale(value) ? value : DEFAULT_LOCALE;
}

export async function getDictionary(): Promise<Dictionary> {
  return getDictionaryFor(await getLocale());
}
