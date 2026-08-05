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

  RESEND_API_KEY:
    process.env.RESEND_API_KEY ?? "",

  EMAIL_FROM:
    process.env.EMAIL_FROM ??
    "ModeAlert <onboarding@resend.dev>",

  AUTH_SECRET:
    process.env.AUTH_SECRET ?? "",

  AUTH_GOOGLE_ID:
    process.env.AUTH_GOOGLE_ID ?? "",

  AUTH_GOOGLE_SECRET:
    process.env.AUTH_GOOGLE_SECRET ?? "",

  AUTH_DISCORD_ID:
    process.env.AUTH_DISCORD_ID ?? "",

  AUTH_DISCORD_SECRET:
    process.env.AUTH_DISCORD_SECRET ?? "",
} as const;