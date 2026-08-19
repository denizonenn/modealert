import type { Metadata } from "next"
import Link from "next/link"
import { Check } from "lucide-react"

import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { SectionEyebrow } from "@/components/shared/section-eyebrow"
import { CheckoutLink } from "@/components/pricing/checkout-link"

import { auth } from "@/auth"
import { billingService } from "@/lib/services/billing.service"
import { PLANS } from "@/lib/constants/plan"
import { FREE_WATCHLIST_LIMIT } from "@/lib/constants/plan"

export const metadata: Metadata = {
  title: "Pricing",
  description: `ModeAlert is free to start — track up to ${FREE_WATCHLIST_LIMIT} events with email and Discord alerts. Upgrade to Premium for unlimited tracking and per-event predictions.`,
}

const FREE_FEATURES = [
  `Track up to ${FREE_WATCHLIST_LIMIT} events`,
  "Email and Discord alerts on status changes",
  "Live status across every supported game",
]

const PREMIUM_FEATURES = [
  "Unlimited tracked events",
  "Per-event predictions — estimated end date, average duration, when a mode typically comes back",
  "Everything in Free",
]

export default async function PricingPage() {
  const session = await auth()
  const userId = session?.user?.id

  const plan = await billingService.getPlan(userId)
  const isPremium = plan === PLANS.PREMIUM

  const billing = userId
    ? await billingService.getBillingInfo(userId)
    : null

  const checkoutUrl =
    userId && billing
      ? billingService.getCheckoutUrl(userId, billing.email)
      : null

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <section className="mx-auto max-w-4xl px-6 pt-20 pb-4 text-center">
        <SectionEyebrow className="justify-center">Pricing</SectionEyebrow>

        <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
          Simple, low-friction pricing.
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-lg text-zinc-400">
          Start free. Upgrade only if you&apos;re tracking more than a
          handful of events or want ModeAlert&apos;s per-event
          predictions.
        </p>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-16">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
            <h2 className="text-lg font-semibold">Free</h2>
            <p className="mt-2">
              <span className="text-3xl font-bold">$0</span>
            </p>

            <ul className="mt-6 space-y-3 text-sm text-zinc-300">
              {FREE_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  {feature}
                </li>
              ))}
            </ul>

            {!session && (
              <Link href="/onboarding">
                <Button
                  variant="outline"
                  className="mt-8 w-full border-white/15 bg-white/5 text-white hover:bg-white/10"
                >
                  Get started
                </Button>
              </Link>
            )}
          </div>

          <div className="relative rounded-2xl border border-white/20 bg-gradient-to-b from-white/10 to-white/5 p-8">
            <span className="absolute -top-3 left-8 rounded-full bg-gradient-brand px-3 py-1 text-xs font-semibold text-white">
              Premium
            </span>

            <h2 className="text-lg font-semibold">Premium</h2>
            <p className="mt-2">
              <span className="text-3xl font-bold">$4.99</span>
              <span className="text-base font-normal text-zinc-400">
                {" "}
                / month
              </span>
            </p>

            <ul className="mt-6 space-y-3 text-sm text-zinc-300">
              {PREMIUM_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  {feature}
                </li>
              ))}
            </ul>

            {isPremium ? (
              <div className="mt-8 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-center text-sm font-medium text-emerald-300">
                You&apos;re on Premium
              </div>
            ) : !session ? (
              <Link href="/signin?callbackUrl=/pricing">
                <Button className="mt-8 w-full bg-gradient-brand text-white shadow-[0_0_30px_rgba(168,85,247,0.35)] hover:shadow-[0_0_40px_rgba(168,85,247,0.5)]">
                  Sign in to upgrade
                </Button>
              </Link>
            ) : checkoutUrl ? (
              <CheckoutLink href={checkoutUrl} source="pricing-page">
                <Button className="mt-8 w-full bg-gradient-brand text-white shadow-[0_0_30px_rgba(168,85,247,0.35)] hover:shadow-[0_0_40px_rgba(168,85,247,0.5)]">
                  Upgrade to Premium
                </Button>
              </CheckoutLink>
            ) : (
              <p className="mt-8 text-center text-xs text-zinc-500">
                Upgrades aren&apos;t live yet — check back soon.
              </p>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
