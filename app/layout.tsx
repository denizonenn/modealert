import "./globals.css"
import type { Metadata } from "next"
import { Inter, Space_Grotesk } from "next/font/google"

import { SessionProvider } from "@/components/providers/session-provider"
import { SITE_URL } from "@/lib/constants/site"
import { GAMES_WITH_PROVIDER } from "@/lib/constants/games"

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

const DEFAULT_DESCRIPTION = `ModeAlert tracks limited-time game events, modes, and battle passes across ${GAMES_WITH_PROVIDER.size} games — League of Legends, Valorant, Destiny 2, TFT, and more — and emails you the moment something changes. No client, no extension, free to start.`

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
    "TFT event tracker",
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
  alternates: {
    types: {
      "application/rss+xml": `${SITE_URL}/feed.xml`,
    },
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
