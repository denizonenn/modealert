import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Digest feedback",
  robots: { index: false, follow: false },
}

export default function DigestFeedbackLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
