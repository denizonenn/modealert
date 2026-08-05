import { http } from "@/lib/http/client";
import { env } from "@/lib/config/env";
import { DESTINY_API } from "./constants";
import type { BungieResponse } from "./types";

export const destinyClient = {
  async get<T>(path: string): Promise<T> {
    const wrapped = await http<BungieResponse<T>>(
      `${DESTINY_API.BASE_URL}${path}`,
      {
        timeout: DESTINY_API.TIMEOUT,
        retries: DESTINY_API.RETRY_COUNT,
        headers: {
          Accept: "application/json",
          "X-API-Key": env.BUNGIE_API_KEY,
        },
      }
    );

    return wrapped.Response;
  },

  async getStatic<T>(path: string): Promise<T> {
    return http<T>(`${DESTINY_API.BASE_URL_STATIC}${path}`, {
      timeout: DESTINY_API.TIMEOUT,
      retries: DESTINY_API.RETRY_COUNT,
      headers: {
        Accept: "application/json",
      },
    });
  },
};
