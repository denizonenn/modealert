"use client";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

import DashboardHeader from "@/components/dashboard/dashboard-header";
import WatchingList from "@/components/dashboard/watching-list";

import { Skeleton } from "@/components/shared/skeleton";

import { useDashboard } from "@/hooks/use-dashboard";

export default function DashboardPage() {
  const { stats, isLoading } = useDashboard();

  return (
    <>
      <Navbar />

      <main className="mx-auto min-h-screen max-w-7xl px-6 py-16">
        {isLoading || !stats ? (
          <div className="space-y-8">
            <div>
              <Skeleton className="h-4 w-28" />
              <Skeleton className="mt-3 h-10 w-72" />
              <Skeleton className="mt-3 h-4 w-96" />
            </div>

            <div className="flex flex-wrap gap-4">
              <Skeleton className="h-[76px] w-[200px]" />
              <Skeleton className="h-[76px] w-[200px]" />
              <Skeleton className="h-[76px] w-[200px]" />
            </div>
          </div>
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
