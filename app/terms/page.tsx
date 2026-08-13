import type { Metadata } from "next"

import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { SectionEyebrow } from "@/components/shared/section-eyebrow"

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms for using ModeAlert — a free-to-start game event tracker with an optional Premium plan.",
}

const LAST_UPDATED = "August 13, 2026"

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <section className="mx-auto max-w-3xl px-6 pt-20 pb-4">
        <SectionEyebrow>Legal</SectionEyebrow>

        <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
          Terms of Service
        </h1>

        <p className="mt-4 text-sm text-zinc-500">
          Last updated: {LAST_UPDATED}
        </p>
      </section>

      <section className="mx-auto max-w-3xl space-y-10 px-6 py-16 text-zinc-300">
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-white">
            1. What ModeAlert is
          </h2>
          <p className="leading-relaxed">
            ModeAlert (
            <a
              href="https://modealert.vercel.app"
              className="text-white underline underline-offset-4 hover:text-zinc-300"
            >
              modealert.vercel.app
            </a>
            ) is an independent, early-access project, built and operated
            by Deniz Önen, that watches public data from game publishers
            and sends you an email when a game mode or event you&apos;re
            tracking changes. By creating an account or using the site,
            you agree to these terms.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-white">
            2. Not affiliated with any game publisher
          </h2>
          <p className="leading-relaxed">
            ModeAlert is an independent, unofficial tool. It is not
            endorsed by, affiliated with, or sponsored by Riot Games,
            Bungie, Epic Games, Digital Extremes, Grinding Gear Games,
            Arrowhead Game Studios, Siege Camp/Clapfoot, or any other
            publisher whose public data it reads. All game names, logos,
            and trademarks belong to their respective owners.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-white">
            3. Free and Premium plans — no guarantees
          </h2>
          <p className="leading-relaxed">
            ModeAlert&apos;s Free plan is provided{" "}
            <span className="text-white">as-is</span>, without warranty of
            any kind, and Premium doesn&apos;t change that. Event detection
            depends entirely on third-party APIs we don&apos;t control —
            they can change, rate-limit, or go offline without notice,
            which can delay or prevent an alert. We do our best to keep
            data accurate and timely, but we can&apos;t guarantee
            you&apos;ll be notified of every event, or that notifications
            will always be on time.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-white">
            4. Premium billing
          </h2>
          <p className="leading-relaxed">
            Premium is $4.99/month, billed monthly until you cancel.
            Payments are processed by{" "}
            <span className="text-white">Lemon Squeezy</span>, our
            Merchant of Record — Lemon Squeezy handles your payment
            details directly and is the merchant on your card statement;
            ModeAlert never sees or stores your card number.
          </p>
          <ul className="list-disc space-y-2 pl-6 leading-relaxed">
            <li>
              You can cancel anytime from{" "}
              <span className="text-white">Dashboard → Settings</span> —
              you keep Premium access until the end of the period you
              already paid for, then the account reverts to Free (your
              data isn&apos;t deleted, tracking above the Free limit just
              pauses).
            </li>
            <li>
              Not happy with Premium? Email{" "}
              <a
                href="mailto:denizate@gmail.com"
                className="text-white underline underline-offset-4 hover:text-zinc-300"
              >
                denizate@gmail.com
              </a>{" "}
              within 7 days of being charged for a full refund, no
              questions asked.
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-white">
            5. Your account
          </h2>
          <ul className="list-disc space-y-2 pl-6 leading-relaxed">
            <li>
              You&apos;re responsible for keeping your login credentials
              secure.
            </li>
            <li>
              You agree to use ModeAlert only for its intended purpose —
              tracking game events for yourself — and not to abuse,
              scrape, or overload the service.
            </li>
            <li>
              We may suspend or remove accounts that abuse the service or
              violate these terms.
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-white">
            6. Changes to the service
          </h2>
          <p className="leading-relaxed">
            ModeAlert is actively developed and may change features,
            supported games, or pricing over time. Existing Free
            functionality won&apos;t be removed retroactively without
            reasonable notice.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-white">
            7. Limitation of liability
          </h2>
          <p className="leading-relaxed">
            To the extent permitted by law, ModeAlert and its operator
            aren&apos;t liable for any indirect, incidental, or
            consequential damages arising from your use of, or inability
            to use, the service — including a missed or late notification
            about a game event.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-white">
            8. Changes to these terms
          </h2>
          <p className="leading-relaxed">
            We may update these terms as the product evolves. If a change
            is significant, we&apos;ll update the date above and, where
            practical, notify active users by email.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-white">9. Contact</h2>
          <p className="leading-relaxed">
            Questions about these terms? Email{" "}
            <a
              href="mailto:denizate@gmail.com"
              className="text-white underline underline-offset-4 hover:text-zinc-300"
            >
              denizate@gmail.com
            </a>
            .
          </p>
        </div>
      </section>

      <Footer />
    </main>
  )
}
