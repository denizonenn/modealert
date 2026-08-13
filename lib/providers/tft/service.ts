import { tftClient } from "./client";
import { TFT_PLATFORM_STATUS_ENDPOINT } from "./constants";
import { mapPlatformStatus, mapCurrentSet } from "./event-mapper";
import type { TftPlatformStatusResponse } from "./types";

export const tftService = {
  async getEvents() {
    const [status, setData] = await Promise.all([
      tftClient.get<TftPlatformStatusResponse>(
        TFT_PLATFORM_STATUS_ENDPOINT
      ),
      tftClient.getSetData(),
    ]);

    return [
      ...mapPlatformStatus(status),
      ...mapCurrentSet(setData),
    ];
  },
};
