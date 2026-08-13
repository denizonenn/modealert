import { z } from "zod";

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
