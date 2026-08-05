import { http } from "@/lib/http/client";

import { FORTNITE_API } from "./constants";

export const fortniteClient = {
  async get<T>(path: string): Promise<T> {
    return http<T>(
      `${FORTNITE_API.BASE_URL}${path}`,
      {
        timeout:
          FORTNITE_API.TIMEOUT,

        retries:
          FORTNITE_API.RETRY_COUNT,

        headers: {
          Accept:
            "application/json",
        },
      }
    );
  },
};
