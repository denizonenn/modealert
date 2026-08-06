import type { EventProvider, ProviderEvent } from "../core/provider";

import { helldivers2Service } from "./service";

export const helldivers2Provider: EventProvider = {
  id: "helldivers2",

  name: "Helldivers 2",

  enabled: true,

  async getEvents(): Promise<ProviderEvent[]> {
    return helldivers2Service.getEvents();
  },
};
