import { helldivers2Client } from "./client";

import { HELLDIVERS2_ASSIGNMENTS_ENDPOINT } from "./constants";

import { mapAssignments } from "./event-mapper";

import type { Helldivers2AssignmentsResponse } from "./types";

export const helldivers2Service = {
  async getEvents() {
    const assignments =
      await helldivers2Client.get<Helldivers2AssignmentsResponse>(
        HELLDIVERS2_ASSIGNMENTS_ENDPOINT
      );

    return mapAssignments(assignments);
  },
};
