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

export const metadata: Metadata = {
  title: "Features",
  description:
    "See how ModeAlert detects game events across League of Legends, Valorant, Destiny 2, and 8 other games before they're officially announced, and emails you the moment something changes.",
}

function getCoreFeatures(gameCount: number) {
  return [
  {
    title: "Early detection via PBE",
    description:
      "For League of Legends, we compare the live patch against Riot's Public Beta Environment — new modes and events often show up there days or weeks before they officially launch.",
    icon: Radar,
    gradient: "linear-gradient(135deg, #a855f7, #d946ef)",
  },
  {
    title: "Instant email alerts",
    description:
      "Receive a clean, readable email the moment your selected mode or event goes live, ends, or changes status. No dashboard-refreshing required.",
    icon: Mail,
    gradient: "linear-gradient(135deg, #3b82f6, #06b6d4)",
  },
  {
    title: `${gameCount} games, one inbox`,
    description: `League of Legends, Valorant, Destiny 2, TFT, Fortnite, Warframe, Path of Exile, Helldivers 2, Foxhole, PUBG, PlanetSide 2 — one watchlist instead of a different tracker, Discord bot, or community site per game.`,
    icon: Gamepad2,
    gradient: "linear-gradient(135deg, #ec4899, #f43f5e)",
  },
  {
    title: "Runs daily, automatically",
    description:
      "A scheduled sync checks every source once a day and diffs it against what it saw last time — new, changed, and ended events are detected without you doing anything.",
    icon: Clock3,
    gradient: "linear-gradient(135deg, #f59e0b, #f97316)",
  },
  {
    title: "Watch only what matters",
    description:
      "Pick specific modes and events per game instead of getting notified about everything — URF, Arena, Night Market, battle passes, whatever you actually care about.",
    icon: Bell,
    gradient: "linear-gradient(135deg, #22c55e, #10b981)",
  },
  {
    title: "Privacy first",
    description:
      "We only store what's needed to send the alerts you asked for — your watchlist and your email. No tracking pixels, no data resale.",
    icon: Shield,
    gradient: "linear-gradient(135deg, #10b981, #14b8a6)",
  },
  ]
}

export default function FeaturesPage() {
  const CORE_FEATURES = getCoreFeatures(GAMES_WITH_PROVIDER.size)

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <section className="mx-auto max-w-4xl px-6 pt-20 pb-4 text-center">
        <SectionEyebrow className="justify-center">Features</SectionEyebrow>

        <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
          Everything ModeAlert does, in one place.
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-lg text-zinc-400">
          ModeAlert exists to answer one question automatically:{" "}
          <span className="text-white">
            &ldquo;did the game mode I care about just go live?&rdquo;
          </span>{" "}
          Here&apos;s exactly how it does that.
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
            Why it exists
          </SectionEyebrow>

          <h2 className="mt-4 text-center text-3xl font-bold tracking-tight md:text-4xl">
            Manually checking is the actual problem.
          </h2>

          <div className="mt-10 space-y-6 text-lg leading-relaxed text-zinc-400">
            <p>
              Limited-time modes disappear the same way they appear — with
              little warning. By the time a mode trends on social media, it
              might already be halfway through its run. Refreshing a patch
              notes page or a Twitter feed every day doesn&apos;t scale, and
              most players just miss things instead.
            </p>
            <p>
              ModeAlert flips that: instead of you checking on the game, the
              game gets checked on your behalf, once a day, across every
              title you&apos;ve set up. You only hear from us when something
              on your watchlist actually changes.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-brand">
          <Zap className="h-5 w-5 text-white" />
        </div>

        <h2 className="mx-auto mt-6 max-w-2xl text-3xl font-bold tracking-tight md:text-4xl">
          Ready to stop checking manually?
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-zinc-400">
          Free to start. Set up your first alert in under a minute.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/onboarding">
            <Button
              size="lg"
              className="h-12 rounded-full bg-gradient-brand px-8 text-white shadow-[0_0_30px_rgba(168,85,247,0.35)] transition-shadow hover:shadow-[0_0_40px_rgba(168,85,247,0.5)]"
            >
              Start Tracking
            </Button>
          </Link>

          <Link href="/games">
            <Button
              size="lg"
              variant="outline"
              className="h-12 rounded-full border-white/15 bg-white/5 px-8 text-white hover:bg-white/10"
            >
              See supported games
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  )
}
