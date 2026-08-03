"use client";

interface Props {
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationItem({
  title,
  message,
  read,
  createdAt,
}: Props) {
  return (
    <div
      className={`rounded-xl border p-4 transition ${
        read
          ? "border-zinc-800 bg-zinc-900/50"
          : "border-blue-500/40 bg-blue-500/10"
      }`}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{title}</h3>

        {!read && (
          <span className="rounded-full bg-blue-500 px-2 py-1 text-xs">
            New
          </span>
        )}
      </div>

      <p className="mt-2 text-sm text-zinc-400">
        {message}
      </p>

      <p className="mt-3 text-xs text-zinc-500">
        {new Date(createdAt).toLocaleString()}
      </p>
    </div>
  );
}