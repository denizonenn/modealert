"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { signIn, getProviders } from "next-auth/react"
import { SiGoogle, SiDiscord } from "react-icons/si"
import { Mail, Lock } from "lucide-react"

import { Navbar } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"

function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard"

  const [mode, setMode] = useState<"magic-link" | "password">("password")

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [availableProviders, setAvailableProviders] = useState<
    string[] | null
  >(null)

  useEffect(() => {
    getProviders().then((providers) =>
      setAvailableProviders(providers ? Object.keys(providers) : [])
    )
  }, [])

  const hasGoogle = availableProviders?.includes("google") ?? false
  const hasDiscord = availableProviders?.includes("discord") ?? false

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault()

    if (!email) return

    setSending(true)

    await signIn("resend", { email, callbackUrl })

    setSending(false)
  }

  async function handlePasswordSignIn(e: React.FormEvent) {
    e.preventDefault()

    setError(null)
    setSending(true)

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    setSending(false)

    if (result?.error) {
      setError("Incorrect email or password.")
      return
    }

    router.push(callbackUrl)
  }

  return (
    <div className="mx-auto max-w-sm px-6 py-24">
      <div className="text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
          Welcome back
        </p>

        <h1 className="mt-3 text-3xl font-bold tracking-tight">Sign in</h1>

        <p className="mt-2 text-sm text-zinc-400">
          Track every event that matters. No spam, ever.
        </p>
      </div>

      {(hasGoogle || hasDiscord) && (
        <>
          <div className="mt-10 flex flex-col gap-3">
            {hasGoogle && (
              <Button
                type="button"
                variant="outline"
                className="w-full justify-center gap-2 border-white/10 bg-white/5 text-white hover:bg-white/10"
                onClick={() => signIn("google", { callbackUrl })}
              >
                <SiGoogle className="h-4 w-4" />
                Continue with Google
              </Button>
            )}

            {hasDiscord && (
              <Button
                type="button"
                variant="outline"
                className="w-full justify-center gap-2 border-white/10 bg-white/5 text-white hover:bg-white/10"
                onClick={() => signIn("discord", { callbackUrl })}
              >
                <SiDiscord className="h-4 w-4" />
                Continue with Discord
              </Button>
            )}
          </div>

          <div className="my-6 flex items-center gap-3 text-xs text-zinc-500">
            <div className="h-px flex-1 bg-white/10" />
            or
            <div className="h-px flex-1 bg-white/10" />
          </div>
        </>
      )}

      {mode === "magic-link" ? (
        <form
          onSubmit={handleEmailSignIn}
          className={`flex flex-col gap-3 ${
            hasGoogle || hasDiscord ? "" : "mt-10"
          }`}
        >
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3">
            <Mail className="h-4 w-4 shrink-0 text-zinc-500" />

            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 w-full bg-transparent text-sm text-white placeholder:text-zinc-500 outline-none"
            />
          </div>

          <Button
            type="submit"
            disabled={sending}
            className="w-full justify-center bg-white text-black hover:bg-zinc-200"
          >
            {sending ? "Sending link..." : "Continue with email"}
          </Button>
        </form>
      ) : (
        <form
          onSubmit={handlePasswordSignIn}
          className={`flex flex-col gap-3 ${
            hasGoogle || hasDiscord ? "" : "mt-10"
          }`}
        >
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3">
            <Mail className="h-4 w-4 shrink-0 text-zinc-500" />

            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 w-full bg-transparent text-sm text-white placeholder:text-zinc-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3">
            <Lock className="h-4 w-4 shrink-0 text-zinc-500" />

            <input
              type="password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-10 w-full bg-transparent text-sm text-white placeholder:text-zinc-500 outline-none"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <Button
            type="submit"
            disabled={sending}
            className="w-full justify-center bg-white text-black hover:bg-zinc-200"
          >
            {sending ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      )}

      <button
        type="button"
        onClick={() =>
          setMode(mode === "magic-link" ? "password" : "magic-link")
        }
        className="mt-4 w-full text-center text-xs text-zinc-500 hover:text-white"
      >
        {mode === "magic-link"
          ? "Prefer a password instead?"
          : "Prefer an email link instead?"}
      </button>

      <p className="mt-8 text-center text-xs text-zinc-600">
        By continuing you agree to receive event notifications you signed up
        for. Unsubscribe anytime.
      </p>

      <p className="mt-4 text-center text-sm text-zinc-400">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-white hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  )
}

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <Suspense fallback={null}>
        <SignInForm />
      </Suspense>
    </main>
  )
}
