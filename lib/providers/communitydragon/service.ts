import {
  communityDragonClient,
} from "./client";

import {
  COMMUNITY_DRAGON_EVENT_HUB,
} from "./constants";

import {
  normalizeEventHub,
  mapPbeCandidates,
  toDisplayEvents,
} from "./normalizer";

import type {
  CommunityDragonCurrentStatus,
  CommunityDragonEventHubResponse,
  CommunityDragonPatchline,
} from "./types";

import type {
  ProviderEvent,
} from "@/lib/providers/core/provider";

async function fetchEventHub(
  patchline: CommunityDragonPatchline
): Promise<CommunityDragonEventHubResponse> {
  return communityDragonClient.get<CommunityDragonEventHubResponse>(
    COMMUNITY_DRAGON_EVENT_HUB,
    patchline
  );
}

export const communityDragonService = {
  async getEvents(): Promise<
    ProviderEvent[]
  > {
    const eventHub =
      await fetchEventHub("live");

    return normalizeEventHub(
      eventHub
    );
  },

  async getPbeCandidateEvents(): Promise<
    ProviderEvent[]
  > {
    const [live, pbe] =
      await Promise.all([
        fetchEventHub("live"),
        fetchEventHub("pbe"),
      ]);

    return mapPbeCandidates(
      pbe,
      live
    );
  },

  async getCurrentStatus(): Promise<
    CommunityDragonCurrentStatus
  > {
    const [live, pbe] =
      await Promise.allSettled([
        fetchEventHub("live"),
        fetchEventHub("pbe"),
      ]);

    if (live.status === "rejected") {
      throw live.reason;
    }

    const liveDisplay =
      toDisplayEvents(live.value);

    const pbeCheckFailed =
      pbe.status === "rejected";

    const pbeCandidates =
      pbeCheckFailed
        ? []
        : toDisplayEvents(
            pbe.value
          ).filter(
            (pbeEvent) =>
              !liveDisplay.some(
                (liveEvent) =>
                  liveEvent.id ===
                  pbeEvent.id
              )
          );

    return {
      liveEvents:
        liveDisplay.filter(
          (event) =>
            event.status === "LIVE"
        ),

      upcomingEvents:
        liveDisplay.filter(
          (event) =>
            event.status ===
            "UPCOMING"
        ),

      pbeCandidates,

      pbeCheckFailed,

      checkedAt:
        new Date().toISOString(),
    };
  },

};