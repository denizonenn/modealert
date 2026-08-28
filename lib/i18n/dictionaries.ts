import { lang } from "next/root-params";

import { DEFAULT_LOCALE, isLocale, type Locale } from "./config";

import type en from "./dictionaries/en.json";
import type tr from "./dictionaries/tr.json";

export type Dictionary = typeof en;

// A real compile-time shape check, not just the `as Dictionary` cast
// below — that cast only needs *some* type overlap and silently lets
// tr.json be missing a key en.json has. This line fails to compile if
// typeof tr isn't assignable to Dictionary, i.e. an actually missing
// or mistyped key. Type-only (`import type`), so it costs nothing at
// runtime — tr.json still loads via the dynamic import below, not
// through this line.
/* eslint-disable @typescript-eslint/no-unused-vars -- both types below exist only for the compile-time check itself, never referenced by name */
type AssertExtends<T, _U extends T> = never;
type _TrMatchesDictionary = AssertExtends<Dictionary, typeof tr>;
/* eslint-enable @typescript-eslint/no-unused-vars */

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
