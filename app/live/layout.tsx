import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Live Status",
  description:
    "See the live status of every tracked mode across League of Legends, Valorant, Destiny 2, and Teamfight Tactics — plus a League of Legends live-vs-PBE comparison for early signal on new content.",
}

export default function LiveLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
