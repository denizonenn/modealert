import { Game } from "@/types/game";

export const games: Game[] = [
  {
    id: "lol",
    name: "League of Legends",
    slug: "league-of-legends",
    shortName: "LoL",
    logo: "🎮",
    color: "#5383EC",
    supportedEvents: 8,
    activeUsers: "12.8k",
    featured: true,
  },

  {
    id: "valorant",
    name: "Valorant",
    slug: "valorant",
    shortName: "VAL",
    logo: "🎯",
    color: "#FF4655",
    supportedEvents: 4,
    activeUsers: "8.4k",
    featured: true,
  },

  {
    id: "tft",
    name: "Teamfight Tactics",
    slug: "teamfight-tactics",
    shortName: "TFT",
    logo: "♟️",
    color: "#D9A441",
    supportedEvents: 5,
    activeUsers: "4.2k",
    featured: false,
  },

  {
    id: "fortnite",
    name: "Fortnite",
    slug: "fortnite",
    shortName: "FN",
    logo: "🏝️",
    color: "#4DD0E1",
    supportedEvents: 6,
    activeUsers: "9.1k",
    featured: true,
  },

  {
    id: "apex",
    name: "Apex Legends",
    slug: "apex-legends",
    shortName: "Apex",
    logo: "🛡️",
    color: "#FF7043",
    supportedEvents: 3,
    activeUsers: "2.9k",
    featured: false,
  },

  {
    id: "ow2",
    name: "Overwatch 2",
    slug: "overwatch-2",
    shortName: "OW2",
    logo: "⚡",
    color: "#F28C28",
    supportedEvents: 4,
    activeUsers: "3.3k",
    featured: false,
  },
];