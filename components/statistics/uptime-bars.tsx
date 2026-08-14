"use client"

import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react"

export interface UptimeBarItem {
  providerId: string
  providerName: string
  uptimePercent: number
  sampleSize: number
}

// Fixed status scale (never themed) — uptime is a genuine health
// state, not "series N", so it wears status tokens per the dataviz
// method. Steps from docs' reference palette, validated ≥3:1 on a
// dark surface.
const STATUS = {
  good: { fill: "#0ca30c", Icon: CheckCircle2, label: "Healthy" },
  warning: { fill: "#fab219", Icon: AlertTriangle, label: "Degraded" },
  critical: { fill: "#d03b3b", Icon: XCircle, label: "Unhealthy" },
} as const

function statusFor(uptimePercent: number): keyof typeof STATUS {
  if (uptimePercent >= 99) return "good"
  if (uptimePercent >= 90) return "warning"
  return "critical"
}

export function UptimeBars({ providers }: { providers: UptimeBarItem[] }) {
  return (
    <div className="mt-4 space-y-2">
      {providers.map((provider) => {
        const status = STATUS[statusFor(provider.uptimePercent)]
        const Icon = status.Icon

        return (
          <div
            key={provider.providerId}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Icon
                  className="h-3.5 w-3.5 shrink-0"
                  style={{ color: status.fill }}
                  aria-hidden
                />
                <span className="text-zinc-300">{provider.providerName}</span>
                <span className="text-xs text-zinc-600">{status.label}</span>
              </div>

              <span className="shrink-0 text-xs text-zinc-500">
                {provider.uptimePercent}% · {provider.sampleSize} check
                {provider.sampleSize === 1 ? "" : "s"}
              </span>
            </div>

            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.max(2, provider.uptimePercent)}%`,
                  backgroundColor: status.fill,
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default UptimeBars
