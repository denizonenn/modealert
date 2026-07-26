"use client";

import { ONBOARDING_STEPS } from "@/constants/onboarding";
import { useOnboardingStore } from "@/stores/onboarding-store";

export default function Progress() {
  const { step } = useOnboardingStore();

  return (
    <div className="mb-14 flex items-center justify-center gap-8">
      {ONBOARDING_STEPS.map((item) => (
        <div key={item.id} className="flex flex-col items-center">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full border transition ${
              step >= item.id
                ? "border-white bg-white text-black"
                : "border-zinc-700 text-zinc-500"
            }`}
          >
            {item.id}
          </div>

          <span className="mt-2 text-sm">{item.title}</span>
        </div>
      ))}
    </div>
  );
}