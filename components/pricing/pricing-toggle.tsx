"use client"

import { useEffect, useState } from "react"
import { initializePaddle, type Paddle } from "@paddle/paddle-js"

import { Button } from "@/components/ui/button"
import { useTrackEvent } from "@/hooks/use-track-event"
import { ANALYTICS_EVENTS } from "@/lib/constants/analytics-events"
import { cn } from "@/lib/utils"
import {
  BILLING_INTERVALS,
  PREMIUM_MONTHLY_PRICE_USD,
  PREMIUM_YEARLY_PRICE_USD,
  PREMIUM_LIFETIME_PRICE_USD,
  type BillingInterval,
} from "@/lib/constants/plan"
import type { CheckoutOptions } from "@/lib/services/billing.service"
import type { Locale } from "@/lib/i18n/config"

interface PricingToggleProps {
  isPremium: boolean
  signInHref: string | null
  // null when checkout isn't configured (or the visitor is signed out).
  checkout: CheckoutOptions | null
  // Locale-prefixed path Paddle sends the buyer to after paying. Only
  // UX — Premium itself is granted by the webhook, never the redirect.
  successPath: string
  locale: Locale
  labels: {
    monthly: string
    yearly: string
    lifetime: string
    perMonth: string
    perYear: string
    oneTime: string
    yearlySavings: string
    youreOnPremium: string
    signInToUpgrade: string
    upgradeToPremium: string
    buyLifetime: string
    upgradesNotLive: string
    upgradesNotLiveHint: string
    billingIntervalLabel: string
  }
}

const TABS: { interval: BillingInterval; labelKey: "monthly" | "yearly" | "lifetime" }[] = [
  { interval: BILLING_INTERVALS.MONTHLY, labelKey: "monthly" },
  { interval: BILLING_INTERVALS.YEARLY, labelKey: "yearly" },
  { interval: BILLING_INTERVALS.LIFETIME, labelKey: "lifetime" },
]

export function PricingToggle({
  isPremium,
  signInHref,
  checkout,
  successPath,
  locale,
  labels,
}: PricingToggleProps) {
  const [interval, setInterval] = useState<BillingInterval>(
    BILLING_INTERVALS.MONTHLY
  )
  const [paddle, setPaddle] = useState<Paddle | null>(null)
  const [paddleFailed, setPaddleFailed] = useState(false)
  const track = useTrackEvent()

  const token = checkout?.token
  const environment = checkout?.environment

  // Paddle.js is only loaded for a signed-in, non-Premium visitor who
  // can actually buy — nobody else needs the third-party script.
  useEffect(() => {
    if (!token || !environment || isPremium) {
      return
    }

    let cancelled = false

    initializePaddle({ token, environment })
      .then((instance) => {
        if (cancelled) return
        if (instance) {
          setPaddle(instance)
        } else {
          setPaddleFailed(true)
        }
      })
      .catch(() => {
        if (!cancelled) setPaddleFailed(true)
      })

    return () => {
      cancelled = true
    }
  }, [token, environment, isPremium])

  const isYearly = interval === BILLING_INTERVALS.YEARLY
  const isLifetime = interval === BILLING_INTERVALS.LIFETIME
  const priceId = checkout?.priceIds[interval] ?? null

  const price = isLifetime
    ? PREMIUM_LIFETIME_PRICE_USD
    : isYearly
      ? PREMIUM_YEARLY_PRICE_USD
      : PREMIUM_MONTHLY_PRICE_USD

  const priceSuffix = isLifetime
    ? labels.oneTime
    : isYearly
      ? labels.perYear
      : labels.perMonth

  function openCheckout() {
    if (!paddle || !checkout || !priceId) return

    track(ANALYTICS_EVENTS.CHECKOUT_CLICKED, `pricing-page:${interval}`)

    paddle.Checkout.open({
      items: [{ priceId, quantity: 1 }],
      customer: { email: checkout.email },
      // Comes back on the transaction and subscription webhooks — how
      // the server knows which ModeAlert account to credit.
      customData: { user_id: checkout.userId },
      settings: {
        displayMode: "overlay",
        variant: "one-page",
        locale,
        allowLogout: false,
        successUrl: `${window.location.origin}${successPath}`,
      },
    })
  }

  const canBuy = checkout !== null && priceId !== null && !paddleFailed

  return (
    <div>
      <div
        role="tablist"
        aria-label={labels.billingIntervalLabel}
        className="inline-flex flex-wrap rounded-full border border-white/10 bg-black/30 p-1 text-sm"
      >
        {TABS.map((tab) => (
          <button
            key={tab.interval}
            type="button"
            role="tab"
            aria-selected={interval === tab.interval}
            onClick={() => setInterval(tab.interval)}
            className={cn(
              "rounded-full px-3 py-1 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
              interval === tab.interval
                ? "bg-white/15 font-semibold text-white"
                : "text-zinc-400"
            )}
          >
            {labels[tab.labelKey]}
          </button>
        ))}
      </div>

      <p className="mt-4">
        <span className="text-3xl font-bold">${price}</span>
        <span className="text-base font-normal text-zinc-400">
          {" "}
          {priceSuffix}
        </span>
      </p>

      {isYearly && (
        <p className="mt-1 text-sm text-emerald-400">{labels.yearlySavings}</p>
      )}

      <div>
        {isPremium ? (
          <div className="mt-6 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-center text-sm font-medium text-emerald-300">
            {labels.youreOnPremium}
          </div>
        ) : signInHref ? (
          <a href={signInHref}>
            <Button className="mt-6 w-full bg-gradient-brand text-white shadow-[0_0_30px_rgba(168,85,247,0.35)] hover:shadow-[0_0_40px_rgba(168,85,247,0.5)]">
              {labels.signInToUpgrade}
            </Button>
          </a>
        ) : canBuy ? (
          <Button
            type="button"
            onClick={openCheckout}
            disabled={!paddle}
            aria-busy={!paddle}
            className="mt-6 w-full bg-gradient-brand text-white shadow-[0_0_30px_rgba(168,85,247,0.35)] hover:shadow-[0_0_40px_rgba(168,85,247,0.5)]"
          >
            {isLifetime ? labels.buyLifetime : labels.upgradeToPremium}
          </Button>
        ) : (
          <div className="mt-6 rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-center">
            <p className="text-sm text-zinc-300">{labels.upgradesNotLive}</p>
            <p className="mt-1.5 text-sm text-zinc-400">
              {labels.upgradesNotLiveHint}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
