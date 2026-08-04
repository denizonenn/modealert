import type {
  EventProvider,
  ProviderEvent,
} from "../core/provider";

import { valorantService } from "./service";

export const valorantProvider: EventProvider = {
  id: "valorant",

  name: "Valorant",

  enabled: true,

  async getEvents(): Promise<
    ProviderEvent[]
  > {
    return valorantService.getEvents();
  },
};
