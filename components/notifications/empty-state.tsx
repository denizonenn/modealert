export default function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-white/10 p-8 text-center">
      <h3 className="text-sm font-semibold">
        No notifications
      </h3>

      <p className="mt-1 text-xs text-zinc-500">
        You are all caught up. New event notifications
        will appear here.
      </p>
    </div>
  );
}
