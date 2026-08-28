import type { MetadataRoute } from "next"

import { SITE_URL } from "@/lib/constants/site"
import { gameService } from "@/lib/services/game.service"
import { eventQueryService } from "@/lib/services/event-query.service"
import { LOCALES } from "@/lib/i18n/config"

type ChangeFrequency = NonNullable<
  MetadataRoute.Sitemap[number]["changeFrequency"]
>

interface PageSpec {
  path: string
  changeFrequency: ChangeFrequency
  priority: number
}

// Every real page gets one <url> entry per locale (not one canonical
// URL) — each carries an alternates.languages block listing every
// locale's URL for that page, including itself, so search engines
// index /en/... and /tr/... as the same page in two languages rather
// than two unrelated pages. See docs/06_DECISIONS.md ADR-054 "Faz 4".
function localizedEntries(
  pages: PageSpec[],
  lastModified: Date
): MetadataRoute.Sitemap {
  return pages.flatMap((page) =>
    LOCALES.map((locale) => ({
      url: `${SITE_URL}/${locale}${page.path}`,
      lastModified,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
      alternates: {
        languages: Object.fromEntries(
          LOCALES.map((l) => [l, `${SITE_URL}/${l}${page.path}`])
        ),
      },
    }))
  )
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const [games, events] = await Promise.all([
    gameService.getAllGames(),
    eventQueryService.getAll(),
  ])

  const staticPages: PageSpec[] = [
    { path: "", changeFrequency: "daily", priority: 1 },
    { path: "/features", changeFrequency: "monthly", priority: 0.8 },
    { path: "/games", changeFrequency: "weekly", priority: 0.8 },
    { path: "/pricing", changeFrequency: "monthly", priority: 0.7 },
    { path: "/live", changeFrequency: "hourly", priority: 0.6 },
    { path: "/calendar", changeFrequency: "daily", priority: 0.6 },
    { path: "/status", changeFrequency: "hourly", priority: 0.3 },
    { path: "/statistics", changeFrequency: "daily", priority: 0.3 },
    { path: "/privacy", changeFrequency: "yearly", priority: 0.2 },
    { path: "/terms", changeFrequency: "yearly", priority: 0.2 },
  ]

  const gamePages: PageSpec[] = games.map((game) => ({
    path: `/games/${game.slug}`,
    changeFrequency: "daily",
    priority: 0.6,
  }))

  const eventPages: PageSpec[] = events
    .filter((event) => event.slug)
    .map((event) => ({
      path: `/events/${event.slug}`,
      changeFrequency: "daily",
      priority: 0.4,
    }))

  return localizedEntries(
    [...staticPages, ...gamePages, ...eventPages],
    now
  )
}
