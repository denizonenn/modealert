import type { EventProvider } from "./provider";

import { riotProvider } from "@/lib/providers/riot/provider";
import { communityDragonProvider } from "@/lib/providers/communitydragon/provider";
import { communityDragonPbeProvider } from "@/lib/providers/communitydragon/pbe-provider";
import { valorantProvider } from "@/lib/providers/valorant/provider";
import { destinyProvider } from "@/lib/providers/destiny/provider";
import { tftProvider } from "@/lib/providers/tft/provider";
import { tftSetProvider } from "@/lib/providers/tft/set-provider";
import { fortniteProvider } from "@/lib/providers/fortnite/provider";
import { warframeProvider } from "@/lib/providers/warframe/provider";
import { poeProvider } from "@/lib/providers/poe/provider";
import { helldivers2Provider } from "@/lib/providers/helldivers2/provider";
import { foxholeProvider } from "@/lib/providers/foxhole/provider";
import { pubgProvider } from "@/lib/providers/pubg/provider";
import { planetside2Provider } from "@/lib/providers/planetside2/provider";
import { rotatingModesProvider } from "@/lib/providers/rotating-modes/provider";
import { lolClientConfigProvider } from "@/lib/providers/lol-client-config/provider";
import { steamSalesProvider } from "@/lib/providers/steam-sales/provider";
import { ffxivProvider } from "@/lib/providers/ffxiv/provider";
import { eaFcProvider } from "@/lib/providers/ea-fc/provider";

const providers: EventProvider[] = [
  riotProvider,
  communityDragonProvider,
  communityDragonPbeProvider,
  valorantProvider,
  destinyProvider,
  tftProvider,
  tftSetProvider,
  fortniteProvider,
  warframeProvider,
  poeProvider,
  helldivers2Provider,
  foxholeProvider,
  pubgProvider,
  planetside2Provider,
  rotatingModesProvider,
  lolClientConfigProvider,
  steamSalesProvider,
  ffxivProvider,
  eaFcProvider,
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
// A disabled provider is never synced again, so whatever it last wrote
// is a frozen snapshot that would otherwise sit in the DB as LIVE
// forever (see the frozen-snapshot rule). Read paths use this to hide
// those rows. Unknown sources (not a registered provider) stay visible.
export function isProviderEnabled(
  id: string
): boolean {
  return (
    providers.find(
      (provider) => provider.id === id
    )?.enabled ?? true
  );
}
