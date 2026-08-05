import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "System Status",
  description:
    "Live health, latency, and event counts for every data source ModeAlert syncs from — Riot Games, CommunityDragon, and Valorant.",
}

export default function StatusLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
