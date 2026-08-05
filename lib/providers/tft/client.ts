import { http } from "@/lib/http/client";

import { TFT_API } from "./constants";

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
};
