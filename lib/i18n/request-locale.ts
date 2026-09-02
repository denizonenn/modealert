import { cookies } from "next/headers";

import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE_NAME, type Locale } from "./config";

// Reads the same browsing-language cookie proxy.ts sets, for code
// that runs during a request but outside a page/layout — so it can't
// use next/root-params (that only resolves inside the [lang] segment
// Next's compiler renders). Used by the welcome/magic-link emails,
// sent before the account has a stored User.locale of its own to
// fall back on.
export async function getRequestLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE_NAME)?.value;

  return value && isLocale(value) ? value : DEFAULT_LOCALE;
}
