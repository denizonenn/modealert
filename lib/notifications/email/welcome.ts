import { Resend } from "resend";

import { buildWelcomeEmailHtml } from "./template";

import { env } from "@/lib/config/env";
import { SITE_URL } from "@/lib/constants/site";

const resend = env.RESEND_API_KEY
  ? new Resend(env.RESEND_API_KEY)
  : null;

// Fired once per real account, from both real signup paths (see
// auth.ts's createUser event and /api/auth/register). No-ops if
// Resend isn't configured, same pattern as every other email in this
// app — never blocks account creation on an email send.
export async function sendWelcomeEmail(email: string): Promise<void> {
  if (!resend) {
    return;
  }

  const onboardingUrl = `${SITE_URL}/onboarding`;

  await resend.emails.send({
    from: env.EMAIL_FROM,
    to: email,
    subject: "Welcome to ModeAlert",
    text: `You're in. ModeAlert watches limited-time modes and events across 13 games and emails you the moment one you care about goes live, ends, or changes.\n\nSet up your watchlist: ${onboardingUrl}`,
    html: buildWelcomeEmailHtml(onboardingUrl),
  });
}
