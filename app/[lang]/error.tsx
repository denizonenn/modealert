"use client"

import { useEffect } from "react"
import { AlertTriangle } from "lucide-react"

import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/components/providers/i18n-provider"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { dict } = useI18n()

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="mx-auto flex max-w-sm flex-col items-center px-6 py-24 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-400/30 bg-red-500/10">
          <AlertTriangle className="h-5 w-5 text-red-400" />
        </div>

        <h1 className="mt-6 text-3xl font-bold tracking-tight">
          {dict.errorPage.title}
        </h1>

        <p className="mt-2 text-sm text-zinc-400">
          {dict.errorPage.intro}
        </p>

        <Button
          onClick={reset}
          className="mt-8 bg-white text-black hover:bg-zinc-200"
        >
          {dict.common.tryAgain}
        </Button>
      </div>

      <Footer />
    </main>
  )
}
