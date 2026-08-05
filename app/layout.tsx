import "./globals.css"
import type { Metadata } from "next"
import { Inter, Space_Grotesk } from "next/font/google"

import { SessionProvider } from "@/components/providers/session-provider"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-heading",
  display: "swap",
})

const SITE_URL = "https://modealert.vercel.app"

const DEFAULT_DESCRIPTION =
  "ModeAlert tracks limited-time game events, modes, and battle passes across League of Legends, Valorant, and Destiny 2 — and emails you the moment something changes. No client, no extension, free during early access."

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "ModeAlert — Never Miss a Limited-Time Game Event",
    template: "%s | ModeAlert",
  },
  description: DEFAULT_DESCRIPTION,
  keywords: [
    "game event tracker",
    "League of Legends event tracker",
    "Valorant event tracker",
    "Destiny 2 event tracker",
    "game mode notifications",
    "limited-time game mode alert",
  ],
  authors: [{ name: "Deniz Önen" }],
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "ModeAlert",
    title: "ModeAlert — Never Miss a Limited-Time Game Event",
    description: DEFAULT_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "ModeAlert — Never Miss a Limited-Time Game Event",
    description: DEFAULT_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="bg-black text-white antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
