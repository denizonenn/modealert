import { watchlists } from "@/lib/data/mock/watchlists";

export function getWatchlists() {
  return watchlists;
}

export function getWatchlistsByUser(userId: string) {
  return watchlists.filter((x) => x.userId === userId);
}