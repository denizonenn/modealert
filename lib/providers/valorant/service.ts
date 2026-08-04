import { valorantClient } from "./client";

import {
  VALORANT_CONTENT_ENDPOINT,
  VALORANT_STATUS_ENDPOINT,
} from "./constants";

import { mapValorantEvents } from "./event-mapper";

import type {
  ValorantContentResponse,
  ValorantPlatformStatusResponse,
} from "./types";

export const valorantService = {
  async getEvents() {
    const [status, content] =
      await Promise.all([
        valorantClient.get<ValorantPlatformStatusResponse>(
          VALORANT_STATUS_ENDPOINT
        ),

        valorantClient.get<ValorantContentResponse>(
          VALORANT_CONTENT_ENDPOINT
        ),
      ]);

    return mapValorantEvents(
      status,
      content
    );
  },
};
