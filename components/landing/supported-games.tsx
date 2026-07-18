const games = [
  "League of Legends",
  "Valorant",
  "Teamfight Tactics",
  "Fortnite",
  "Apex Legends",
  "Overwatch 2",
]

export default function SupportedGames() {
  return (
    <section id="games" className="border-y border-white/10 bg-white/[0.02]">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <p className="text-center text-sm uppercase tracking-[0.3em] text-zinc-500">
          Supported games
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {games.map((game) => (
            <div
              key={game}
              className="rounded-full border border-white/10 bg-black/40 px-5 py-3 text-sm text-zinc-200"
            >
              {game}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}