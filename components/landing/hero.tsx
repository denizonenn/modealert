import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Zap } from "lucide-react";
import { DashboardPreview } from "./dashboard-preview"
import Link from "next/link"
import { ModeRotator } from "./mode-rotator"

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(168,85,247,0.18),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_35%_at_80%_10%,rgba(59,130,246,0.14),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_35%_at_15%_15%,rgba(236,72,153,0.12),transparent_60%)]" />

      <div className="relative mx-auto flex max-w-7xl flex-col items-center px-6 py-24 text-center md:py-32">
        <Badge className="mb-6 border border-white/10 bg-white/10 text-white hover:bg-white/15">
          <Zap className="mr-2 h-3 w-3" /> Daily mode detection
        </Badge>
        <ModeRotator />

        <h1 className="max-w-4xl text-5xl font-bold tracking-tight md:text-7xl">
          Never miss your{" "}
          <span className="text-gradient-brand">
            favorite game modes
          </span>{" "}
          again.
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-zinc-400 md:text-xl">
          Get instant alerts when URF, Arena, Night Market, Iron Banner and other limited-time events go live.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link href="/onboarding">
            <Button className="h-12 rounded-full bg-gradient-brand px-8 text-white shadow-[0_0_30px_rgba(168,85,247,0.35)] transition-shadow hover:shadow-[0_0_40px_rgba(168,85,247,0.5)]">
              Start Tracking
            </Button>
          </Link>

          <Button size="lg" variant="outline" className="h-12 rounded-full border-white/15 bg-white/5 px-8 text-white hover:bg-white/10">
            View supported games
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <DashboardPreview />
      </div>
    </section>
  )
}