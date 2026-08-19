import "../globals.css"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Inter, Space_Grotesk } from "next/font/google"

import { SessionProvider } from "@/components/providers/session-provider"
import { I18nProvider } from "@/components/providers/i18n-provider"
import { SITE_URL } from "@/lib/constants/site"
import { GAMES_WITH_PROVIDER } from "@/lib/constants/games"
import { LOCALES, isLocale } from "@/lib/i18n/config"
import { getDictionaryFor } from "@/lib/i18n/dictionaries"

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

const DEFAULT_DESCRIPTION = `ModeAlert tracks limited-time game events, modes, and battle passes across ${GAMES_WITH_PROVIDER.size} games — League of Legends, Valorant, Destiny 2, TFT, and more — and alerts you by email or Discord the moment something changes. No client, no extension, free to start.`

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

// Every locale is a real, prerenderable route — not resolved at
// request time.
export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params

  // proxy.ts only ever routes real locales here, so anything else is
  // a hand-typed URL like /de/pricing — a genuine 404, not a reason to
  // silently serve English at a URL that claims to be German.
  if (!isLocale(lang)) {
    notFound()
  }

  const dict = await getDictionaryFor(lang)

  return (
    <html lang={lang} className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="bg-black text-white antialiased">
        <I18nProvider locale={lang} dict={dict}>
          <SessionProvider>{children}</SessionProvider>
        </I18nProvider>
      </body>
    </html>
  )
}
