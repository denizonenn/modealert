"use client";

import { Check } from "lucide-react";

import { ONBOARDING_STEPS } from "@/constants/onboarding";
import { useOnboardingStore } from "@/stores/onboarding-store";

export default function Progress() {
  const { step } = useOnboardingStore();

  return (
    <div className="mb-14 flex items-center justify-center">
      {ONBOARDING_STEPS.map((item, index) => (
        <div key={item.id} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition ${
                step > item.id
                  ? "bg-gradient-brand text-white"
                  : step === item.id
                  ? "bg-gradient-brand text-white shadow-[0_0_20px_rgba(168,85,247,0.5)]"
                  : "border border-zinc-700 text-zinc-500"
              }`}
            >
              {step > item.id ? <Check size={16} /> : item.id}
            </div>

            <span className="mt-2 text-sm text-zinc-400">
              {item.title}
            </span>
          </div>

          {index < ONBOARDING_STEPS.length - 1 && (
            <div
              className={`mx-4 mb-6 h-px w-16 transition ${
                step > item.id ? "bg-gradient-brand" : "bg-white/10"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
