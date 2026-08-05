import type { EventProvider } from "./provider";

import { riotProvider } from "@/lib/providers/riot/provider";
import { communityDragonProvider } from "@/lib/providers/communitydragon/provider";
import { valorantProvider } from "@/lib/providers/valorant/provider";
import { destinyProvider } from "@/lib/providers/destiny/provider";

const providers: EventProvider[] = [
  riotProvider,
  communityDragonProvider,
  valorantProvider,
  destinyProvider,
];

export function getProviders(): EventProvider[] {
  return providers;
}

export function registerProvider(
  provider: EventProvider
) {
  providers.push(provider);
}