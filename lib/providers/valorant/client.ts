import { http } from "@/lib/http/client";

import { VALORANT_API } from "./constants";

export const valorantClient = {
  async get<T>(path: string): Promise<T> {
    return http<T>(
      `${VALORANT_API.BASE_URL}${path}`,
      {
        timeout:
          VALORANT_API.TIMEOUT,

        retries:
          VALORANT_API.RETRY_COUNT,

        headers: {
          Accept:
            "application/json",

          "Content-Type":
            "application/json",

          "X-Riot-Token":
            process.env
              .RIOT_API_KEY ?? "",
        },
      }
    );
  },
};
