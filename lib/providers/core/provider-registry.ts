import type {
  EventProvider,
} from "./provider";

import { riotProvider } from "@/lib/providers/riot/provider";

export interface RegisteredProvider {
  provider: EventProvider;

  enabled: boolean;

  priority: number;
}

const providers: RegisteredProvider[] = [
  {
    provider: riotProvider,

    enabled: true,

    priority: 1,
  },
];

export function getProviders(): EventProvider[] {
  return providers
    .filter(
      (provider) => provider.enabled
    )
    .sort(
      (a, b) =>
        a.priority - b.priority
    )
    .map(
      (provider) =>
        provider.provider
    );
}

export function registerProvider(
  provider: RegisteredProvider
) {
  providers.push(provider);
}