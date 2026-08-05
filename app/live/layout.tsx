import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Live Patch Comparison",
  description:
    "Compare League of Legends' live patch against the PBE (Public Beta Environment) in real time — see new modes, events, and content before they officially launch.",
}

export default function LiveLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
