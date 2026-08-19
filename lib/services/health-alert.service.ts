import { Resend } from "resend";

import { getRecentHealthChecks } from "@/lib/repositories/provider-health-check.repository";
import { buildAdminAlertHtml } from "@/lib/notifications/email/template";
import { env } from "@/lib/config/env";
import { logger } from "@/lib/logger/logger";

const resend = env.RESEND_API_KEY
  ? new Resend(env.RESEND_API_KEY)
  : null;

const ADMIN_RECIPIENTS = env.ADMIN_EMAILS
  .split(",")
  .map((email) => email.trim())
  .filter(Boolean);

interface HealthCheckLike {
  healthy: boolean;
  error?: string | null;
}

// Every sync is once a day, so "unhealthy on today's check and
// yesterday's" already means at least ~24h down — the bus-factor risk
// named directly in the product's own readiness memo (see
// docs/06_DECISIONS.md ADR-046). Pure and separately testable so the
// "only once per incident, not every day it stays down" logic can be
// checked without a database.
export function justCrossedIntoOutage(
  mostRecentFirst: HealthCheckLike[]
): boolean {
  const [latest, previous, beforeThat] = mostRecentFirst;

  return Boolean(
    latest && !latest.healthy &&
    previous && !previous.healthy &&
    (!beforeThat || beforeThat.healthy)
  );
}

export async function checkAndAlert(providerId: string, providerName: string) {
  if (!resend || ADMIN_RECIPIENTS.length === 0) {
    return;
  }

  const recent = await getRecentHealthChecks(providerId, 3);

  if (!justCrossedIntoOutage(recent)) {
    return;
  }

  const latestError = recent[0]?.error ?? "unknown";

  // Best-effort — a broken alert email must never mask or replace the
  // real sync error the caller is about to re-throw.
  try {
    await resend.emails.send({
      from: env.EMAIL_FROM,
      to: ADMIN_RECIPIENTS,
      subject: `[ModeAlert] ${providerName} has been unhealthy for 2+ syncs`,
      text: `${providerName} failed its last two syncs in a row (most recent error: ${latestError}). Check /status or /admin.`,
      html: buildAdminAlertHtml(
        `${providerName} looks down`,
        `Failed its last two syncs in a row. Most recent error: ${latestError}. Check /status or /admin for details.`
      ),
    });
  } catch (error) {
    logger.error("Failed to send provider outage alert email", {
      providerId,
      providerName,
      error:
        error instanceof Error
          ? error.message
          : "Unknown error",
    });
  }
}
