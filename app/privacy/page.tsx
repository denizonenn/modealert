import type { Metadata } from "next"

import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { SectionEyebrow } from "@/components/shared/section-eyebrow"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "What ModeAlert collects, why, and how to delete it. Plain-language privacy policy — no tracking pixels, no data resale.",
}

const LAST_UPDATED = "August 13, 2026"

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <section className="mx-auto max-w-3xl px-6 pt-20 pb-4">
        <SectionEyebrow>Legal</SectionEyebrow>

        <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
          Privacy Policy
        </h1>

        <p className="mt-4 text-sm text-zinc-500">
          Last updated: {LAST_UPDATED}
        </p>
      </section>

      <section className="mx-auto max-w-3xl space-y-10 px-6 py-16 text-zinc-300">
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-white">Who we are</h2>
          <p className="leading-relaxed">
            ModeAlert (
            <a
              href="https://modealert.vercel.app"
              className="text-white underline underline-offset-4 hover:text-zinc-300"
            >
              modealert.vercel.app
            </a>
            ) is an independent, early-access project built and operated by
            Deniz Önen. This policy explains what data ModeAlert collects,
            why, and how you can remove it.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-white">
            What we collect
          </h2>
          <p className="leading-relaxed">
            ModeAlert only stores what it needs to run your watchlist and
            send the alerts you asked for:
          </p>
          <ul className="list-disc space-y-2 pl-6 leading-relaxed">
            <li>
              <span className="text-white">Account info</span> — your email
              address, and your name/profile image if you sign in with
              Google. If you sign in with a password instead, we store a
              salted hash of it, never the password itself.
            </li>
            <li>
              <span className="text-white">Watchlist</span> — the games and
              events you&apos;ve chosen to track.
            </li>
            <li>
              <span className="text-white">Notification history</span> — a
              record of the alerts we&apos;ve sent you, so you can review
              them in your dashboard.
            </li>
            <li>
              <span className="text-white">Session cookies</span> — used
              only to keep you signed in. No advertising or cross-site
              tracking cookies are set.
            </li>
            <li>
              <span className="text-white">Subscription status</span> — if
              you upgrade to Premium, we store your plan, subscription
              status, and Lemon Squeezy&apos;s customer/subscription IDs
              (opaque references, not your card details) so we can grant
              access and let you manage billing.
            </li>
          </ul>
          <p className="leading-relaxed">
            We don&apos;t use tracking pixels, third-party analytics
            scripts, or ad networks, and we don&apos;t sell or rent your
            data to anyone.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-white">
            Who we share data with
          </h2>
          <p className="leading-relaxed">
            A small number of infrastructure providers process data on our
            behalf, strictly to run the service:
          </p>
          <ul className="list-disc space-y-2 pl-6 leading-relaxed">
            <li>
              <span className="text-white">Neon</span> (Postgres database
              hosting) and <span className="text-white">Vercel</span>{" "}
              (application hosting) — store and serve the data described
              above.
            </li>
            <li>
              <span className="text-white">Resend</span> — delivers the
              email alerts you sign up for.
            </li>
            <li>
              <span className="text-white">Google</span> — only if you
              choose &ldquo;Sign in with Google&rdquo;, to authenticate
              you.
            </li>
            <li>
              <span className="text-white">Lemon Squeezy</span> — only if
              you upgrade to Premium. They&apos;re our payment processor
              and Merchant of Record, so they handle your payment details
              directly (card number, billing address) — ModeAlert never
              sees or stores them. They notify us only of your
              subscription status.
            </li>
          </ul>
          <p className="leading-relaxed">
            ModeAlert also calls public game-data APIs (Riot Games, Bungie,
            and others) to detect events, but no information about you
            personally is ever sent to them.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-white">
            Your controls
          </h2>
          <ul className="list-disc space-y-2 pl-6 leading-relaxed">
            <li>
              Every email includes a one-click unsubscribe link — no
              account login required.
            </li>
            <li>
              You can edit or clear your watchlist any time from your
              dashboard.
            </li>
            <li>
              To delete your account and all associated data, email{" "}
              <a
                href="mailto:denizate@gmail.com"
                className="text-white underline underline-offset-4 hover:text-zinc-300"
              >
                denizate@gmail.com
              </a>{" "}
              — we&apos;ll remove it within a reasonable time.
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-white">Changes</h2>
          <p className="leading-relaxed">
            ModeAlert is an early-access, actively developed product. If
            this policy changes in a meaningful way, we&apos;ll update the
            date above and, where practical, notify active users by email.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-white">Contact</h2>
          <p className="leading-relaxed">
            Questions about this policy or your data? Email{" "}
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
