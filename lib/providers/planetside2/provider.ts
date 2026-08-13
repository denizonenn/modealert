import type { EventProvider, ProviderEvent } from "../core/provider";
import { planetside2Service } from "./service";

export const planetside2Provider: EventProvider = {
  id: "planetside2",
  name: "PlanetSide 2",
  enabled: true,

  async getEvents(): Promise<ProviderEvent[]> {
    return planetside2Service.getEvents();
  },
};
