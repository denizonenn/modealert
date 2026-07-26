import { events } from "@/lib/data/events";

export function getEvents() {
  return events;
}

export function getEventById(id: string) {
  return events.find((event) => event.id === id);
}

export function getEventsByGame(gameId: string) {
  return events.filter((event) => event.game === gameId);
}