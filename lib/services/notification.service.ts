import {
  getNotificationsByUser,
  createNotification,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  reportNotificationFalsePositive,
} from "@/lib/repositories/notification.repository";

export const notificationService = {
  async getByUser(userId: string) {
    return getNotificationsByUser(userId);
  },

  async getUnread(userId: string) {
    const notifications =
      await getNotificationsByUser(userId);

    return notifications.filter(
      (notification) => !notification.read
    );
  },

  async create(data: {
    userId: string;
    eventId: string;
    title: string;
    message: string;
    channel: string;
  }) {
    return createNotification(data);
  },

  async markRead(id: string, userId: string) {
    return markNotificationRead(id, userId);
  },

  async markAllRead(userId: string) {
    return markAllNotificationsRead(userId);
  },

  async delete(id: string, userId: string) {
    return deleteNotification(id, userId);
  },

  async reportFalsePositive(id: string, userId: string) {
    return reportNotificationFalsePositive(id, userId);
  },
};