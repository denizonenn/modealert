import StatCard from "./stat-card";

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
  const hour = new Date().getHours();

  const greeting =
    hour < 12
      ? "Good Morning"
      : hour < 18
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

      <p className="mt-3 max-w-xl text-zinc-400">
        Track every game event you&apos;re following in one place.
      </p>

      <div className="mt-8 flex flex-wrap gap-5">
        <StatCard
          title="Watching"
          value={watched}
        />

        <StatCard
          title="Live Now"
          value={live}
          accent="text-emerald-400"
        />

        <StatCard
          title="Next Event"
          value={nextEvent}
          accent="text-blue-400"
        />
      </div>
    </section>
  );
}