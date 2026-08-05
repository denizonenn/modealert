export interface FortniteShopEntry {
  offerId: string;

  inDate: string;

  outDate: string;
}

export interface FortniteShopData {
  hash: string;

  date: string;

  entries: FortniteShopEntry[];
}

export interface FortniteShopResponse {
  status: number;

  data: FortniteShopData;
}
