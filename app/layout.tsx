import "./globals.css"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "ModeAlert",
  description: "Track limited-time events across every game."
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white antialiased">
        {children}
      </body>
    </html>
  )
}