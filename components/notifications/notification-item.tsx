"use client";

import { Flag, Mail } from "lucide-react";
import { SiDiscord } from "react-icons/si";

interface Props {
  title: string;
  message: string;
  channel: string;
  read: boolean;
  createdAt: string;
  falsePositiveReportedAt?: string | null;
  onMarkRead?: () => void;
  onReportFalsePositive?: () => void;
}

// A user with both Email and Discord on gets two rows for the same
// event change, one per channel (see Notification.channel) — without
// a label they read as unexplained duplicates. Falls back to the raw
// channel id for any future channel that doesn't have a mapped icon
// yet, instead of silently showing nothing.
const CHANNEL_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  email: { label: "Email", icon: <Mail className="h-3 w-3" /> },
  discord: { label: "Discord", icon: <SiDiscord className="h-3 w-3" /> },
};

export default function NotificationItem({
  title,
  message,
  channel,
  read,
  createdAt,
  falsePositiveReportedAt,
  onMarkRead,
  onReportFalsePositive,
}: Props) {
  const isReported = Boolean(falsePositiveReportedAt);
  const channelInfo = CHANNEL_LABELS[channel] ?? { label: channel, icon: null };

  return (
    <div
      className={`w-full rounded-xl border p-4 text-left transition ${
        read
          ? "border-white/10 bg-white/5"
          : "border-purple-400/30 bg-purple-500/10 hover:border-purple-400/50"
      }`}
    >
      <button
        type="button"
        onClick={onMarkRead}
        disabled={read || !onMarkRead}
        className={`w-full text-left ${
          !read && onMarkRead ? "cursor-pointer" : "cursor-default"
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-semibold">{title}</h3>

          {!read && (
            <span className="h-2 w-2 shrink-0 rounded-full bg-gradient-brand" />
          )}
        </div>

        <p className="mt-1 text-sm text-zinc-400">{message}</p>

        <p className="mt-2 flex items-center gap-2 text-xs text-zinc-500">
          {new Date(createdAt).toLocaleString()}

          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5">
            {channelInfo.icon}
            {channelInfo.label}
          </span>
        </p>
      </button>

      {onReportFalsePositive && (
        <button
          type="button"
          onClick={onReportFalsePositive}
          disabled={isReported}
          className={`mt-2 inline-flex items-center gap-1 text-xs transition ${
            isReported
              ? "cursor-default text-zinc-600"
              : "cursor-pointer text-zinc-500 hover:text-red-400"
          }`}
        >
          <Flag className="h-3 w-3" />
          {isReported
            ? "Reported as wrong"
            : "This was wrong"}
        </button>
      )}
    </div>
  );
}
