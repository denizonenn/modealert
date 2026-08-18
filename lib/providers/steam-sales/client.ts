import { http } from "@/lib/http/client";

import { STEAM_API } from "./constants";
import type { SteamAppDetailsResponse } from "./types";

export const steamSalesClient = {
  async getPriceOverview(
    appId: number
  ): Promise<SteamAppDetailsResponse> {
    return http<SteamAppDetailsResponse>(
      `${STEAM_API.BASE_URL}/api/appdetails?appids=${appId}&filters=price_overview`,
      {
        timeout: STEAM_API.TIMEOUT,
        retries: STEAM_API.RETRY_COUNT,
        headers: { Accept: "application/json" },
      }
    );
  },
};
