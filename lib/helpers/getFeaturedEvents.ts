import { events } from "../data/events";

export function getFeaturedEvents() {
  return events.slice(0, 4);
}