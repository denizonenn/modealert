import { tftClient } from "./client";
import { TFT_PLATFORM_STATUS_ENDPOINT } from "./constants";
import { mapPlatformStatus, mapCurrentSet } from "./event-mapper";
import type { TftPlatformStatusResponse } from "./types";

// Split into two independent calls (and two registered providers,
// see set-provider.ts) rather than one combined getEvents(): platform
// status needs RIOT_API_KEY, current-set data is CommunityDragon and
// entirely keyless. Combining them behind a single Promise.all meant
// a Riot key outage silently took Current Set down too, even though
// it doesn't depend on Riot at all — confirmed live 2026-08-19 (key
// had been broken for weeks, Current Set had never once synced).
// Same split CommunityDragon already uses for live vs PBE.
export const tftService = {
  async getPlatformStatusEvents() {
    const status =
      await tftClient.get<TftPlatformStatusResponse>(
        TFT_PLATFORM_STATUS_ENDPOINT
      );

    return mapPlatformStatus(status);
  },

  async getSetEvents() {
    const setData = await tftClient.getSetData();

    return mapCurrentSet(setData);
  },
};
