import { http } from "@/lib/http/client";

import { FUT_GG_API, futGgSbcEndpoint } from "./constants";

import type { FutGgSbcListResponse } from "./types";

export const eaFcClient = {
  async getSbcPage(page: number): Promise<FutGgSbcListResponse> {
    return http<FutGgSbcListResponse>(
      `${FUT_GG_API.BASE_URL}${futGgSbcEndpoint(page)}`,
      {
        timeout: FUT_GG_API.TIMEOUT,
        retries: FUT_GG_API.RETRY_COUNT,
        headers: {
          Accept: "application/json",
          "User-Agent": "Mozilla/5.0 (compatible; ModeAlert/1.0)",
        },
      }
    );
  },
};
