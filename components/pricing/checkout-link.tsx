"use client"

import { useTrackEvent } from "@/hooks/use-track-event"
import { ANALYTICS_EVENTS } from "@/lib/constants/analytics-events"

// Thin client wrapper — the checkout URL itself is computed
// server-side (needs the real session), this just adds the one bit of
// client interactivity (a click tracker) that a server component
// can't do on its own.
export function CheckoutLink({
  href,
  source,
  children,
}: {
  href: string
  source: string
  children: React.ReactNode
}) {
  const track = useTrackEvent()

  return (
    <a
      href={href}
      onClick={() => track(ANALYTICS_EVENTS.CHECKOUT_CLICKED, source)}
    >
      {children}
    </a>
  )
}
