"use client"

import { useEffect, useRef } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { Navbar } from "@/components/layout/navbar"
import Progress from "@/components/onboarding/progress"
import GameSelector from "@/components/onboarding/game-selector"
import EventSelector from "@/components/onboarding/event-selector"
import FinishStep from "@/components/onboarding/finish-step"
import { Button } from "@/components/ui/button"

import { useOnboardingStore } from "@/stores/onboarding-store"
import { useRequireAuth } from "@/hooks/use-require-auth"
import { useTrackEvent } from "@/hooks/use-track-event"
import { ANALYTICS_EVENTS } from "@/lib/constants/analytics-events"

const STEP_TITLES: Record<number, string> = {
  1: "Which games do you play?",
  2: "What do you want to track?",
  3: "Ready to go",
}

export default function OnboardingPage() {
  const authStatus = useRequireAuth()
  const track = useTrackEvent()

  const {
    step,
    selectedGames,
    selectedEvents,
    nextStep,
    previousStep,
  } = useOnboardingStore()

  // Answers the funnel question directly: which step do signed-up
  // users actually reach before giving up. Only fires once auth is
  // confirmed, so it never double-counts the pre-auth redirect state.
  const trackedSteps = useRef(new Set<number>())

  useEffect(() => {
    if (authStatus !== "authenticated") return
    if (trackedSteps.current.has(step)) return

    trackedSteps.current.add(step)
    track(ANALYTICS_EVENTS.ONBOARDING_STEP_VIEWED, String(step))
  }, [authStatus, step, track])

  const canContinue =
    step === 1
      ? selectedGames.length > 0
      : step === 2
      ? selectedEvents.length > 0
      : true

  if (authStatus !== "authenticated") {
    return (
      <main className="min-h-screen bg-black text-white">
        <Navbar />
      </main>
    )
  }

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
