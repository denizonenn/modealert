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

  PUBG_API_KEY:
    process.env.PUBG_API_KEY ?? "",

  BUNGIE_API_KEY:
    process.env.BUNGIE_API_KEY ?? "",

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

  ADMIN_EMAILS:
    process.env.ADMIN_EMAILS ?? "",

  LEMONSQUEEZY_API_KEY:
    process.env.LEMONSQUEEZY_API_KEY ?? "",

  LEMONSQUEEZY_STORE_SUBDOMAIN:
    process.env.LEMONSQUEEZY_STORE_SUBDOMAIN ?? "",

  LEMONSQUEEZY_VARIANT_ID:
    process.env.LEMONSQUEEZY_VARIANT_ID ?? "",

  // Separate variant for the yearly plan — same product, a second
  // price/variant in the Lemon Squeezy dashboard. Optional: yearly
  // checkout stays hidden (not broken) until this is set, same
  // pattern as every other LEMONSQUEEZY_* var.
  LEMONSQUEEZY_VARIANT_ID_YEARLY:
    process.env.LEMONSQUEEZY_VARIANT_ID_YEARLY ?? "",

  // A one-time "Single Payment" product/variant in Lemon Squeezy, not
  // a subscription — see the order-webhook path in billing.service.ts.
  LEMONSQUEEZY_VARIANT_ID_LIFETIME:
    process.env.LEMONSQUEEZY_VARIANT_ID_LIFETIME ?? "",

  LEMONSQUEEZY_WEBHOOK_SECRET:
    process.env.LEMONSQUEEZY_WEBHOOK_SECRET ?? "",
} as const;