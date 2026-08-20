"use client";

import { motion } from "framer-motion";
import {
  Bell,
  CheckCircle2,
  Clock3,
  Gamepad2,
} from "lucide-react";

import { GAME_BRAND_ICONS } from "@/components/shared/game-brand-icons";
import { useI18n } from "@/components/providers/i18n-provider";

export interface PreviewEvent {
  gameId: string;
  game: string;
  mode: string;
  status: string;
  color: string;
}

interface Props {
  events: PreviewEvent[];
  monitoredCount: number;
}

const STATUS_STYLES: Record<string, string> = {
  LIVE: "bg-emerald-500",
  TRACKING: "bg-blue-500",
  UPCOMING: "bg-amber-500",
};

export function DashboardPreview({ events, monitoredCount }: Props) {
  const { dict } = useI18n();

  const STATUS_LABELS: Record<string, string> = {
    LIVE: dict.common.live,
    TRACKING: dict.common.tracking,
    UPCOMING: dict.common.upcoming,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="mt-20 w-full max-w-6xl rounded-3xl border border-white/10 bg-zinc-950 shadow-2xl"
    >
      <div className="border-b border-white/10 px-8 py-5">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-white p-2 text-black">
            <Bell size={18} />
          </div>

          <div>
            <h3 className="font-semibold">{dict.home.dashboardTitle}</h3>
            <p className="text-sm text-zinc-500">
              {dict.home.dashboardSubtitle}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 p-8 lg:grid-cols-2">

        <div className="space-y-4">

          {events.length === 0 ? (
            <p className="text-sm text-zinc-500">
              {dict.home.dashboardEmpty}
            </p>
          ) : (
            events.map((event) => {
              const BrandIcon = GAME_BRAND_ICONS[event.gameId];

              return (
                <motion.div
                  key={event.gameId}
                  whileHover={{ scale: 1.02 }}
                  className="rounded-2xl border border-white/10 bg-black/40 p-5"
                >
                  <div className="flex items-center justify-between gap-4">

                    <div className="flex min-w-0 items-center gap-4">

                      <div
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border"
                        style={{
                          backgroundColor: `${event.color}1a`,
                          borderColor: `${event.color}40`,
                        }}
                      >
                        {BrandIcon ? (
                          <BrandIcon size={20} style={{ color: event.color }} />
                        ) : (
                          <Gamepad2 size={20} />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm text-zinc-500">
                          {event.game}
                        </p>

                        <h4 className="truncate font-semibold">
                          {event.mode}
                        </h4>
                      </div>

                    </div>

                    <div
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold text-black ${STATUS_STYLES[event.status] ?? "bg-zinc-500"}`}
                    >
                      {STATUS_LABELS[event.status] ?? event.status}
                    </div>

                  </div>
                </motion.div>
              );
            })
          )}

        </div>

        <div className="flex flex-col justify-center rounded-2xl border border-white/10 bg-white/[0.03] p-8">

          <div className="flex items-center gap-3">
            <CheckCircle2 className="text-emerald-400" />
            <span className="font-semibold">
              {dict.home.dashboardMonitoringAuto}
            </span>
          </div>

          <div className="mt-6 space-y-5 text-zinc-400">

            <div className="flex items-center gap-3">
              <Clock3 size={18} />
              {dict.home.dashboardChecksDaily}
            </div>

            <div className="flex items-center gap-3">
              <Bell size={18} />
              {dict.home.dashboardInstantAlerts}
            </div>

            <div className="flex items-center gap-3">
              <Gamepad2 size={18} />
              {dict.home.dashboardMultiGame}
            </div>

          </div>

          <div className="mt-8 rounded-xl bg-emerald-500/15 p-5">

            <p className="text-3xl font-bold text-emerald-400">
              {monitoredCount}
            </p>

            <p className="mt-2 text-sm text-zinc-400">
              {dict.home.dashboardEventsMonitored}
            </p>

          </div>

        </div>

      </div>
    </motion.div>
  );
}
