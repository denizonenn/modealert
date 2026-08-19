import { Resend } from "resend";

import { getDigestRecipients } from "@/lib/repositories/user.repository";
import { buildDigestHtml } from "@/lib/notifications/email/digest-template";
import { createUnsubscribeToken } from "@/lib/notifications/email/unsubscribe-token";
import { env } from "@/lib/config/env";
import { SITE_URL } from "@/lib/constants/site";
import { logger } from "@/lib/logger/logger";
import { checkRateLimit } from "@/lib/security/rate-limit";

// "At most one digest per user per 6 days" is literally a rate limit,
// so this reuses the existing Postgres-backed limiter rather than
// adding a table for it. 6 days, not 7: the guard must not still be
// active when next Monday's run comes around, but must comfortably
// cover same-day repeats.
const DIGEST_ONCE_PER_MS = 6 * 24 * 60 * 60 * 1000;

const resend = env.RESEND_API_KEY
  ? new Resend(env.RESEND_API_KEY)
  : null;

// The retention gap named directly in the product's own readiness
// memo (docs/06_DECISIONS.md ADR-046): nothing brings a user back
// except an alert actually firing. This is the first re-engagement
// mechanic — a real, current snapshot of what they're tracking, sent
// once a week (piggybacked on the existing daily sync cron rather
// than a second Vercel cron entry, see weeklyDigestService.shouldRunToday).
export const weeklyDigestService = {
  // Monday, so it lands at the same time as the week's first sync —
  // arbitrary but consistent; not tied to any real weekly game reset.
  shouldRunToday(now: Date): boolean {
    return now.getUTCDay() === 1;
  },

  async sendDigests() {
    if (!resend) {
      return { sent: 0, skipped: 0 };
    }

    const recipients = await getDigestRecipients();

    let sent = 0;
    let skipped = 0;

    for (const recipient of recipients) {
      const entries = recipient.watchlists.map((w) => ({
        title: w.event.title,
        status: w.event.status,
        gameName: w.event.game.name,
        url: w.event.slug
          ? `${SITE_URL}/events/${w.event.slug}`
          : undefined,
      }));

      if (entries.length === 0) {
        skipped++;
        continue;
      }

      // Without this, any second run of the daily cron on a Monday
      // sends every user a duplicate digest — and there are real ways
      // that happens: Vercel Cron retries a non-2xx response, and the
      // endpoint can be triggered manually with CRON_SECRET (which is
      // exactly how this gap was found, 2026-08-19). Claimed per user
      // rather than once globally so a run that dies halfway through
      // still delivers to the users it hadn't reached yet on retry.
      const notYetSentThisWeek = await checkRateLimit({
        key: `weekly-digest:${recipient.id}`,
        limit: 1,
        windowMs: DIGEST_ONCE_PER_MS,
      });

      if (!notYetSentThisWeek) {
        skipped++;
        continue;
      }

      const unsubscribeToken = createUnsubscribeToken(recipient.id);
      const unsubscribeUrl = `${SITE_URL}/api/unsubscribe?userId=${recipient.id}&token=${unsubscribeToken}`;

      try {
        await resend.emails.send({
          from: env.EMAIL_FROM,
          to: recipient.email,
          subject: "Your ModeAlert weekly digest",
          text: entries
            .map((e) => `${e.gameName}: ${e.title} — ${e.status}`)
            .join("\n"),
          html: buildDigestHtml(entries, unsubscribeUrl),
        });

        sent++;
      } catch (error) {
        // One recipient's failure shouldn't stop the rest — same
        // per-recipient isolation as notification-trigger.service.ts.
        logger.error("Failed to send weekly digest", {
          userId: recipient.id,
          error:
            error instanceof Error
              ? error.message
              : "Unknown error",
        });
        skipped++;
      }
    }

    return { sent, skipped };
  },
};
