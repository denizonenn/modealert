import type { EventProvider, ProviderEvent } from "../core/provider";
import { tftService } from "./service";

// Separate from tftProvider (Riot platform status) so a Riot API key
// outage can't take this down too — this is CommunityDragon's keyless
// game-file mirror, an entirely independent data source. See the
// comment in service.ts for the real incident that prompted the
// split.
export const tftSetProvider: EventProvider = {
  id: "tft-set",
  name: "Teamfight Tactics (Current Set)",
  enabled: true,

  async getEvents(): Promise<ProviderEvent[]> {
    return tftService.getSetEvents();
  },
};
