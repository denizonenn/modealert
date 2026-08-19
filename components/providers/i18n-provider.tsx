"use client"

import { createContext, useContext, useMemo } from "react"

import type { Locale } from "@/lib/i18n/config"
import type { Dictionary } from "@/lib/i18n/dictionaries"

interface I18nValue {
  locale: Locale
  dict: Dictionary
  /** Prefixes an app-internal path with the active locale. */
  path: (href: string) => string
}

const I18nContext = createContext<I18nValue | null>(null)

// Client Components can't read `next/root-params` or load a dictionary
// (both are server-only), so the root layout resolves both once on the
// server and seeds them here. Dictionaries are small JSON objects, so
// the added payload is negligible next to shipping a client-side i18n
// runtime.
export function I18nProvider({
  locale,
  dict,
  children,
}: {
  locale: Locale
  dict: Dictionary
  children: React.ReactNode
}) {
  const value = useMemo<I18nValue>(
    () => ({
      locale,
      dict,
      path: (href: string) =>
        href.startsWith("/") ? `/${locale}${href}` : href,
    }),
    [locale, dict]
  )

  return (
    <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
  )
}

export function useI18n(): I18nValue {
  const value = useContext(I18nContext)

  if (!value) {
    throw new Error("useI18n must be used inside <I18nProvider>")
  }

  return value
}
