import type { MetadataRoute } from "next"

import { SITE_URL } from "@/lib/constants/site"
import { gameService } from "@/lib/services/game.service"
import { eventQueryService } from "@/lib/services/event-query.service"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const [games, events] = await Promise.all([
    gameService.getAllGames(),
    eventQueryService.getAll(),
  ])

  return [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/features`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/games`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...games.map((game) => ({
      url: `${SITE_URL}/games/${game.slug}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.6,
    })),
    ...events
      .filter((event) => event.slug)
      .map((event) => ({
        url: `${SITE_URL}/events/${event.slug}`,
        lastModified: now,
        changeFrequency: "daily" as const,
        priority: 0.4,
      })),
    {
      url: `${SITE_URL}/live`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/status`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/statistics`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ]
}
