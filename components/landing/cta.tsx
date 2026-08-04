"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Zap } from "lucide-react"

import { Button } from "@/components/ui/button"

export function Cta() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent px-8 py-16 text-center"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_100%,rgba(168,85,247,0.2),transparent_60%)]" />

        <div className="relative">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-brand">
            <Zap className="h-5 w-5 text-white" />
          </div>

          <h2 className="mx-auto mt-6 max-w-2xl text-4xl font-bold tracking-tight md:text-5xl">
            Stop refreshing. Start tracking.
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-lg text-zinc-400">
            Free during early access. Set up your first alert in under a minute.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/onboarding">
              <Button size="lg" className="h-12 rounded-full bg-gradient-brand px-8 text-white shadow-[0_0_30px_rgba(168,85,247,0.35)] transition-shadow hover:shadow-[0_0_40px_rgba(168,85,247,0.5)]">
                Start Tracking
              </Button>
            </Link>

            <Link href="/dashboard">
              <Button
                size="lg"
                variant="outline"
                className="h-12 rounded-full border-white/15 bg-white/5 px-8 text-white hover:bg-white/10"
              >
                View the dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
