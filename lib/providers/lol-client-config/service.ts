import { clientConfigClient } from "./client";

import { mapQueueStatuses } from "./event-mapper";

export const lolClientConfigService = {
  async getEvents() {
    const configsByRegion =
      await clientConfigClient.getAllRegions();

    return mapQueueStatuses(configsByRegion);
  },
};
