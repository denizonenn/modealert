import type { ProviderEvent, ProviderEventStatus } from "../core/provider";
import { GAME_IDS } from "@/lib/constants/games";
import { EVENT_CATEGORIES } from "@/lib/constants/event-category";
import type {
  Ps2MetagameEventDefinitionResponse,
  Ps2WorldEventResponse,
  Ps2ZoneResponse,
} from "./types";

export function mapCurrentAlert(
  events: Ps2WorldEventResponse,
  definitions: Ps2MetagameEventDefinitionResponse,
  zones: Ps2ZoneResponse
): ProviderEvent[] {
  // Already sorted newest-first by the query itself — the single most
  // recent start/end transition record tells us whether an Alert is
  // live right now.
  const latest = events.world_event_list?.[0];

  if (!latest) {
    return [];
  }

  const definition = definitions.metagame_event_list.find(
    (d) => d.metagame_event_id === latest.metagame_event_id
  );
  const zone = zones.zone_list.find(
    (z) => z.zone_id === latest.zone_id
  );

  const eventName = definition?.name.en ?? `Alert ${latest.metagame_event_id}`;
  const zoneName = zone?.name.en ?? `Zone ${latest.zone_id}`;

  const isLive = latest.metagame_event_state_name === "started";
  const status: ProviderEventStatus = isLive ? "LIVE" : "ENDED";

  const transitionedAt = new Date(Number(latest.timestamp) * 1000);

  let description: string;

  if (isLive) {
    const durationMinutes = definition?.duration_minutes
      ? Number(definition.duration_minutes)
      : null;

    const estimatedEnd = durationMinutes
      ? new Date(transitionedAt.getTime() + durationMinutes * 60_000)
      : null;

    description = `A server-wide territory-control Alert (${eventName}) is active on ${zoneName}${
      estimatedEnd
        ? `, expected to end around ${estimatedEnd.toUTCString()}`
        : ""
    } — detected from Daybreak's live world_event data.`;
  } else {
    // Alerts trigger from real population/territory conditions, not a
    // fixed schedule — no "next expected" claim, unlike Iron Banner's
    // real announced cadence.
    description = `No territory-control Alert currently active. The last one (${eventName} on ${zoneName}) ended ${transitionedAt.toUTCString()}.`;
  }

  return [
    {
      id: `planetside2-alert-${latest.instance_id}`,
      gameId: GAME_IDS.PLANETSIDE_2,
      title: "Territory Alert",
      description,
      status,
      category: EVENT_CATEGORIES.ROTATION_MILESTONE,
      isLimitedTime: true,
      seriesKey: "planetside2-alert",
      trackedUsers: 0,
      checkedAt: new Date(),
    },
  ];
}
