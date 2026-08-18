import { http } from "@/lib/http/client";

import { FFXIV_API } from "./constants";

export const ffxivClient = {
  async get<T>(path: string): Promise<T> {
    return http<T>(`${FFXIV_API.BASE_URL}${path}`, {
      timeout: FFXIV_API.TIMEOUT,
      retries: FFXIV_API.RETRY_COUNT,
      headers: { Accept: "application/json" },
    });
  },
};
