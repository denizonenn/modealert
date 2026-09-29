import { env } from "@/lib/config/env"

// Scaffolding only (docs/06_DECISIONS.md ADR-067) — no ad network is
// wired in. Renders nothing until ADS_ENABLED is turned on, and even
// then only a labeled placeholder box, not a real ad: dropping in an
// actual network's embed script is a separate step (see the comment
// below). Not placed on any page yet — where ads belong is a design
// decision, not an infrastructure one; add <AdSlot /> to a layout once
// that's decided.
const SIZES = {
  // IAB standard sizes, in pixels (width × height).
  leaderboard: { width: 728, height: 90 },
  rectangle: { width: 300, height: 250 },
  mobileBanner: { width: 320, height: 50 },
} as const

export type AdSlotSize = keyof typeof SIZES

export function AdSlot({
  slot,
  size,
  className,
}: {
  // Identifies this placement (e.g. "event-detail-top") — becomes
  // meaningful once a real network's tag reads it to pick which ad
  // unit to serve here.
  slot: string
  size: AdSlotSize
  className?: string
}) {
  if (!env.ADS_ENABLED) {
    return null
  }

  const { width, height } = SIZES[size]

  // TODO(ads): once a network is chosen (e.g. Google AdSense), this
  // placeholder is where its embed snippet/tag goes — likely reading
  // `slot` as the ad unit id. That also needs: the network's script
  // domain added to next.config.ts's CSP (script-src/frame-src/
  // connect-src, same pattern as Paddle in ADR-066), a consent/GDPR
  // banner if targeting the EU, and a privacy-policy update disclosing
  // the new third party.
  return (
    <div
      data-ad-slot={slot}
      style={{ width, height, maxWidth: "100%" }}
      className={`mx-auto flex items-center justify-center rounded-lg border border-white/10 bg-white/5 text-xs text-zinc-500 ${className ?? ""}`}
    >
      Ad
    </div>
  )
}
