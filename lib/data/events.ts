import { Event } from "@/types/event";

export const events: Event[] = [
  {
    id: "urf",
    game: "lol",
    title: "Ultra Rapid Fire",
    status: "LIVE",
    trackedUsers: 12841,
    lastChecked: "42 sec ago",
  },

  {
    id: "arena",
    game: "lol",
    title: "Arena",
    status: "UPCOMING",
    trackedUsers: 8422,
    lastChecked: "1 min ago",
  },

  {
    id: "night-market",
    game: "valorant",
    title: "Night Market",
    status: "TRACKING",
    trackedUsers: 10294,
    lastChecked: "15 sec ago",
  },

  {
    id: "fortnite-og",
    game: "fortnite",
    title: "Fortnite OG",
    status: "ENDED",
    trackedUsers: 6230,
    lastChecked: "39 sec ago",
  },
];