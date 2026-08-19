"use client"

import { useEffect } from "react"
import { AlertTriangle } from "lucide-react"

import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
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
          Something went wrong
        </h1>

        <p className="mt-2 text-sm text-zinc-400">
          That&apos;s on us, not you. Try again, or come back in a bit.
        </p>

        <Button
          onClick={reset}
          className="mt-8 bg-white text-black hover:bg-zinc-200"
        >
          Try again
        </Button>
      </div>

      <Footer />
    </main>
  )
}
