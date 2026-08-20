"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SectionEyebrow } from "@/components/shared/section-eyebrow"
import { Bell, Clock3, Gamepad2, Shield, ArrowRight } from "lucide-react"
import { useI18n } from "@/components/providers/i18n-provider"
import type { Dictionary } from "@/lib/i18n/dictionaries"

function getFeatures(gameCount: number, dict: Dictionary) {
  return [
    {
      title: dict.features.alertsTitle,
      description: dict.features.alertsDescription,
      icon: Bell,
      gradient: "linear-gradient(135deg, #a855f7, #d946ef)",
    },
    {
      title: dict.features.dailyTitle,
      description: dict.features.dailyDescription,
      icon: Clock3,
      gradient: "linear-gradient(135deg, #3b82f6, #06b6d4)",
    },
    {
      title: dict.features.gamesTitle.replace("{count}", String(gameCount)),
      description: dict.features.gamesDescription,
      icon: Gamepad2,
      gradient: "linear-gradient(135deg, #ec4899, #f43f5e)",
    },
    {
      title: dict.features.privacyTitle,
      description: dict.features.privacyDescription,
      icon: Shield,
      gradient: "linear-gradient(135deg, #10b981, #14b8a6)",
    },
  ]
}

export function Features({ gameCount }: { gameCount: number }) {
  const { dict, path } = useI18n()
  const features = getFeatures(gameCount, dict)
  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-24">
      <div className="max-w-3xl">
        <SectionEyebrow>{dict.features.eyebrow}</SectionEyebrow>
        <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">
          {dict.features.title}
        </h2>
        <p className="mt-4 text-lg text-zinc-400">
          {dict.features.intro}
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {features.map((feature, index) => {
          const Icon = feature.icon

          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              whileHover={{ y: -4 }}
            >
              <Card className="group relative overflow-hidden border-white/10 bg-white/5 text-white transition-colors hover:border-white/20">
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
            </motion.div>
          )
        })}
      </div>

      <Link
        href={path("/features")}
        className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-400 hover:text-white"
      >
        {dict.features.seeAllFeatures}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  )
}
