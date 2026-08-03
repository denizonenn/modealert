"use client";

import DashboardHeader from "@/components/dashboard/dashboard-header";
import WatchingList from "@/components/dashboard/watching-list";

import { useDashboard } from "@/hooks/use-dashboard";

export default function DashboardPage() {
  const { stats, isLoading } = useDashboard();

  if (isLoading || !stats) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-16">
        Loading...
      </main>
    );
  }

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