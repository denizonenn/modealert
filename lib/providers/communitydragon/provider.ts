import type {
  EventProvider,
  ProviderEvent,
} from "../core/provider";

import { communityDragonService } from "./service";

export const communityDragonProvider: EventProvider = {
  id: "communitydragon",

  name: "CommunityDragon",

  enabled: true,

  async getEvents(): Promise<
    ProviderEvent[]
  > {
    return communityDragonService.getEvents();
  },
};
