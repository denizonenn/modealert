import type { EventProvider } from "./provider";

import { riotProvider } from "@/lib/providers/riot/provider";

const providers: EventProvider[] = [
  riotProvider,
];

export function getProviders(): EventProvider[] {
  return providers;
}

export function registerProvider(
  provider: EventProvider
) {
  providers.push(provider);
}