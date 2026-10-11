"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

import { useI18n } from "@/components/providers/i18n-provider";

// Real, currently-tracked rotating modes only — every game/event pair
// here has a live ModeAlert provider (see docs/09_BACKLOG.md "P2 —
// Multi Game Support"). Never add a game ModeAlert doesn't actually
// support just because it fits the rotation — this text is the first
// thing a visitor reads, and it must not promise coverage that isn't
// real.
const modes = [
  { game: "League of Legends", event: "URF" },
  { game: "League of Legends", event: "Arena" },
  { game: "Valorant", event: "Night Market" },
  { game: "Destiny 2", event: "Iron Banner" },
  { game: "Destiny 2", event: "Trials of Osiris" },
  { game: "Destiny 2", event: "Xûr" },
  { game: "Warframe", event: "Void Trader" },
];

export function ModeRotator() {
  const { dict } = useI18n();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((current) => (current + 1) % modes.length);
    }, 2200);

    return () => clearInterval(interval);
  }, []);

  const mode = modes[index];

  return (
    <div className="mt-8 flex min-h-14 w-full max-w-full items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/5 px-4 py-2 sm:w-auto sm:px-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={mode.event}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.35 }}
          className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm sm:text-base"
        >
          <span className="text-zinc-400">
            {dict.home.modeRotatorNeverAsk}
          </span>

          <span className="font-semibold text-white">
            &ldquo;{mode.event}&rdquo;
          </span>

          <span className="text-zinc-400">
            {dict.home.modeRotatorIsBack}
          </span>

          <span className="hidden text-zinc-400 sm:inline">
            •
          </span>

          <span className="basis-full text-center text-xs text-zinc-500 sm:basis-auto sm:text-sm">
            {mode.game}
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}