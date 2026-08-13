import { planetside2Client } from "./client";
import { mapCurrentAlert } from "./event-mapper";

export const planetside2Service = {
  async getEvents() {
    const [events, definitions, zones] = await Promise.all([
      planetside2Client.getRecentAlerts(),
      planetside2Client.getMetagameEventDefinitions(),
      planetside2Client.getZones(),
    ]);

    return mapCurrentAlert(events, definitions, zones);
  },
};
