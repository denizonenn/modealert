interface Props {
  watched: number;
  live: number;
  nextEvent: string;
}

export default function DashboardHeader({
  watched,
  live,
  nextEvent,
}: Props) {
  const greeting =
    new Date().getHours() < 12
      ? "Good Morning"
      : new Date().getHours() < 18
      ? "Good Afternoon"
      : "Good Evening";

  return (
    <section className="mb-12">
      <p className="text-zinc-500">
        {greeting}
      </p>

      <h1 className="mt-2 text-5xl font-bold">
        Your Dashboard
      </h1>

      <div className="mt-6 flex flex-wrap gap-8 text-sm">

        <div>

          <p className="text-zinc-500">
            Watching
          </p>

          <p className="text-2xl font-semibold">
            {watched}
          </p>

        </div>

        <div>

          <p className="text-zinc-500">
            Live Now
          </p>

          <p className="text-2xl font-semibold text-emerald-400">
            {live}
          </p>

        </div>

        <div>

          <p className="text-zinc-500">
            Next Expected
          </p>

          <p className="text-xl">
            {nextEvent}
          </p>

        </div>

      </div>
    </section>
  );
}