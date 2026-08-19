import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Unsubscribe",
  robots: { index: false, follow: false },
}

export default function UnsubscribedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
