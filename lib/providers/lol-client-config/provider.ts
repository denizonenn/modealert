import type {
  EventProvider,
  ProviderEvent,
} from "../core/provider";

import { lolClientConfigService } from "./service";

export const lolClientConfigProvider: EventProvider = {
  id: "lol-client-config",

  name: "LoL Live Queue Status",

  enabled: true,

  async getEvents(): Promise<ProviderEvent[]> {
    return lolClientConfigService.getEvents();
  },
};
