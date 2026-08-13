import Link from "next/link"
import { Lock } from "lucide-react"

// Wraps a stat/prediction block that's gated behind Premium — renders
// the real (blurred) shape so the layout doesn't jump, with an upsell
// overlay on top. See docs/06_DECISIONS.md ADR-041.
export function PremiumTeaser({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none select-none blur-[3px] opacity-40"
      >
        {children}
      </div>

      <Link
        href="/pricing"
        className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-lg bg-black/50 text-center transition-colors hover:bg-black/60"
      >
        <Lock className="h-3.5 w-3.5 text-zinc-300" />
        <span className="text-[11px] font-medium text-white">
          Premium
        </span>
      </Link>
    </div>
  )
}
