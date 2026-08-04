"use client"

import { AnimatePresence, motion } from "framer-motion"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { Navbar } from "@/components/layout/navbar"
import Progress from "@/components/onboarding/progress"
import GameSelector from "@/components/onboarding/game-selector"
import EventSelector from "@/components/onboarding/event-selector"
import FinishStep from "@/components/onboarding/finish-step"
import { Button } from "@/components/ui/button"

import { useOnboardingStore } from "@/stores/onboarding-store"

const STEP_TITLES: Record<number, string> = {
  1: "Which games do you play?",
  2: "What do you want to track?",
  3: "Ready to go",
}

export default function OnboardingPage() {
  const {
    step,
    selectedGames,
    selectedEvents,
    nextStep,
    previousStep,
  } = useOnboardingStore()

  const canContinue =
    step === 1
      ? selectedGames.length > 0
      : step === 2
      ? selectedEvents.length > 0
      : true

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
            Get Started
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            {STEP_TITLES[step]}
          </h1>
        </div>

        <Progress />

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            {step === 1 && <GameSelector />}
            {step === 2 && <EventSelector />}
            {step === 3 && <FinishStep />}
          </motion.div>
        </AnimatePresence>

        {step < 3 && (
          <div className="mt-12 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={previousStep}
              disabled={step === 1}
              className="border border-white/10 text-white hover:bg-white/10 disabled:opacity-30"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            <Button
              onClick={nextStep}
              disabled={!canContinue}
              className="rounded-full bg-gradient-brand px-8 text-white disabled:opacity-40"
            >
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="mt-8 flex justify-center">
            <Button
              variant="ghost"
              onClick={previousStep}
              className="border border-white/10 text-white hover:bg-white/10"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>
        )}
      </div>
    </main>
  )
}
