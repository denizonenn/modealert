export interface WarframeVoidTrader {
  id: string;

  activation: string;

  expiry: string;

  character: string;

  location: string;
}

export interface WarframeNightwave {
  active: boolean | null;

  season: number;

  tag: string;
}

export interface WarframeSortie {
  id: string;

  activation: string;

  expiry: string;

  boss: string;

  expired: boolean | null;
}

export interface WarframeArchonHunt {
  id: string;

  activation: string;

  expiry: string;

  boss: string;
}

export interface WarframeArchimedea {
  id: string;

  activation: string;

  expiry: string;

  type?: string;
}

export interface WarframeWorldstate {
  voidTrader?: WarframeVoidTrader;

  nightwave?: WarframeNightwave | null;

  sortie?: WarframeSortie;

  archonHunt?: WarframeArchonHunt;

  archimedeas?: WarframeArchimedea[];
}
