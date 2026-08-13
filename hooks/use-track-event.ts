import { useCallback } from "react"

import type { AnalyticsEventName } from "@/lib/constants/analytics-events"

// Fire-and-forget — a failed/slow analytics call should never block
// or visibly affect the real action the user is taking. `keepalive`
// lets the request survive a navigation that happens right after
// (e.g. tracking "onboarding finished" the moment before redirecting
// to /dashboard).
export function useTrackEvent() {
  return useCallback(
    (name: AnalyticsEventName, detail?: string) => {
      fetch("/api/analytics/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, detail }),
        keepalive: true,
      }).catch(() => {})
    },
    []
  )
}
