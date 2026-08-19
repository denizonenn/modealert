"use client"

import { usePathname, useRouter } from "next/navigation"
import { Languages } from "lucide-react"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useI18n } from "@/components/providers/i18n-provider"
import { LOCALES, LOCALE_LABELS, type Locale } from "@/lib/i18n/config"

const LOCALE_COOKIE = "modealert-locale"
const ONE_YEAR_SECONDS = 365 * 24 * 60 * 60

// Persisted so proxy.ts stops falling back to Accept-Language —
// otherwise a Turkish browser would be redirected back to /tr on the
// next unprefixed navigation, silently undoing the choice. Lives
// outside the component because it's a side effect on a browser
// global, not component state.
function rememberLocale(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=${ONE_YEAR_SECONDS};samesite=lax`
}

export function LanguageSwitcher() {
  const { locale, dict } = useI18n()
  const pathname = usePathname()
  const router = useRouter()

  function switchTo(next: Locale) {
    if (next === locale) {
      return
    }

    rememberLocale(next)

    // Swap just the locale segment so the user stays on the page
    // they're reading, rather than being sent home.
    const rest = pathname.replace(new RegExp(`^/${locale}`), "")

    router.push(`/${next}${rest || ""}`)
    router.refresh()
  }

  return (
    <Popover>
      <PopoverTrigger
        render={
          <button
            type="button"
            aria-label={dict.nav.language}
            className="flex h-9 items-center gap-1.5 rounded-lg border border-white/10 px-2.5 text-sm text-white hover:bg-white/10"
          />
        }
      >
        <Languages className="h-4 w-4" />
        <span className="uppercase">{locale}</span>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-40 border border-white/10 bg-black p-1.5 text-white shadow-2xl"
      >
        {LOCALES.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => switchTo(option)}
            aria-current={option === locale}
            className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-sm hover:bg-white/10 ${
              option === locale ? "text-white" : "text-zinc-400"
            }`}
          >
            {LOCALE_LABELS[option]}
            {option === locale && (
              <span aria-hidden="true" className="text-xs">
                ✓
              </span>
            )}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  )
}
