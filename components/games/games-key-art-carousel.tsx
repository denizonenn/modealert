"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

import { HeroCarousel, type HeroCarouselItem } from "@/components/ui/hero-carousel";

export interface GamesKeyArtCarouselGame {
  id: string;
  name: string;
  shortName: string;
  color: string;
  image: string;
  supportedEvents: number;
}

export interface GamesKeyArtCarouselEvent {
  id: string;
  title: string;
  status: string;
  slug: string | null;
}

interface Props {
  games: GamesKeyArtCarouselGame[];
  eventsByGame: Record<string, GamesKeyArtCarouselEvent[]>;
}

const STATUS_STYLES: Record<string, string> = {
  LIVE: "bg-emerald-500 text-black",
  TRACKING: "bg-blue-500 text-black",
  UPCOMING: "bg-amber-500 text-black",
  ENDED: "bg-zinc-700 text-zinc-300",
};

export function GamesKeyArtCarousel({ games, eventsByGame }: Props) {
  const [activeIndex, setActiveIndex] = React.useState(0);

  const items: HeroCarouselItem[] = games.map((game) => ({
    id: game.id,
    title: game.name,
    image: game.image,
    accent: game.color,
    meta: [
      game.supportedEvents === 1
        ? "1 tracked event"
        : `${game.supportedEvents} tracked events`,
    ],
  }));

  const activeGame = games[activeIndex];
  const activeEvents = activeGame ? eventsByGame[activeGame.id] ?? [] : [];

  return (
    <div className="relative w-full">
      <div className="h-[100svh] w-full">
        <HeroCarousel
          items={items}
          index={activeIndex}
          onIndexChange={setActiveIndex}
          brand="MODEALERT"
          autoplay
          autoplayDelay={4500}
        />
      </div>

      <div className="border-b border-white/10 bg-black">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeGame?.id ?? "empty"}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-sm font-mono uppercase tracking-[0.2em] text-zinc-500">
                {activeGame?.name} — active events
              </h3>

              {activeEvents.length === 0 ? (
                <p className="mt-4 text-zinc-500">
                  No tracked events for this game right now.
                </p>
              ) : (
                <div className="mt-5 flex flex-wrap gap-3">
                  {activeEvents.map((event) => {
                    const content = (
                      <>
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                            STATUS_STYLES[event.status] ?? "bg-zinc-700 text-zinc-300"
                          }`}
                        >
                          {event.status}
                        </span>
                        <span className="text-sm font-medium text-white">
                          {event.title}
                        </span>
                      </>
                    );

                    return event.slug ? (
                      <Link
                        key={event.id}
                        href={`/events/${event.slug}`}
                        className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1.5 pl-1.5 pr-4 transition-colors hover:border-white/20 hover:bg-white/10"
                      >
                        {content}
                      </Link>
                    ) : (
                      <div
                        key={event.id}
                        className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1.5 pl-1.5 pr-4"
                      >
                        {content}
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
