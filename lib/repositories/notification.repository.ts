import { notifications } from "@/lib/data/mock/notifications";
import { Notification } from "@/types/notification";

export function getNotifications() {
  return notifications;
}

export function getNotificationsByUser(userId: string) {
  return notifications.filter(
    (notification: Notification) =>
      notification.userId === userId
  );
}