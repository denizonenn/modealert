import { getRecentFeedback } from "@/lib/repositories/feedback.repository"

const LIMIT = 20

export async function FeedbackPanel() {
  const feedback = await getRecentFeedback(LIMIT)

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <h3 className="font-semibold">Recent feedback</h3>
      <p className="mt-1 text-sm text-zinc-400">
        Last {LIMIT} submissions from the navbar feedback widget, newest
        first.
      </p>

      {feedback.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-500">
          No feedback submitted yet.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {feedback.map((entry) => (
            <div
              key={entry.id}
              className="rounded-lg border border-white/10 bg-black/30 p-3 text-sm"
            >
              <div className="flex items-center justify-between gap-3 text-xs text-zinc-500">
                <span>{entry.user.email}</span>
                <span>{entry.createdAt.toLocaleString()}</span>
              </div>
              <p className="mt-1.5 whitespace-pre-wrap text-zinc-300">
                {entry.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
