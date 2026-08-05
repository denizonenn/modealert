"use client";

interface Props {
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  onMarkRead?: () => void;
}

export default function NotificationItem({
  title,
  message,
  read,
  createdAt,
  onMarkRead,
}: Props) {
  return (
    <button
      type="button"
      onClick={onMarkRead}
      disabled={read || !onMarkRead}
      className={`w-full rounded-xl border p-4 text-left transition ${
        read
          ? "border-white/10 bg-white/5"
          : "border-purple-400/30 bg-purple-500/10 hover:border-purple-400/50"
      } ${!read && onMarkRead ? "cursor-pointer" : "cursor-default"}`}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold">{title}</h3>

        {!read && (
          <span className="h-2 w-2 shrink-0 rounded-full bg-gradient-brand" />
        )}
      </div>

      <p className="mt-1 text-sm text-zinc-400">
        {message}
      </p>

      <p className="mt-2 text-xs text-zinc-500">
        {new Date(createdAt).toLocaleString()}
      </p>
    </button>
  );
}
