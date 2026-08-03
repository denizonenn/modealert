function requireEnv(
  key: string
): string {
  const value =
    process.env[key];

  if (!value) {
    throw new Error(
      `Missing environment variable: ${key}`
    );
  }

  return value;
}

export const env = {
  DATABASE_URL:
    requireEnv(
      "DATABASE_URL"
    ),

  CRON_SECRET:
    requireEnv(
      "CRON_SECRET"
    ),

  RIOT_API_KEY:
    process.env.RIOT_API_KEY ?? "",
} as const;