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

  // Global kill switch for the paywall — see docs/06_DECISIONS.md
  // ADR-067. Both Lemon Squeezy and Paddle declined the merchant-of-
  // record application, so there is currently no working payment
  // processor; this flag makes every Premium-gated feature free for
  // everyone (including signed-out visitors — see billingService.getPlan)
  // without touching the Paddle integration, the DB, or any user's
  // real `plan` value, so it can be flipped back on the moment a
  // processor works. Defaults to OFF (paywall enforced) — must be
  // explicitly set to "true" to disable it, the same safe-default
  // pattern as every other optional flag here.
  MONETIZATION_ENABLED:
    process.env.MONETIZATION_ENABLED === "true",

  // Paddle Billing — see docs/06_DECISIONS.md ADR-066. All optional:
  // until they're set, checkout stays hidden ("Upgrades aren't live
  // yet"), not broken — same rollout pattern as Resend/Google OAuth.
  // PADDLE_ENVIRONMENT is the exception once anything else is set: it
  // is never defaulted, so the app can't silently talk to the wrong
  // Paddle account (see lib/billing/paddle-client.ts).
  PADDLE_ENVIRONMENT:
    process.env.PADDLE_ENVIRONMENT ?? "",

  // Server-side only — never passed to a client component.
  PADDLE_API_KEY:
    process.env.PADDLE_API_KEY ?? "",

  // Client-side token (`test_…` sandbox / `live_…` production). Safe
  // to expose; handed to the pricing page's client component as a prop
  // so a Vercel env change doesn't need a rebuild to take effect.
  PADDLE_CLIENT_TOKEN:
    process.env.PADDLE_CLIENT_TOKEN ?? "",

  PADDLE_PRICE_ID_MONTHLY:
    process.env.PADDLE_PRICE_ID_MONTHLY ?? "",

  PADDLE_PRICE_ID_YEARLY:
    process.env.PADDLE_PRICE_ID_YEARLY ?? "",

  // A one-time price on the same product, not a subscription — see
  // the transaction/adjustment webhook path in billing.service.ts.
  PADDLE_PRICE_ID_LIFETIME:
    process.env.PADDLE_PRICE_ID_LIFETIME ?? "",

  // Secret of the notification destination (`pdl_ntfset_…`) — not the
  // API key. Sandbox and production destinations each have their own.
  PADDLE_WEBHOOK_SECRET:
    process.env.PADDLE_WEBHOOK_SECRET ?? "",
} as const;