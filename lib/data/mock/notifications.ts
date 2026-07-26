import { Notification } from "@/types/notification";

export const notifications: Notification[] = [
  {
    id: "1",
    userId: "demo",
    eventId: "urf",

    title: "URF is Live",

    message: "League of Legends URF is now available.",

    channel: "email",

    read: false,

    createdAt: new Date().toISOString(),
  },

  {
    id: "2",
    userId: "demo",
    eventId: "night-market",

    title: "Night Market is Back",

    message: "Valorant Night Market has returned.",

    channel: "email",

    read: true,

    createdAt: new Date().toISOString(),
  },
];