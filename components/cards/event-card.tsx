"use client";

import { Check } from "lucide-react";

import {
  EVENT_CATEGORY_LABELS,
  type EventCategory,
} from "@/lib/constants/event-category";

interface EventCardProps {
  id: string;
  name: string;
  gameName: string;
  description?: string | null;
  category?: EventCategory;
  selected: boolean;
  onClick: () => void;
}

export default function EventCard({
  name,
  gameName,
  description,
  category,
  selected,
  onClick,
}: EventCardProps) {
  return (
    <button
      onClick={onClick}
      className={`relative rounded-2xl border p-5 text-left transition hover:scale-[1.02]
      ${
        selected
          ? "border-white bg-white/10"
          : "border-white/10 bg-white/5"
      }`}
    >
      <div className="flex items-center gap-2">
        <p className="text-xs uppercase tracking-wide text-zinc-500">
          {gameName}
        </p>

        {category && (
          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
            {EVENT_CATEGORY_LABELS[category]}
          </span>
        )}
      </div>

      <h3 className="mt-1 font-semibold">{name}</h3>

      <p className="mt-2 text-sm text-zinc-400">
        {description || "No description available for this event yet."}
      </p>

      {selected && (
        <div className="absolute right-3 top-3 rounded-full bg-white p-1 text-black">
          <Check size={15} />
        </div>
      )}
    </button>
  );
}
