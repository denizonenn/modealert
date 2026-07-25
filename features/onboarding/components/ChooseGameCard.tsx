"use client"

import clsx from "clsx"

type Props = {
  icon: string
  name: string
  events: number
  selected: boolean
  onClick: () => void
}

export function ChooseGameCard({
  icon,
  name,
  events,
  selected,
  onClick,
}: Props) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "rounded-2xl border p-5 transition-all duration-200",
        selected
          ? "border-white bg-white text-black"
          : "border-white/10 bg-white/5 text-white hover:bg-white/10"
      )}
    >
      <div className="text-4xl">{icon}</div>

      <h3 className="mt-4 font-semibold">
        {name}
      </h3>

      <p className="mt-2 text-sm opacity-70">
        {events} events
      </p>
    </button>
  )
}