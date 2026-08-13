import type { EventProvider } from "./provider";

import { riotProvider } from "@/lib/providers/riot/provider";
import { communityDragonProvider } from "@/lib/providers/communitydragon/provider";
import { communityDragonPbeProvider } from "@/lib/providers/communitydragon/pbe-provider";
import { valorantProvider } from "@/lib/providers/valorant/provider";
import { destinyProvider } from "@/lib/providers/destiny/provider";
import { tftProvider } from "@/lib/providers/tft/provider";
import { fortniteProvider } from "@/lib/providers/fortnite/provider";
import { warframeProvider } from "@/lib/providers/warframe/provider";
import { poeProvider } from "@/lib/providers/poe/provider";
import { helldivers2Provider } from "@/lib/providers/helldivers2/provider";
import { foxholeProvider } from "@/lib/providers/foxhole/provider";
import { rotatingModesProvider } from "@/lib/providers/rotating-modes/provider";
import { lolClientConfigProvider } from "@/lib/providers/lol-client-config/provider";

const providers: EventProvider[] = [
  riotProvider,
  communityDragonProvider,
  communityDragonPbeProvider,
  valorantProvider,
  destinyProvider,
  tftProvider,
  fortniteProvider,
  warframeProvider,
  poeProvider,
  helldivers2Provider,
  foxholeProvider,
  rotatingModesProvider,
  lolClientConfigProvider,
];

export function getProviders(): EventProvider[] {
  return providers;
}

export function getProviderName(
  id: string
): string {
  return (
    providers.find(
      (provider) => provider.id === id
    )?.name ?? id
  );
}