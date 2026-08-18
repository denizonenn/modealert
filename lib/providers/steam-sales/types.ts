export interface SteamAppDetailsResponse {
  [appid: string]: {
    success: boolean;
    data?: {
      price_overview?: {
        currency: string;
        initial: number;
        final: number;
        discount_percent: number;
      };
    };
  };
}
