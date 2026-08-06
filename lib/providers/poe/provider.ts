import type { EventProvider, ProviderEvent } from "../core/provider";

import { poeService } from "./service";

export const poeProvider: EventProvider = {
  id: "poe",

  name: "Path of Exile",

  enabled: true,

  async getEvents(): Promise<ProviderEvent[]> {
    return poeService.getEvents();
  },
};
