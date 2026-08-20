interface StatsBarProps {
  gameCount: number
  eventCount: number
  gamesLabel: string
  eventsLabel: string
}

export function StatsBar({
  gameCount,
  eventCount,
  gamesLabel,
  eventsLabel,
}: StatsBarProps) {
  return (
    <div className="mt-14 flex items-center justify-center gap-x-10 gap-y-4 sm:gap-x-16">
      <div className="text-center">
        <p className="text-3xl font-bold text-gradient-brand md:text-4xl">
          {gameCount}
        </p>
        <p className="mt-1 text-sm text-zinc-500">{gamesLabel}</p>
      </div>

      <div className="h-10 w-px bg-white/10" />

      <div className="text-center">
        <p className="text-3xl font-bold text-gradient-brand md:text-4xl">
          {eventCount}
        </p>
        <p className="mt-1 text-sm text-zinc-500">{eventsLabel}</p>
      </div>
    </div>
  )
}
