import { eaFcClient } from "./client";
import { mapSbcActivity } from "./event-mapper";

import type { ProviderEvent } from "../core/provider";
import type { FutGgSbc } from "./types";

export const eaFcService = {
  async getEvents(): Promise<ProviderEvent[]> {
    const first = await eaFcClient.getSbcPage(1);

    const remainingPages = await Promise.all(
      Array.from(
        { length: Math.max(0, first.totalPages - 1) },
        (_, i) => eaFcClient.getSbcPage(i + 2)
      )
    );

    const allSbcs: FutGgSbc[] = [first, ...remainingPages].flatMap(
      (page) => page.data
    );

    return mapSbcActivity(allSbcs);
  },
};
