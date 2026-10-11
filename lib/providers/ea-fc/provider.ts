import type { EventProvider, ProviderEvent } from "../core/provider";

import { eaFcService } from "./service";

export const eaFcProvider: EventProvider = {
  id: "ea-fc",

  name: "EA Sports FC (FUT.GG)",

  // Disabled 2026-10-11: fut.gg (a fan site, no official EA API exists)
  // answers Vercel's servers with HTTP 403 — blocked since ~2026-09-10,
  // so the last synced SBC count was a month-old frozen snapshot.
  // Re-enable only with a source that works from Vercel.
  enabled: false,

  async getEvents(): Promise<ProviderEvent[]> {
    return eaFcService.getEvents();
  },
};
