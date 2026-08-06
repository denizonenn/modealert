import type { EventProvider, ProviderEvent } from "../core/provider";

import { foxholeService } from "./service";

export const foxholeProvider: EventProvider = {
  id: "foxhole",

  name: "Foxhole",

  enabled: true,

  async getEvents(): Promise<ProviderEvent[]> {
    return foxholeService.getEvents();
  },
};
