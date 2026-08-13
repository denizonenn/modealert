import { http } from "@/lib/http/client";

import {
  PLANETSIDE2_ALERTS_ENDPOINT,
  PLANETSIDE2_API,
  PLANETSIDE2_METAGAME_EVENTS_ENDPOINT,
  PLANETSIDE2_ZONES_ENDPOINT,
} from "./constants";
import type {
  Ps2MetagameEventDefinitionResponse,
  Ps2WorldEventResponse,
  Ps2ZoneResponse,
} from "./types";

function get<T>(path: string): Promise<T> {
  return http<T>(`${PLANETSIDE2_API.BASE_URL}${path}`, {
    timeout: PLANETSIDE2_API.TIMEOUT,
    retries: PLANETSIDE2_API.RETRY_COUNT,
  });
}

export const planetside2Client = {
  async getRecentAlerts(): Promise<Ps2WorldEventResponse> {
    return get<Ps2WorldEventResponse>(PLANETSIDE2_ALERTS_ENDPOINT);
  },

  async getMetagameEventDefinitions(): Promise<Ps2MetagameEventDefinitionResponse> {
    return get<Ps2MetagameEventDefinitionResponse>(
      PLANETSIDE2_METAGAME_EVENTS_ENDPOINT
    );
  },

  async getZones(): Promise<Ps2ZoneResponse> {
    return get<Ps2ZoneResponse>(PLANETSIDE2_ZONES_ENDPOINT);
  },
};
