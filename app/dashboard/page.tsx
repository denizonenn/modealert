"use client";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

import DashboardHeader from "@/components/dashboard/dashboard-header";
import WatchingList from "@/components/dashboard/watching-list";

import { useDashboard } from "@/hooks/use-dashboard";

export default function DashboardPage() {
  const { stats, isLoading } = useDashboard();

  return (
    <>
      <Navbar />

      <main className="mx-auto min-h-screen max-w-7xl px-6 py-16">
        {isLoading || !stats ? (
          "Loading..."
        ) : (
          <>
            <DashboardHeader
              watched={stats.watched}
              live={stats.live}
              nextEvent={stats.nextEvent}
            />

            <WatchingList />
          </>
        )}
      </main>

      <Footer />
    </>
  );
}
