import type { Metadata } from "next"
import Link from "next/link"
import {
  Bell,
  Clock3,
  Gamepad2,
  Shield,
  Mail,
  Radar,
  Zap,
  ArrowRight,
} from "lucide-react"

import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SectionEyebrow } from "@/components/shared/section-eyebrow"
import { GAMES_WITH_PROVIDER } from "@/lib/constants/games"
import { getDictionary, getLocale, type Dictionary } from "@/lib/i18n/dictionaries"
import { localeAlternates } from "@/lib/i18n/alternates"

export async function generateMetadata(): Promise<Metadata> {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()])

  return {
    title: dict.featuresPage.eyebrow,
    description: `See how ModeAlert detects game events across League of Legends, Valorant, Destiny 2, and ${
      GAMES_WITH_PROVIDER.size - 3
    } other games before they're officially announced, and alerts you the moment something changes.`,
    alternates: localeAlternates(locale, "/features"),
  }
}

function getCoreFeatures(gameCount: number, dict: Dictionary) {
  return [
  {
    title: dict.featuresPage.pbeTitle,
    description: dict.featuresPage.pbeDescription,
    icon: Radar,
    gradient: "linear-gradient(135deg, #a855f7, #d946ef)",
  },
  {
    title: dict.featuresPage.alertsTitle,
    description: dict.featuresPage.alertsDescription,
    icon: Mail,
    gradient: "linear-gradient(135deg, #3b82f6, #06b6d4)",
  },
  {
    title: dict.featuresPage.gamesTitle.replace("{count}", String(gameCount)),
    description: dict.featuresPage.gamesDescription,
    icon: Gamepad2,
    gradient: "linear-gradient(135deg, #ec4899, #f43f5e)",
  },
  {
    title: dict.featuresPage.dailyTitle,
    description: dict.featuresPage.dailyDescription,
    icon: Clock3,
    gradient: "linear-gradient(135deg, #f59e0b, #f97316)",
  },
  {
    title: dict.featuresPage.watchTitle,
    description: dict.featuresPage.watchDescription,
    icon: Bell,
    gradient: "linear-gradient(135deg, #22c55e, #10b981)",
  },
  {
    title: dict.featuresPage.privacyTitle,
    description: dict.featuresPage.privacyDescription,
    icon: Shield,
    gradient: "linear-gradient(135deg, #10b981, #14b8a6)",
  },
  ]
}

export default async function FeaturesPage() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()])
  const CORE_FEATURES = getCoreFeatures(GAMES_WITH_PROVIDER.size, dict)

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <section className="mx-auto max-w-4xl px-6 pt-20 pb-4 text-center">
        <SectionEyebrow className="justify-center">{dict.featuresPage.eyebrow}</SectionEyebrow>

        <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
          {dict.featuresPage.title}
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-lg text-zinc-400">
          {dict.featuresPage.introPre}{" "}
          <span className="text-white">
            {dict.featuresPage.introQuote}
          </span>{" "}
          {dict.featuresPage.introPost}
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {CORE_FEATURES.map((feature) => {
            const Icon = feature.icon

            return (
              <Card
                key={feature.title}
                className="group relative overflow-hidden border-white/10 bg-white/5 text-white transition-colors hover:border-white/20"
              >
                <div
                  className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-0 blur-3xl transition-opacity duration-300 group-hover:opacity-20"
                  style={{ backgroundImage: feature.gradient }}
                />

                <CardHeader className="relative">
                  <div
                    className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl text-white"
                    style={{ backgroundImage: feature.gradient }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="relative text-sm text-zinc-400">
                  {feature.description}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      <section className="border-t border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-4xl px-6 py-20">
          <SectionEyebrow className="justify-center">
            {dict.featuresPage.whyEyebrow}
          </SectionEyebrow>

          <h2 className="mt-4 text-center text-3xl font-bold tracking-tight md:text-4xl">
            {dict.featuresPage.whyTitle}
          </h2>

          <div className="mt-10 space-y-6 text-lg leading-relaxed text-zinc-400">
            <p>
              {dict.featuresPage.whyPara1}
            </p>
            <p>
              {dict.featuresPage.whyPara2}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-brand">
          <Zap className="h-5 w-5 text-white" />
        </div>

        <h2 className="mx-auto mt-6 max-w-2xl text-3xl font-bold tracking-tight md:text-4xl">
          {dict.featuresPage.ctaTitle}
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-zinc-400">
          {dict.featuresPage.ctaIntro}
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href={`/${locale}/onboarding`}>
            <Button
              size="lg"
              className="h-12 rounded-full bg-gradient-brand px-8 text-white shadow-[0_0_30px_rgba(168,85,247,0.35)] transition-shadow hover:shadow-[0_0_40px_rgba(168,85,247,0.5)]"
            >
              {dict.featuresPage.startTracking}
            </Button>
          </Link>

          <Link href={`/${locale}/games`}>
            <Button
              size="lg"
              variant="outline"
              className="h-12 rounded-full border-white/15 bg-white/5 px-8 text-white hover:bg-white/10"
            >
              {dict.featuresPage.seeSupportedGames}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  )
}
