import type {
  CommunityDragonPatchline,
} from "./types";

import {
  COMMUNITY_DRAGON,
  COMMUNITY_DRAGON_BASE_URLS,
} from "./constants";

class CommunityDragonClient {
  async get<T>(
    endpoint: string,
    patchline: CommunityDragonPatchline = "live"
  ): Promise<T> {
    const baseUrl =
      COMMUNITY_DRAGON_BASE_URLS[
        patchline
      ];

    const response =
      await fetch(
        `${baseUrl}${endpoint}`,
        {
          signal:
            AbortSignal.timeout(
              COMMUNITY_DRAGON.TIMEOUT
            ),
        }
      );

    if (!response.ok) {
      throw new Error(
        `CommunityDragon request failed (${response.status}) [${patchline}] ${endpoint}`
      );
    }

    return response.json();
  }
}

export const communityDragonClient =
  new CommunityDragonClient();
