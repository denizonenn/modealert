import type { EventProvider } from "./provider";

import { riotProvider } from "@/lib/providers/riot/provider";
import { communityDragonProvider } from "@/lib/providers/communitydragon/provider";
import { valorantProvider } from "@/lib/providers/valorant/provider";
import { destinyProvider } from "@/lib/providers/destiny/provider";
import { tftProvider } from "@/lib/providers/tft/provider";
import { fortniteProvider } from "@/lib/providers/fortnite/provider";
import { warframeProvider } from "@/lib/providers/warframe/provider";
import { poeProvider } from "@/lib/providers/poe/provider";

const providers: EventProvider[] = [
  riotProvider,
  communityDragonProvider,
  valorantProvider,
  destinyProvider,
  tftProvider,
  fortniteProvider,
  warframeProvider,
  poeProvider,
];

export function getProviders(): EventProvider[] {
  return providers;
}

export function registerProvider(
  provider: EventProvider
) {
  providers.push(provider);
}