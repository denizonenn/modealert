import { http } from "@/lib/http/client";
import { env } from "@/lib/config/env";

import { PUBG_API, PUBG_SEASONS_ENDPOINT } from "./constants";
import type { PubgSeasonsResponse } from "./types";

export const pubgClient = {
  async getSeasons(): Promise<PubgSeasonsResponse> {
    return http<PubgSeasonsResponse>(
      `${PUBG_API.BASE_URL}${PUBG_SEASONS_ENDPOINT}`,
      {
        timeout: PUBG_API.TIMEOUT,
        retries: PUBG_API.RETRY_COUNT,
        headers: {
          Accept: "application/vnd.api+json",
          Authorization: `Bearer ${env.PUBG_API_KEY}`,
        },
      }
    );
  },
};
