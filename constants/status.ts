import { EventStatus } from "@/types/status";

export const STATUS = {
  LIVE: {
    label: "Live",
    className: "bg-green-500/20 text-green-400",
  },

  UPCOMING: {
    label: "Upcoming",
    className: "bg-yellow-500/20 text-yellow-400",
  },

  TRACKING: {
    label: "Tracking",
    className: "bg-blue-500/20 text-blue-400",
  },

  ENDED: {
    label: "Ended",
    className: "bg-zinc-500/20 text-zinc-400",
  },
} satisfies Record<
  EventStatus,
  {
    label: string;
    className: string;
  }
>;