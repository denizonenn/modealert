"use client"

import { motion } from "framer-motion"
import { SectionEyebrow } from "@/components/shared/section-eyebrow"
import { Bell, Gamepad2, ListChecks } from "lucide-react"

const STEPS = [
  {
    icon: Gamepad2,
    title: "Pick your games",
    description:
      "Select League of Legends, Valorant, Destiny 2 and more. Add new games any time.",
  },
  {
    icon: ListChecks,
    title: "Choose what to track",
    description:
      "URF, Arena, Night Market, seasonal passes — watch exactly the modes and events you care about.",
  },
  {
    icon: Bell,
    title: "Get notified instantly",
    description:
      "We check once a day. The moment something changes, you get an email — no manual checking, ever.",
  },
]

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="text-center">
        <SectionEyebrow className="justify-center">
          How It Works
        </SectionEyebrow>

        <h2 className="mt-4 text-4xl font-bold tracking-tight">
          Three steps. Zero maintenance.
        </h2>
      </div>

      <div className="relative mt-16 grid gap-10 md:grid-cols-3">
        <div className="absolute top-8 left-0 right-0 hidden h-px bg-gradient-brand opacity-20 md:block" />

        {STEPS.map((step, index) => {
          const Icon = step.icon

          return (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative flex flex-col items-center text-center"
            >
              <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-brand text-white shadow-[0_0_25px_rgba(168,85,247,0.35)]">
                <Icon className="h-6 w-6" />
              </div>

              <span className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
                Step {index + 1}
              </span>

              <h3 className="mt-2 text-xl font-semibold">
                {step.title}
              </h3>

              <p className="mt-3 max-w-xs text-zinc-400">
                {step.description}
              </p>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
