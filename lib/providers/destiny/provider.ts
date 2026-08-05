import type { EventProvider, ProviderEvent } from "../core/provider";
import { env } from "@/lib/config/env";
import { destinyService } from "./service";

export const destinyProvider: EventProvider = {
  id: "destiny",
  name: "Destiny 2",
  enabled: Boolean(env.BUNGIE_API_KEY),

  async getEvents(): Promise<ProviderEvent[]> {
    return destinyService.getEvents();
  },
};
