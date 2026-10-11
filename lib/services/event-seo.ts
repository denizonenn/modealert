// Search-intent copy for event pages (docs/06_DECISIONS.md ADR-068).
// People search for limited-time modes as questions — "is URF live",
// "when is URF coming back" — so for those events the page title,
// meta description and a visible answer line are phrased as the
// answer to that question, built from real tracked history (never a
// guessed return date). Pure: no DB/Next imports, so it's unit-tested
// directly (event-seo.test.ts).

export type SeoLocale = "en" | "tr"

export interface SeoTemplates {
  seoTitle: string
  seoDescLive: string
  seoDescNotLive: string
  seoDescNoHistory: string
  seoAvgFragment: string
  seoSinceFragment: string
  answerLive: string
  answerNotLive: string
  answerNoHistory: string
}

interface SeoEventInput {
  title: string
  gameName: string
  status: string
  category: string
  isLimitedTime: boolean
}

interface HistorySpan {
  startedAt: Date
  endedAt: Date | null
}

// Only limited-time playable modes get question-style copy — those
// are what people actually search "is X live" for. Season passes,
// platform status and permanent queues keep the generic copy.
export function isSearchIntentEvent(event: {
  category: string
  isLimitedTime: boolean
}): boolean {
  return event.category === "PLAYABLE" && event.isLimitedTime
}

const DURATION_WORDS = {
  en: { day: ["day", "days"], hour: ["hour", "hours"] },
  tr: { day: ["gün", "gün"], hour: ["saat", "saat"] },
} as const

// Human wording ("6 days", "3 hours") rather than the compact "6d 1h"
// the UI uses — this text is read in search results.
export function humanDuration(ms: number, locale: SeoLocale): string {
  const words = DURATION_WORDS[locale]
  const days = Math.round(ms / (1000 * 60 * 60 * 24))

  if (days >= 1) {
    return `${days} ${words.day[days === 1 ? 0 : 1]}`
  }

  const hours = Math.max(1, Math.round(ms / (1000 * 60 * 60)))
  return `${hours} ${words.hour[hours === 1 ? 0 : 1]}`
}

function formatDate(date: Date, locale: SeoLocale): string {
  return date.toLocaleDateString(locale === "tr" ? "tr-TR" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  })
}

function fill(template: string, values: Record<string, string>): string {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, value),
    template
  )
}

export function buildEventSeo(
  event: SeoEventInput,
  history: HistorySpan[],
  templates: SeoTemplates,
  locale: SeoLocale
): { title: string; description: string; answer: string } {
  const base = { title: event.title, game: event.gameName }
  const title = fill(templates.seoTitle, base)

  const completed = history.filter((span) => span.endedAt)
  const avgMs =
    completed.length === 0
      ? 0
      : completed.reduce(
          (sum, span) =>
            sum + (span.endedAt!.getTime() - span.startedAt.getTime()),
          0
        ) / completed.length

  if (event.status === "LIVE") {
    const current = history.at(-1)
    const since =
      current && !current.endedAt
        ? fill(templates.seoSinceFragment, {
            since: formatDate(current.startedAt, locale),
          })
        : ""
    const avg =
      avgMs > 0
        ? fill(templates.seoAvgFragment, {
            duration: humanDuration(avgMs, locale),
          })
        : ""

    return {
      title,
      description: fill(templates.seoDescLive, { ...base, since, avg }),
      answer: fill(templates.answerLive, { ...base, since }),
    }
  }

  const last = completed.at(-1)

  if (!last) {
    return {
      title,
      description: fill(templates.seoDescNoHistory, base),
      answer: fill(templates.answerNoHistory, base),
    }
  }

  const span = {
    start: formatDate(last.startedAt, locale),
    end: formatDate(last.endedAt!, locale),
    duration: humanDuration(
      last.endedAt!.getTime() - last.startedAt.getTime(),
      locale
    ),
  }

  return {
    title,
    description: fill(templates.seoDescNotLive, { ...base, ...span }),
    answer: fill(templates.answerNotLive, { ...base, ...span }),
  }
}
