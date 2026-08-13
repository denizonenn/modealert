import { http } from "@/lib/http/client";

import { TFT_API, TFT_CDRAGON_SETS_URL } from "./constants";
import type { TftSetsResponse } from "./types";

export const tftClient = {
  async get<T>(path: string): Promise<T> {
    return http<T>(`${TFT_API.BASE_URL}${path}`, {
      timeout: TFT_API.TIMEOUT,
      retries: TFT_API.RETRY_COUNT,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Riot-Token": process.env.RIOT_API_KEY ?? "",
      },
    });
  },

  // No key needed — CommunityDragon is a public mirror. Bigger payload
  // (~26MB) than the other TFT call, so a longer timeout and fewer
  // retries (retrying a 26MB request on every transient hiccup isn't
  // worth it — the health check surfaces a real outage either way).
  async getSetData(): Promise<TftSetsResponse> {
    return http<TftSetsResponse>(TFT_CDRAGON_SETS_URL, {
      timeout: 30_000,
      retries: 1,
    });
  },
};
