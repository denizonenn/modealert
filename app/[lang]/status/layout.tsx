import type { Metadata } from "next"

import { getLocale } from "@/lib/i18n/dictionaries"
import { localeAlternates } from "@/lib/i18n/alternates"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()

  return {
    title: "System Status",
    description:
      "Live health, latency, and event counts for every data source ModeAlert syncs from — Riot Games, CommunityDragon, and Valorant.",
    alternates: localeAlternates(locale, "/status"),
  }
}

export default function StatusLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
