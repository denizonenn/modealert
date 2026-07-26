"use client";

import { Check } from "lucide-react";

interface EventCardProps {
  id: string;
  name: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}

export default function EventCard({
  name,
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
      <h3 className="font-semibold">{name}</h3>

      <p className="mt-2 text-sm text-zinc-400">
        {description}
      </p>

      {selected && (
        <div className="absolute right-3 top-3 rounded-full bg-white p-1 text-black">
          <Check size={15} />
        </div>
      )}
    </button>
  );
}