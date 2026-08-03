import { riotClient } from "./client";

import {
  RIOT_PLATFORM_STATUS_ENDPOINT,
  RIOT_CHAMPION_ROTATION_ENDPOINT,
} from "./constants";

import {
  mapPlatformStatus,
} from "./event-mapper";

import {
  mapChampionRotation,
} from "./champion-rotation.mapper";

import type {
  RiotPlatformStatusResponse,
  RiotChampionRotationResponse,
} from "./types";

export const riotService = {
  async getEvents() {
    const [
      platform,
      rotation,
    ] = await Promise.all([
      riotClient.get<RiotPlatformStatusResponse>(
        RIOT_PLATFORM_STATUS_ENDPOINT
      ),

      riotClient.get<RiotChampionRotationResponse>(
        RIOT_CHAMPION_ROTATION_ENDPOINT
      ),
    ]);

    return [
      ...mapPlatformStatus(
        platform
      ),

      ...mapChampionRotation(
        rotation
      ),
    ];
  },
};