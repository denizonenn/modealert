import { http } from "@/lib/http/client";

import { POE_API } from "./constants";

export const poeClient = {
  async get<T>(path: string): Promise<T> {
    return http<T>(`${POE_API.BASE_URL}${path}`, {
      timeout: POE_API.TIMEOUT,

      retries: POE_API.RETRY_COUNT,

      headers: {
        Accept: "application/json",

        "User-Agent":
          "ModeAlert/1.0 (contact: denizate@gmail.com)",
      },
    });
  },
};
