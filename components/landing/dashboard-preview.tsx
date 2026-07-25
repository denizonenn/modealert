"use client";

import { motion } from "framer-motion";
import {
  Bell,
  Clock3,
 CheckCircle2,
  Gamepad2,
} from "lucide-react";

const events = [
  {
    game: "League of Legends",
    mode: "URF",
    status: "LIVE",
    color: "bg-emerald-500",
  },
  {
    game: "Valorant",
    mode: "Night Market",
    status: "Tracking",
    color: "bg-blue-500",
  },
  {
    game: "Fortnite",
    mode: "OG",
    status: "Upcoming",
    color: "bg-orange-500",
  },
  {
    game: "Overwatch 2",
    mode: "Archives",
    status: "Waiting",
    color: "bg-zinc-600",
  },
];

export function DashboardPreview() {
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
            <h3 className="font-semibold">ModeAlert Dashboard</h3>
            <p className="text-sm text-zinc-500">
              Live event monitoring
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 p-8 lg:grid-cols-2">

        <div className="space-y-4">

          {events.map((event) => (
            <motion.div
              key={event.game}
              whileHover={{ scale: 1.02 }}
              className="rounded-2xl border border-white/10 bg-black/40 p-5"
            >
              <div className="flex items-center justify-between">

                <div className="flex items-center gap-4">

                  <div className="rounded-xl bg-white/10 p-3">
                    <Gamepad2 size={20} />
                  </div>

                  <div>
                    <p className="text-sm text-zinc-500">
                      {event.game}
                    </p>

                    <h4 className="font-semibold">
                      {event.mode}
                    </h4>
                  </div>

                </div>

                <div
                  className={`rounded-full px-3 py-1 text-xs font-semibold text-black ${event.color}`}
                >
                  {event.status}
                </div>

              </div>
            </motion.div>
          ))}

        </div>

        <div className="flex flex-col justify-center rounded-2xl border border-white/10 bg-white/[0.03] p-8">

          <div className="flex items-center gap-3">
            <CheckCircle2 className="text-emerald-400" />
            <span className="font-semibold">
              Monitoring 24/7
            </span>
          </div>

          <div className="mt-6 space-y-5 text-zinc-400">

            <div className="flex items-center gap-3">
              <Clock3 size={18} />
              Checks every hour
            </div>

            <div className="flex items-center gap-3">
              <Bell size={18} />
              Instant email notifications
            </div>

            <div className="flex items-center gap-3">
              <Gamepad2 size={18} />
              Multi-game support
            </div>

          </div>

          <div className="mt-8 rounded-xl bg-emerald-500/15 p-5">

            <p className="text-3xl font-bold text-emerald-400">
              24
            </p>

            <p className="mt-2 text-sm text-zinc-400">
              Events currently monitored
            </p>

          </div>

        </div>

      </div>
    </motion.div>
  );
}