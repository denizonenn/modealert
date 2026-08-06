import { http } from "@/lib/http/client";

import { WARFRAME_API } from "./constants";

export const warframeClient = {
  async get<T>(path: string): Promise<T> {
    return http<T>(`${WARFRAME_API.BASE_URL}${path}`, {
      timeout: WARFRAME_API.TIMEOUT,

      retries: WARFRAME_API.RETRY_COUNT,

      headers: {
        Accept: "application/json",
      },
    });
  },
};
