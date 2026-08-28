import type { Metadata } from "next"

import { GAMES_WITH_PROVIDER } from "@/lib/constants/games"
import { getLocale } from "@/lib/i18n/dictionaries"
import { localeAlternates } from "@/lib/i18n/alternates"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()

  return {
    title: "Live Status",
    description: `See the live status of every tracked mode across all ${GAMES_WITH_PROVIDER.size} supported games — plus a League of Legends live-vs-PBE comparison for early signal on new content.`,
    alternates: localeAlternates(locale, "/live"),
  }
}

export default function LiveLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
