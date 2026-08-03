import type {
  ProviderEvent,
} from "@/lib/providers/core/provider";

import { getProviders } from "@/lib/providers/core/provider-registry";

import { getEvents } from "@/lib/repositories/event.repository";

import { settleAll } from "@/lib/utils/promise";

import { compareEvents } from "./event-comparator";

export async function checkEvents() {
  const providerEvents =
    await collectProviderEvents();

  const databaseEvents =
    await getEvents();

  return compareEvents(
    providerEvents,
    databaseEvents
  );
}

export async function collectProviderEvents(): Promise<
  ProviderEvent[]
> {
  const providers =
    getProviders();

  const events =
    await settleAll(
      providers.map((provider) =>
        provider.getEvents()
      )
    );

  return events.flat();
}