import { tftClient } from "./client";
import { TFT_PLATFORM_STATUS_ENDPOINT } from "./constants";
import { mapPlatformStatus } from "./event-mapper";
import type { TftPlatformStatusResponse } from "./types";

export const tftService = {
  async getEvents() {
    const status = await tftClient.get<TftPlatformStatusResponse>(
      TFT_PLATFORM_STATUS_ENDPOINT
    );

    return mapPlatformStatus(status);
  },
};
