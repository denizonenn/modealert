export default function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-zinc-700 p-10 text-center">
      <h3 className="text-lg font-semibold">
        No notifications
      </h3>

      <p className="mt-2 text-sm text-zinc-400">
        You are all caught up. New event notifications
        will appear here.
      </p>
    </div>
  );
}