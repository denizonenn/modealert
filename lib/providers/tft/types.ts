export interface TftPlatformStatusResponse {
  id: string;
  maintenances?: unknown[];
  incidents?: unknown[];
}

// Only the `sets` keys matter here — CDragon's real response also has
// `items`/`setData` and much richer per-set champion/trait/augment
// data we don't need, TypeScript just doesn't need those typed since
// we never read them.
export interface TftSetsResponse {
  sets: Record<string, { name?: string }>;
}
