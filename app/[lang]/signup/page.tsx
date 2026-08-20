"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { signIn, getProviders } from "next-auth/react"
import { SiGoogle, SiDiscord } from "react-icons/si"
import { Lock, Mail } from "lucide-react"

import { Navbar } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"
import { PasswordStrength } from "@/components/ui/password-strength"

const MIN_PASSWORD_LENGTH = 8

function SignUpForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    setError(null)

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`)
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match.")
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error ?? "Something went wrong. Please try again.")
        setSubmitting(false)
        return
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Account created, but sign-in failed. Try signing in below.")
        setSubmitting(false)
        return
      }

      router.push(callbackUrl)
    } catch {
      setError("Something went wrong. Please try again.")
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-sm px-6 py-24">
      <div className="text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
          Get started
        </p>

        <h1 className="mt-3 text-3xl font-bold tracking-tight">
          Create your account
        </h1>

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

      <form
        onSubmit={handleSubmit}
        className={`flex flex-col gap-3 ${hasGoogle || hasDiscord ? "" : "mt-10"}`}
      >
        <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 transition-colors focus-within:border-white/30 focus-within:ring-2 focus-within:ring-white/15">
          <Mail className="h-4 w-4 shrink-0 text-zinc-500" />

          <input
            type="email"
            required
            placeholder="you@example.com"
            aria-label="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-10 w-full bg-transparent text-sm text-white placeholder:text-zinc-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 transition-colors focus-within:border-white/30 focus-within:ring-2 focus-within:ring-white/15">
          <Lock className="h-4 w-4 shrink-0 text-zinc-500" />

          <input
            type="password"
            required
            placeholder="Password (min. 8 characters)"
            aria-label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-10 w-full bg-transparent text-sm text-white placeholder:text-zinc-500 outline-none"
          />
        </div>

        {password.length > 0 && (
          <div className="dark rounded-lg border border-white/10 bg-white/5 px-3 py-3">
            <PasswordStrength value={password} />
          </div>
        )}

        <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 transition-colors focus-within:border-white/30 focus-within:ring-2 focus-within:ring-white/15">
          <Lock className="h-4 w-4 shrink-0 text-zinc-500" />

          <input
            type="password"
            required
            placeholder="Confirm password"
            aria-label="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="h-10 w-full bg-transparent text-sm text-white placeholder:text-zinc-500 outline-none"
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <Button
          type="submit"
          disabled={submitting}
          className="mt-2 w-full justify-center bg-white text-black hover:bg-zinc-200"
        >
          {submitting ? "Creating account..." : "Create account"}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-zinc-400">
        Already have an account?{" "}
        <Link href="/signin" className="text-white hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}

export default function SignUpPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <Suspense fallback={null}>
        <SignUpForm />
      </Suspense>
    </main>
  )
}
