"use client";

import { HeroCarousel, type HeroCarouselItem } from "@/components/ui/hero-carousel";

export interface GamesKeyArtCarouselGame {
  id: string;
  name: string;
  shortName: string;
  color: string;
  image: string;
  supportedEvents: number;
}

interface Props {
  games: GamesKeyArtCarouselGame[];
}

export function GamesKeyArtCarousel({ games }: Props) {
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

  return (
    <div className="h-[520px] w-full overflow-hidden rounded-2xl border border-white/10 md:h-[620px]">
      <HeroCarousel items={items} brand="MODEALERT" autoplay autoplayDelay={4500} />
    </div>
  );
}
