import type { EventProvider, ProviderEvent } from "../core/provider";
import { env } from "@/lib/config/env";
import { pubgService } from "./service";

export const pubgProvider: EventProvider = {
  id: "pubg",
  name: "PUBG: BATTLEGROUNDS",
  enabled: Boolean(env.PUBG_API_KEY),

  async getEvents(): Promise<ProviderEvent[]> {
    return pubgService.getEvents();
  },
};
