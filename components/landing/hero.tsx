import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Bell, Zap } from "lucide-react"

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_40%)]" />

      <div className="mx-auto flex max-w-7xl flex-col items-center px-6 py-24 text-center md:py-32">
        <Badge className="mb-6 border border-white/10 bg-white/10 text-white hover:bg-white/15">
          <Zap className="mr-2 h-3 w-3" /> Hourly mode detection
        </Badge>

        <h1 className="max-w-4xl text-5xl font-bold tracking-tight md:text-7xl">
          Never miss your favorite game modes again.
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-zinc-400 md:text-xl">
          Get instant alerts when URF, Arena, Night Market, Fortnite OG and other limited-time events go live.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Button size="lg" className="h-12 bg-white px-8 text-black hover:bg-zinc-200">
            <Bell className="mr-2 h-4 w-4" />
            Start tracking
          </Button>

          <Button size="lg" variant="outline" className="h-12 border-white/15 bg-white/5 px-8 text-white hover:bg-white/10">
            View supported games
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="mt-16 w-full max-w-5xl rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/40">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/40 p-5 text-left">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-400">League of Legends</p>
                  <h3 className="mt-1 text-xl font-semibold">URF</h3>
                </div>
                <Badge className="bg-emerald-500 text-black hover:bg-emerald-400">LIVE</Badge>
              </div>
              <p className="mt-3 text-sm text-zinc-400">Ultra Rapid Fire is now available in the current rotation.</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/40 p-5 text-left">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-400">Valorant</p>
                  <h3 className="mt-1 text-xl font-semibold">Night Market</h3>
                </div>
                <Badge variant="outline" className="border-white/15 text-white">TRACKING</Badge>
              </div>
              <p className="mt-3 text-sm text-zinc-400">We will notify you the moment the next Night Market appears.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}