import type {
  NotificationProvider,
} from "./notification-provider";

import {
  consoleNotificationProvider,
} from "../console/console.provider";

import {
  emailNotificationProvider,
} from "../email/email.provider";

import {
  discordNotificationProvider,
} from "../discord/discord.provider";

const providers: NotificationProvider[] =
  [
    consoleNotificationProvider,
    emailNotificationProvider,
    discordNotificationProvider,
  ];

export function registerNotificationProvider(
  provider: NotificationProvider
) {
  providers.push(provider);
}

export function getNotificationProviders() {
  return providers.filter(
    (provider) => provider.enabled
  );
}