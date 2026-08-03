import type {
  EventProvider,
  ProviderEvent,
} from "../core/provider";

import { riotService } from "./service";

export const riotProvider: EventProvider = {
  id: "riot",

  name: "Riot Games",

  enabled: true,

  async getEvents(): Promise<
    ProviderEvent[]
  > {
    return riotService.getEvents();
  },
};