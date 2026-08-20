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
import { useI18n } from "@/components/providers/i18n-provider"

const MIN_PASSWORD_LENGTH = 8

function SignUpForm() {
  const { dict, path } = useI18n()
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
      setError(
        dict.auth.passwordMinLength.replace(
          "{min}",
          String(MIN_PASSWORD_LENGTH)
        )
      )
      return
    }

    if (password !== confirmPassword) {
      setError(dict.auth.passwordsDontMatch)
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
        setError(data.error ?? dict.auth.somethingWentWrong)
        setSubmitting(false)
        return
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(dict.auth.accountCreatedSignInFailed)
        setSubmitting(false)
        return
      }

      router.push(callbackUrl)
    } catch {
      setError(dict.auth.somethingWentWrong)
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-sm px-6 py-24">
      <div className="text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
          {dict.auth.getStarted}
        </p>

        <h1 className="mt-3 text-3xl font-bold tracking-tight">
          {dict.auth.signUpTitle}
        </h1>

        <p className="mt-2 text-sm text-zinc-400">
          {dict.auth.subtitle}
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
                {dict.auth.continueWithGoogle}
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
                {dict.auth.continueWithDiscord}
              </Button>
            )}
          </div>

          <div className="my-6 flex items-center gap-3 text-xs text-zinc-500">
            <div className="h-px flex-1 bg-white/10" />
            {dict.auth.or}
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
            placeholder={dict.auth.emailPlaceholder}
            aria-label={dict.auth.emailAriaLabel}
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
            placeholder={dict.auth.passwordPlaceholderMin}
            aria-label={dict.auth.passwordAriaLabel}
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
            placeholder={dict.auth.confirmPasswordPlaceholder}
            aria-label={dict.auth.confirmPasswordAriaLabel}
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
          {submitting ? dict.auth.creatingAccount : dict.auth.createAccount}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-zinc-400">
        {dict.auth.haveAccount}{" "}
        <Link href={path("/signin")} className="text-white hover:underline">
          {dict.auth.signInLink}
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
