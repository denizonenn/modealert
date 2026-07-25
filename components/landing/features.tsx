import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, Clock3, Gamepad2, Shield } from "lucide-react"

const features = [
  {
    title: "Instant email alerts",
    description: "Receive a beautiful email the moment your selected mode goes live.",
    icon: Bell,
  },
  {
    title: "Hourly detection",
    description: "Our cron system checks for mode changes every hour automatically.",
    icon: Clock3,
  },
  {
    title: "Multiple games",
    description: "Track limited-time events across Riot titles and other popular games.",
    icon: Gamepad2,
  },
  {
    title: "Privacy first",
    description: "We only store the preferences needed to send the alerts you request.",
    icon: Shield,
  },
]

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-24">
      <div className="max-w-3xl">
        <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Features</p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">
          Built for players who hate missing limited-time content.
        </h2>
        <p className="mt-4 text-lg text-zinc-400">
          ModeAlert watches game rotations and event schedules so you dont have to. Set your preferences once and let the system do the rest.
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {features.map((feature) => {
          const Icon = feature.icon

          return (
            <Card key={feature.title} className="border-white/10 bg-white/5 text-white">
              <CardHeader>
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-black/40">
                  <Icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-zinc-400">{feature.description}</CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}