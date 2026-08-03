import type {
  NotificationProvider,
} from "./notification-provider";

import {
  consoleNotificationProvider,
} from "../console/console.provider";

const providers: NotificationProvider[] =
  [
    consoleNotificationProvider,
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