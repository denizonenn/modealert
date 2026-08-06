export interface FortniteShopItem {
  name: string;
}

export interface FortniteShopEntry {
  offerId: string;

  inDate: string;

  outDate: string;

  brItems?: FortniteShopItem[];
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
