import { http } from "@/lib/http/client";

import { RIOT_API } from "./constants";

export const riotClient = {
  async get<T>(path: string): Promise<T> {
    return http<T>(
      `${RIOT_API.BASE_URL}${path}`,
      {
        timeout: RIOT_API.TIMEOUT,

        headers: {
          Accept: "application/json",

          "Content-Type":
            "application/json",

          "X-Riot-Token":
  process.env.RIOT_API_KEY ?? "",
        },
      }
    );
  },
};