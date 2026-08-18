import type { EventProvider, ProviderEvent } from "../core/provider";

import { steamSalesService } from "./service";

export const steamSalesProvider: EventProvider = {
  id: "steam-sales",

  name: "Steam Sales",

  enabled: true,

  async getEvents(): Promise<ProviderEvent[]> {
    return steamSalesService.getEvents();
  },
};
