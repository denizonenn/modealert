import type {
  EventProvider,
  ProviderEvent,
} from "../core/provider";

import { fortniteService } from "./service";

export const fortniteProvider: EventProvider = {
  id: "fortnite",

  name: "Fortnite",

  enabled: true,

  async getEvents(): Promise<
    ProviderEvent[]
  > {
    return fortniteService.getEvents();
  },
};
