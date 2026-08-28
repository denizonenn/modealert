import { z } from "zod";

import { ANALYTICS_EVENTS } from "@/lib/constants/analytics-events";
import { ANONYMOUS_FUNNEL_EVENTS } from "@/lib/constants/anonymous-funnel-events";
import { LOCALES } from "@/lib/i18n/config";

const MIN_PASSWORD_LENGTH = 8;

export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(MIN_PASSWORD_LENGTH),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().optional(),
  newPassword: z.string().min(MIN_PASSWORD_LENGTH),
});

export const emailOptOutSchema = z.object({
  emailOptOut: z.boolean(),
});

export const profileSchema = z.object({
  name: z.string().trim().min(1).max(50),
});

// Empty string clears the webhook (disconnects Discord notifications)
// — everything else must be a real Discord webhook URL, checked
// against Discord's own documented URL shape so a pasted mistake
// (e.g. the channel URL instead of the webhook URL) fails validation
// immediately instead of silently never delivering.
export const feedbackSchema = z.object({
  message: z.string().trim().min(1).max(2000),
});

export const discordWebhookSchema = z.object({
  discordWebhookUrl: z
    .string()
    .trim()
    .refine(
      (value) =>
        value === "" ||
        /^https:\/\/(discord|discordapp)\.com\/api\/webhooks\/\d+\/[\w-]+$/.test(
          value
        ),
      "Must be a real Discord webhook URL (or empty to disconnect)."
    ),
});

export const notificationActionSchema = z.object({
  id: z.string().min(1).optional(),
  falsePositive: z.boolean().optional(),
});

export const notificationIdSchema = z.object({
  id: z.string().min(1),
});

export const watchlistEventSchema = z.object({
  eventId: z.string().min(1),
});

export const gameWatchlistSchema = z.object({
  gameId: z.string().min(1),
});

export const analyticsEventSchema = z.object({
  name: z.enum(
    Object.values(ANALYTICS_EVENTS) as [string, ...string[]]
  ),
  detail: z.string().max(200).optional(),
});

export const anonymousFunnelEventSchema = z.object({
  name: z.enum(
    Object.values(ANONYMOUS_FUNNEL_EVENTS) as [string, ...string[]]
  ),
});

export const localeSchema = z.object({
  locale: z.enum(LOCALES as unknown as [string, ...string[]]),
});

export const lemonSqueezyWebhookSchema = z.object({
  meta: z.object({
    event_name: z.string(),
    custom_data: z
      .object({ user_id: z.string().optional() })
      .optional(),
  }),
  data: z.object({
    id: z.string(),
    attributes: z.object({
      status: z.string(),
      customer_id: z.number(),
      renews_at: z.string().nullable(),
    }),
  }),
});
