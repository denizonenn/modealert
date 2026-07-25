"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const modes = [
  { game: "League of Legends", event: "URF" },
  { game: "League of Legends", event: "Arena" },
  { game: "Valorant", event: "Night Market" },
  { game: "Fortnite", event: "OG" },
  { game: "Apex Legends", event: "Shadow Royale" },
  { game: "Overwatch 2", event: "Archives" },
  { game: "TFT", event: "Set Revival" },
];

export function ModeRotator() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((current) => (current + 1) % modes.length);
    }, 2200);

    return () => clearInterval(interval);
  }, []);

  const mode = modes[index];

  return (
    <div className="mt-8 flex h-14 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/5 px-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={mode.event}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.35 }}
          className="flex items-center gap-3"
        >
          <span className="text-zinc-400">
            Never ask
          </span>

          <span className="font-semibold text-white">
            "{mode.event}"
          </span>

          <span className="text-zinc-400">
            is back?
          </span>

          <span className="text-zinc-600">
            •
          </span>

          <span className="text-sm text-zinc-500">
            {mode.game}
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}