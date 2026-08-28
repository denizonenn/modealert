"use client";

import { useI18n } from "@/components/providers/i18n-provider";

export default function EmptyState() {
  const { dict } = useI18n();

  return (
    <div className="rounded-xl border border-dashed border-white/10 p-8 text-center">
      <h3 className="text-sm font-semibold">
        {dict.notifications.emptyTitle}
      </h3>

      <p className="mt-1 text-xs text-zinc-500">
        {dict.notifications.emptyBody}
      </p>
    </div>
  );
}
