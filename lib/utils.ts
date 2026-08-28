import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Turkish doesn't abbreviate the same way English does ("2h ago" has
// no natural short form), so the tr strings spell out the unit
// instead of mirroring English's single-letter suffixes.
const RELATIVE_TIME_STRINGS = {
  en: {
    justNow: "just now",
    minutes: (n: number) => `${n}m ago`,
    hours: (n: number) => `${n}h ago`,
    days: (n: number) => `${n}d ago`,
    months: (n: number) => `${n}mo ago`,
  },
  tr: {
    justNow: "az önce",
    minutes: (n: number) => `${n} dk önce`,
    hours: (n: number) => `${n} sa önce`,
    days: (n: number) => `${n} gün önce`,
    months: (n: number) => `${n} ay önce`,
  },
} as const

export function formatRelativeTime(
  dateInput: string | Date,
  locale: keyof typeof RELATIVE_TIME_STRINGS = "en"
): string {
  const date =
    typeof dateInput === "string"
      ? new Date(dateInput)
      : dateInput

  const diffSec = Math.floor(
    (Date.now() - date.getTime()) / 1000
  )

  const strings = RELATIVE_TIME_STRINGS[locale]

  if (diffSec < 60) return strings.justNow

  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return strings.minutes(diffMin)

  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return strings.hours(diffHour)

  const diffDay = Math.floor(diffHour / 24)
  if (diffDay < 30) return strings.days(diffDay)

  const diffMonth = Math.floor(diffDay / 30)
  return strings.months(diffMonth)
}

export function formatDuration(ms: number): string {
  const days = Math.floor(ms / (1000 * 60 * 60 * 24))
  const hours = Math.floor(
    (ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  )

  if (days > 0) {
    return hours > 0 ? `${days}d ${hours}h` : `${days}d`
  }

  if (hours > 0) {
    return `${hours}h`
  }

  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
  return `${Math.max(minutes, 1)}m`
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function formatCount(count: number): string {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`
  }

  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1).replace(/\.0$/, "")}K`
  }

  return `${count}`
}
