import type {
  ProviderEvent,
} from "@/lib/providers/core/provider";

import type {
  EventWithGame,
} from "@/lib/repositories/event.repository";

export interface NotificationProvider {
  readonly id: string;

  readonly name: string;

  readonly enabled: boolean;

  send(
    event: ProviderEvent,
    previous: EventWithGame | null
  ): Promise<void>;
}