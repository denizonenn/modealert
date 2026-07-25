import { featuredEvents } from "@/lib/data/events"

export function getFeaturedEvents() {
  return featuredEvents.filter((event) => event.featured)
}