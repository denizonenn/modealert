"use client"

import { motion } from "framer-motion"
import { CalendarClock, Eye, Radio } from "lucide-react"

import StatCard from "./stat-card"
import { useI18n } from "@/components/providers/i18n-provider"

interface Props {
  watched: number
  live: number
  nextEvent: string | null
}

export default function DashboardHeader({
  watched,
  live,
  nextEvent,
}: Props) {
  const { dict } = useI18n()
  const hour = new Date().getHours()

  const greeting =
    hour < 12
      ? dict.dashboardPage.greetingMorning
      : hour < 18
      ? dict.dashboardPage.greetingAfternoon
      : dict.dashboardPage.greetingEvening

  return (
    <section className="mb-12">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
          {greeting}
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
          {dict.dashboardPage.title}
        </h1>

        <p className="mt-3 max-w-xl text-zinc-400">
          {dict.dashboardPage.subtitle}
        </p>
      </motion.div>

      <div className="mt-8 flex flex-wrap gap-4">
        <StatCard
          icon={Eye}
          label={dict.dashboardPage.statWatching}
          value={watched}
          index={0}
        />

        <StatCard
          icon={Radio}
          label={dict.dashboardPage.statLiveNow}
          value={live}
          accent="text-emerald-400"
          iconBg="bg-emerald-500/20"
          index={1}
        />

        <StatCard
          icon={CalendarClock}
          label={dict.dashboardPage.statNextEvent}
          value={nextEvent ?? dict.dashboardPage.noneYet}
          accent="text-blue-400"
          iconBg="bg-blue-500/20"
          index={2}
        />
      </div>
    </section>
  )
}
