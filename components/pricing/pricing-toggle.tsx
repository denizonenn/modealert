"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { CheckoutLink } from "@/components/pricing/checkout-link"
import { cn } from "@/lib/utils"
import {
  BILLING_INTERVALS,
  PREMIUM_MONTHLY_PRICE_USD,
  PREMIUM_YEARLY_PRICE_USD,
  PREMIUM_LIFETIME_PRICE_USD,
  type BillingInterval,
} from "@/lib/constants/plan"

interface PricingToggleProps {
  isPremium: boolean
  signInHref: string | null
  checkoutUrls: Record<BillingInterval, string | null>
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
  checkoutUrls,
  labels,
}: PricingToggleProps) {
  const [interval, setInterval] = useState<BillingInterval>(
    BILLING_INTERVALS.MONTHLY
  )

  const isYearly = interval === BILLING_INTERVALS.YEARLY
  const isLifetime = interval === BILLING_INTERVALS.LIFETIME
  const checkoutUrl = checkoutUrls[interval]

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

  return (
    <div>
      <div className="inline-flex flex-wrap rounded-full border border-white/10 bg-black/30 p-1 text-sm">
        {TABS.map((tab) => (
          <button
            key={tab.interval}
            type="button"
            onClick={() => setInterval(tab.interval)}
            className={cn(
              "rounded-full px-3 py-1 transition-colors",
              interval === tab.interval
                ? "bg-white/15 text-white"
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
        ) : checkoutUrl ? (
          <CheckoutLink href={checkoutUrl} source="pricing-page">
            <Button className="mt-6 w-full bg-gradient-brand text-white shadow-[0_0_30px_rgba(168,85,247,0.35)] hover:shadow-[0_0_40px_rgba(168,85,247,0.5)]">
              {isLifetime ? labels.buyLifetime : labels.upgradeToPremium}
            </Button>
          </CheckoutLink>
        ) : (
          <p className="mt-6 text-center text-xs text-zinc-500">
            {labels.upgradesNotLive}
          </p>
        )}
      </div>
    </div>
  )
}
