import type {
  ProviderEvent,
} from "@/lib/providers/core/provider";

import type {
  EventWithGame,
} from "@/lib/repositories/event.repository";

export interface NotificationRecipient {
  id: string;

  email: string;

  discordWebhookUrl?: string | null;
}

export interface NotificationProvider {
  readonly id: string;

  readonly name: string;

  readonly enabled: boolean;

  send(
    recipient: NotificationRecipient,
    event: ProviderEvent,
    previous: EventWithGame | null
  ): Promise<void>;
}
