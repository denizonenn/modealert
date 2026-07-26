import { getNotificationsByUser } from "@/lib/repositories/notification.repository";
import { Notification } from "@/types/notification";

export const notificationService = {
  async getByUser(userId: string) {
    return getNotificationsByUser(userId);
  },

  async getUnread(userId: string) {
    return getNotificationsByUser(userId).filter(
      (notification: Notification) => !notification.read
    );
  },
};