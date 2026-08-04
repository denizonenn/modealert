"use client"

import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"

interface Props {
  icon: LucideIcon
  label: string
  value: string | number
  accent?: string
  index?: number
}

export default function StatCard({
  icon: Icon,
  label,
  value,
  accent = "text-white",
  index = 0,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="flex min-w-[180px] flex-1 items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/40">
        <Icon className={`h-5 w-5 ${accent}`} />
      </div>

      <div className="min-w-0">
        <p className="text-sm text-zinc-500">{label}</p>
        <p className={`mt-1 truncate text-2xl font-bold ${accent}`}>
          {value}
        </p>
      </div>
    </motion.div>
  )
}
