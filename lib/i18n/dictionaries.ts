import { lang } from "next/root-params";

import { DEFAULT_LOCALE, isLocale, type Locale } from "./config";

import { getDictionaryFor, type Dictionary } from "./load-dictionary";

// Re-exported so the many existing `from "@/lib/i18n/dictionaries"`
// imports keep working — but note this module pulls in
// `next/root-params`, which only resolves inside Next's compiler.
// Anything without a request scope (background jobs, unit tests)
// must import from "./load-dictionary" directly instead.
export { getDictionaryFor };
export type { Dictionary };

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
