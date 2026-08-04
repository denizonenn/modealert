import {
  SiFortnite,
  SiLeagueoflegends,
  SiValorant,
} from "react-icons/si"

import type { IconType } from "react-icons"

export const GAME_BRAND_ICONS: Record<
  string,
  IconType
> = {
  lol: SiLeagueoflegends,
  valorant: SiValorant,
  fortnite: SiFortnite,
}
