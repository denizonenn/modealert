import DashboardHeader from "@/components/dashboard/dashboard-header";
import WatchingList from "@/components/dashboard/watching-list";
import { getDashboardStats } from "@/lib/helpers/getDashboardStats";

export default function DashboardPage() {
  const stats = getDashboardStats();

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-16">

      <DashboardHeader
        watched={stats.watched}
        live={stats.live}
        nextEvent={stats.nextEvent}
      />

      <WatchingList />

    </main>
  );
}