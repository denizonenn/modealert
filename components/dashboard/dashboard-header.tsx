"use client"

import { motion } from "framer-motion"
import { CalendarClock, Eye, Radio } from "lucide-react"

import StatCard from "./stat-card"

interface Props {
  watched: number
  live: number
  nextEvent: string
}

export default function DashboardHeader({
  watched,
  live,
  nextEvent,
}: Props) {
  const hour = new Date().getHours()

  const greeting =
    hour < 12
      ? "Good Morning"
      : hour < 18
      ? "Good Afternoon"
      : "Good Evening"

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
          Your Dashboard
        </h1>

        <p className="mt-3 max-w-xl text-zinc-400">
          Track every game event you&apos;re following in one place.
        </p>
      </motion.div>

      <div className="mt-8 flex flex-wrap gap-4">
        <StatCard
          icon={Eye}
          label="Watching"
          value={watched}
          index={0}
        />

        <StatCard
          icon={Radio}
          label="Live Now"
          value={live}
          accent="text-emerald-400"
          index={1}
        />

        <StatCard
          icon={CalendarClock}
          label="Next Event"
          value={nextEvent}
          accent="text-blue-400"
          index={2}
        />
      </div>
    </section>
  )
}
