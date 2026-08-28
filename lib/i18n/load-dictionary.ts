import { type Locale } from "./config";

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

// Deliberately in its own module, separate from dictionaries.ts:
// that file imports `next/root-params`, which only exists inside
// Next's compiler and throws anywhere else (a background job, a
// unit test). Code with no request scope — notification building,
// the sync cron — imports this instead and passes the locale
// explicitly.
export async function getDictionaryFor(
  locale: Locale
): Promise<Dictionary> {
  return dictionaries[locale]();
}
