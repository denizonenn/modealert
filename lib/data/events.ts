import { GameEvent } from "@/types/event"

export const featuredEvents: GameEvent[] = [
  {
    id: "urf",

    gameId: "lol",

    name: "URF",

    slug: "urf",

    category: "Game Mode",

    live: false,

    featured: true,
  },

  {
    id: "arena",

    gameId: "lol",

    name: "Arena",

    slug: "arena",

    category: "Game Mode",

    live: false,

    featured: true,
  },

  {
    id: "night-market",

    gameId: "valorant",

    name: "Night Market",

    slug: "night-market",

    category: "Store",

    live: false,

    featured: true,
  },

  {
    id: "steam-sale",

    gameId: "steam",

    name: "Summer Sale",

    slug: "summer-sale",

    category: "Sale",

    live: false,

    featured: true,
  },
]