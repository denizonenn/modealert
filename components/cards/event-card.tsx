"use client";

import { Check } from "lucide-react";

interface EventCardProps {
  id: string;
  name: string;
  gameName: string;
  description?: string | null;
  selected: boolean;
  onClick: () => void;
}

export default function EventCard({
  name,
  gameName,
  description,
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
      <p className="text-xs uppercase tracking-wide text-zinc-500">
        {gameName}
      </p>

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
