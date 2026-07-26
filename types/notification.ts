export interface Notification {
  id: string;

  userId: string;

  eventId: string;

  title: string;

  message: string;

  channel: "email" | "push";

  read: boolean;

  createdAt: string;
}