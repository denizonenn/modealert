import { Mail } from "lucide-react"

import { Navbar } from "@/components/layout/navbar"

export default function CheckEmailPage() {
  return (
    <main id="main-content" className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="mx-auto max-w-sm px-6 py-24 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5">
          <Mail className="h-5 w-5 text-zinc-400" />
        </div>

        <h1 className="mt-6 text-2xl font-bold tracking-tight">
          Check your inbox
        </h1>

        <p className="mt-2 text-sm text-zinc-400">
          We sent you a sign-in link. Open it on this device to continue.
        </p>
      </div>
    </main>
  )
}
