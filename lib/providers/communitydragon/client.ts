import { http } from "@/lib/http/client";

import type {
  CommunityDragonPatchline,
} from "./types";

import {
  COMMUNITY_DRAGON,
  COMMUNITY_DRAGON_BASE_URLS,
} from "./constants";

export const communityDragonClient = {
  async get<T>(
    endpoint: string,
    patchline: CommunityDragonPatchline = "live"
  ): Promise<T> {
    const baseUrl =
      COMMUNITY_DRAGON_BASE_URLS[
        patchline
      ];

    return http<T>(
      `${baseUrl}${endpoint}`,
      {
        timeout:
          COMMUNITY_DRAGON.TIMEOUT,
      }
    );
  },
};
