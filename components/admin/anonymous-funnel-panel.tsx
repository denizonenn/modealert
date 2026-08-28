import { anonymousFunnelService } from "@/lib/services/anonymous-funnel.service"
import {
  ANONYMOUS_FUNNEL_EVENT_LABELS,
  ANONYMOUS_FUNNEL_EVENT_ORDER,
} from "@/lib/constants/anonymous-funnel-events"

const WINDOW_DAYS = 30

export async function AnonymousFunnelPanel() {
  const counts = await anonymousFunnelService.getFunnelCounts(WINDOW_DAYS)
  const byName = new Map(counts.map((row) => [row.name, row.count]))

  const total = counts.reduce((sum, row) => sum + row.count, 0)

  const landingViews =
    byName.get(ANONYMOUS_FUNNEL_EVENT_ORDER[0]) ?? 0
  const signupViews =
    byName.get(ANONYMOUS_FUNNEL_EVENT_ORDER[1]) ?? 0

  const conversionRate =
    landingViews === 0
      ? null
      : Math.round((signupViews / landingViews) * 1000) / 10

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold">
            Anonymous funnel (last {WINDOW_DAYS} days)
          </h3>
          <p className="mt-1 text-sm text-zinc-400">
            Raw page-view counts, not unique visitors — no cookie, no
            visitor id, nothing linkable to a person. See /privacy.
          </p>
        </div>
      </div>

      {total === 0 ? (
        <p className="mt-4 text-sm text-zinc-500">
          No events recorded yet in this window.
        </p>
      ) : (
        <div className="mt-4 space-y-1.5">
          {ANONYMOUS_FUNNEL_EVENT_ORDER.map((name) => (
            <div
              key={name}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-zinc-300">
                {ANONYMOUS_FUNNEL_EVENT_LABELS[name]}
              </span>
              <span className="text-zinc-500">{byName.get(name) ?? 0}</span>
            </div>
          ))}

          {conversionRate !== null && (
            <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-2 text-sm">
              <span className="text-zinc-300">
                Landing → signup page (rough)
              </span>
              <span className="text-zinc-500">{conversionRate}%</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
