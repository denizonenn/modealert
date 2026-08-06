import { http } from "@/lib/http/client";

import { HELLDIVERS2_API } from "./constants";

export const helldivers2Client = {
  async get<T>(path: string): Promise<T> {
    return http<T>(`${HELLDIVERS2_API.BASE_URL}${path}`, {
      timeout: HELLDIVERS2_API.TIMEOUT,

      retries: HELLDIVERS2_API.RETRY_COUNT,

      headers: {
        Accept: "application/json",

        "X-Super-Client": "ModeAlert",

        "X-Super-Contact": "denizate@gmail.com",
      },
    });
  },
};
