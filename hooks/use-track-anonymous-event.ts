import { useCallback } from "react"

import type { AnonymousFunnelEventName } from "@/lib/constants/anonymous-funnel-events"

// Mirrors useTrackEvent, but hits the separate anonymous-only
// endpoint — no session, no identifier, fire-and-forget.
export function useTrackAnonymousEvent() {
  return useCallback((name: AnonymousFunnelEventName) => {
    fetch("/api/analytics/anonymous-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
      keepalive: true,
    }).catch(() => {})
  }, [])
}
