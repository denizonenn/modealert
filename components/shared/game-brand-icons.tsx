import {
  SiBungie,
  SiFortnite,
  SiLeagueoflegends,
  SiPubg,
  SiSquareenix,
  SiValorant,
} from "react-icons/si"

import {
  GiChessKnight,
  GiHoodedFigure,
  GiPlanetConquest,
  GiRobotHelmet,
  GiSpartanHelmet,
  GiTrenchSpade,
} from "react-icons/gi"

import type { IconType } from "react-icons"

// No official brand marks exist for these (niche/no public press-kit
// SVG) — themed icons instead of the emoji fallback, since emoji
// rendering isn't reliable across every OS/browser font stack.
export const GAME_BRAND_ICONS: Record<
  string,
  IconType
> = {
  lol: SiLeagueoflegends,
  valorant: SiValorant,
  fortnite: SiFortnite,
  destiny: SiBungie,
  tft: GiChessKnight,
  warframe: GiRobotHelmet,
  poe: GiHoodedFigure,
  helldivers2: GiSpartanHelmet,
  foxhole: GiTrenchSpade,
  pubg: SiPubg,
  planetside2: GiPlanetConquest,
  ffxiv: SiSquareenix,
}
