import { http } from "@/lib/http/client";

import { FOXHOLE_API } from "./constants";

export const foxholeClient = {
  async get<T>(path: string): Promise<T> {
    return http<T>(`${FOXHOLE_API.BASE_URL}${path}`, {
      timeout: FOXHOLE_API.TIMEOUT,

      retries: FOXHOLE_API.RETRY_COUNT,

      headers: {
        Accept: "application/json",
      },
    });
  },
};
