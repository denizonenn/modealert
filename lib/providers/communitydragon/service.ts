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

  async debug() {
    const paths = [
      "/plugins/rcp-be-lol-game-data/global/default/v1/",
    ];

    for (const path of paths) {
      console.log("");
      console.log("====================================");
      console.log(path);
      console.log("====================================");

      try {
        const response =
          await fetch(
            `https://raw.communitydragon.org/latest${path}`
          );

        console.log(
          "STATUS:",
          response.status
        );

        const text =
          await response.text();

        console.log(text);

        const keywords = [
          "event",
          "mission",
          "shop",
          "pass",
          "token",
          "loot",
          "urf",
          "arena",
          "clash",
          "mode",
          "rotation",
          "hub",
        ];

        console.log("");

        for (const keyword of keywords) {
          if (
            text
              .toLowerCase()
              .includes(keyword)
          ) {
            console.log(
              `FOUND: ${keyword}`
            );
          }
        }
      } catch (error) {
        console.error(error);
      }
    }
  },
};