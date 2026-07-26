import { Watchlist } from "@/types/watchlist";

export const watchlists: Watchlist[] = [
  {
    id: "1",
    userId: "demo",

    gameId: "lol",

    eventId: "urf",

    enabled: true,

    createdAt: new Date(),
  },

  {
    id: "2",
    userId: "demo",

    gameId: "valorant",

    eventId: "night-market",

    enabled: true,

    createdAt: new Date(),
  },
];