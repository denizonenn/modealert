import type { EventProvider, ProviderEvent } from "../core/provider";

import { eaFcService } from "./service";

export const eaFcProvider: EventProvider = {
  id: "ea-fc",

  name: "EA Sports FC (FUT.GG)",

  enabled: true,

  async getEvents(): Promise<ProviderEvent[]> {
    return eaFcService.getEvents();
  },
};
