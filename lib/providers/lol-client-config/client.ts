import { http } from "@/lib/http/client";

import {
  CLIENT_CONFIG_API,
  CLIENT_CONFIG_REGIONS,
} from "./constants";

import type { ClientConfigResponse } from "./types";

async function getRegionConfig(
  region: string
): Promise<ClientConfigResponse> {
  return http<ClientConfigResponse>(
    `${CLIENT_CONFIG_API.BASE_URL}${CLIENT_CONFIG_API.ENDPOINT}?os=windows&region=${region.toUpperCase()}&app=LeagueClient&version=1&patchline=live`,
    {
      timeout: CLIENT_CONFIG_API.TIMEOUT,

      retries: CLIENT_CONFIG_API.RETRY_COUNT,

      headers: {
        Accept: "application/json",
      },
    }
  );
}

export const clientConfigClient = {
  // One request per region, in parallel — each region's own
  // queueConfigs is only accurate in a response fetched with that
  // region's own `region` param (see constants.ts). Keyed by region
  // id so event-mapper.ts can look up each region's own response
  // rather than mixing them.
  async getAllRegions(): Promise<
    Record<string, ClientConfigResponse>
  > {
    const entries = await Promise.all(
      CLIENT_CONFIG_REGIONS.map(
        async (region) =>
          [region, await getRegionConfig(region)] as const
      )
    );

    return Object.fromEntries(entries);
  },
};
