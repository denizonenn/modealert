import { ffxivClient } from "./client";
import { FFXIV_GATE_STATUS_ENDPOINT } from "./constants";
import { mapGateStatus } from "./event-mapper";

import type { FfxivGateStatus } from "./types";

export const ffxivService = {
  async getEvents() {
    const gate = await ffxivClient.get<FfxivGateStatus>(
      FFXIV_GATE_STATUS_ENDPOINT
    );

    return mapGateStatus(gate);
  },
};
