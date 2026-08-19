import type { Metadata } from "next"

import { GAMES_WITH_PROVIDER } from "@/lib/constants/games"

export const metadata: Metadata = {
  title: "Live Status",
  description: `See the live status of every tracked mode across all ${GAMES_WITH_PROVIDER.size} supported games — plus a League of Legends live-vs-PBE comparison for early signal on new content.`,
}

export default function LiveLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
