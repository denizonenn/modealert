import type { EventProvider, ProviderEvent } from "../core/provider";

import { ffxivService } from "./service";

export const ffxivProvider: EventProvider = {
  id: "ffxiv",

  name: "Final Fantasy XIV",

  enabled: true,

  async getEvents(): Promise<ProviderEvent[]> {
    return ffxivService.getEvents();
  },
};
