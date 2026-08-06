import type { EventProvider, ProviderEvent } from "../core/provider";

import { warframeService } from "./service";

export const warframeProvider: EventProvider = {
  id: "warframe",

  name: "Warframe",

  enabled: true,

  async getEvents(): Promise<ProviderEvent[]> {
    return warframeService.getEvents();
  },
};
