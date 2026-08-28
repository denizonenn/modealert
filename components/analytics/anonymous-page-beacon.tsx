"use client"

import { useEffect } from "react"

import { useTrackAnonymousEvent } from "@/hooks/use-track-anonymous-event"
import type { AnonymousFunnelEventName } from "@/lib/constants/anonymous-funnel-events"

// Mounted once on a page that needs an anonymous, no-identifier view
// count (see docs/06_DECISIONS.md ADR-056) — renders nothing, just
// fires the beacon on mount. The page itself can be ISR-cached (the
// homepage is), so this has to run in the browser on every real load
// rather than server-side at render/revalidate time.
export function AnonymousPageBeacon({
  event,
}: {
  event: AnonymousFunnelEventName
}) {
  const track = useTrackAnonymousEvent()

  useEffect(() => {
    track(event)
    // Deliberately fire-once-per-mount: `track` is stable (useCallback
    // with no deps) and `event` shouldn't change under this component.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
