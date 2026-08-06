import type {
  EventProvider,
  ProviderEvent,
} from "../core/provider";

import { communityDragonService } from "./service";

// A separate source ("communitydragon-pbe") from the confirmed-live
// provider so PBE previews sync into their own Event rows — trackable
// in onboarding/dashboard like any other event — without ever being
// confused with, or overwriting, a confirmed live event.
export const communityDragonPbeProvider: EventProvider = {
  id: "communitydragon-pbe",

  name: "CommunityDragon (PBE Preview)",

  enabled: true,

  async getEvents(): Promise<ProviderEvent[]> {
    return communityDragonService.getPbeCandidateEvents();
  },
};
