import { Resend } from "resend";

import { buildWelcomeEmailHtml } from "./template";

import { env } from "@/lib/config/env";
import { SITE_URL } from "@/lib/constants/site";
import { GAMES_WITH_PROVIDER } from "@/lib/constants/games";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { getDictionaryFor } from "@/lib/i18n/load-dictionary";

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

  // No User.locale yet — the account was just created. Read the same
  // browsing-language cookie the site itself was showing this visitor
  // a moment ago, so the very first email lands in the language they
  // were already reading, not a hardcoded default.
  const locale = await getRequestLocale();
  const dict = await getDictionaryFor(locale);
  const t = dict.welcomeEmail;

  const onboardingUrl = `${SITE_URL}/${locale}/onboarding`;
  const intro = t.intro.replace(
    "{count}",
    String(GAMES_WITH_PROVIDER.size)
  );

  await resend.emails.send({
    from: env.EMAIL_FROM,
    to: email,
    subject: t.subject,
    text: `${t.title} ${intro}\n\n${t.cta}: ${onboardingUrl}`,
    html: buildWelcomeEmailHtml(onboardingUrl, {
      eyebrow: t.eyebrow,
      title: t.title,
      intro,
      cta: t.cta,
      footer: t.footer,
    }),
  });
}
