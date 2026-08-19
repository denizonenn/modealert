import type { EventProvider, ProviderEvent } from "../core/provider";
import { tftService } from "./service";

export const tftProvider: EventProvider = {
  id: "tft",
  name: "Teamfight Tactics",
  enabled: true,

  async getEvents(): Promise<ProviderEvent[]> {
    return tftService.getPlatformStatusEvents();
  },
};
