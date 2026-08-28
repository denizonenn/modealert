import { analyticsService } from "@/lib/services/analytics.service"
import {
  ANALYTICS_EVENT_LABELS,
  ANALYTICS_EVENTS,
  ANALYTICS_FUNNEL_ORDER,
  type AnalyticsEventName,
} from "@/lib/constants/analytics-events"

const WINDOW_DAYS = 30

export async function FunnelPanel() {
  const counts = await analyticsService.getFunnelCounts(WINDOW_DAYS)
  const byName = new Map(counts.map((row) => [row.name, row.count]))

  const total = counts.reduce((sum, row) => sum + row.count, 0)

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold">Funnel (last {WINDOW_DAYS} days)</h3>
          <p className="mt-1 text-sm text-zinc-400">
            First-party, signed-in-users-only counts — no third-party
            tracker. See /privacy.
          </p>
        </div>
      </div>

      {total === 0 ? (
        <p className="mt-4 text-sm text-zinc-500">
          No events recorded yet in this window.
        </p>
      ) : (
        <div className="mt-4 space-y-1.5">
          {ANALYTICS_FUNNEL_ORDER.map((name: AnalyticsEventName) => (
            <div
              key={name}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-zinc-300">
                {ANALYTICS_EVENT_LABELS[name]}
              </span>
              <span className="text-zinc-500">{byName.get(name) ?? 0}</span>
            </div>
          ))}

          {/* Attrition, not acquisition — kept out of the funnel
              sequence above but shown in the same window so a
              cancellation isn't a silent DB sync with zero visibility. */}
          <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-2 text-sm">
            <span className="text-zinc-300">
              {ANALYTICS_EVENT_LABELS[ANALYTICS_EVENTS.PREMIUM_CANCELLED]}
            </span>
            <span className="text-red-400">
              {byName.get(ANALYTICS_EVENTS.PREMIUM_CANCELLED) ?? 0}
            </span>
          </div>

          {/* First real qualitative signal from actual users, not just
              inferred from clicks — the weekly digest's 1-click
              "was this useful?" link. */}
          <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-2 text-sm">
            <span className="text-zinc-300">
              {ANALYTICS_EVENT_LABELS[ANALYTICS_EVENTS.DIGEST_MARKED_USEFUL]}
            </span>
            <span className="text-emerald-400">
              {byName.get(ANALYTICS_EVENTS.DIGEST_MARKED_USEFUL) ?? 0}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-300">
              {
                ANALYTICS_EVENT_LABELS[
                  ANALYTICS_EVENTS.DIGEST_MARKED_NOT_USEFUL
                ]
              }
            </span>
            <span className="text-red-400">
              {byName.get(ANALYTICS_EVENTS.DIGEST_MARKED_NOT_USEFUL) ?? 0}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
