import type { Metadata } from "next"
import Link from "next/link"

import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { SectionEyebrow } from "@/components/shared/section-eyebrow"
import { getDictionary, getLocale } from "@/lib/i18n/dictionaries"
import { withBold } from "@/lib/i18n/rich-text"
import { localeAlternates } from "@/lib/i18n/alternates"
import { SUPPORT_EMAIL } from "@/lib/constants/site"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()

  return {
    title: "Refund Policy",
    description:
      "ModeAlert's refund policy for Premium — cancel anytime, or get a full refund within 7 days of being charged.",
    alternates: localeAlternates(locale, "/refunds"),
  }
}

// A standalone page mirroring the "Premium billing" section of /terms
// (same dictionary strings, no new translations needed) — some payment
// providers' verification checks expect a dedicated refund-policy URL
// rather than an anchor into the full terms. See docs/06_DECISIONS.md
// ADR-066.
export default async function RefundsPage() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()])
  const t = dict.termsPage

  return (
    <main id="main-content" className="min-h-screen bg-black text-white">
      <Navbar />

      <section className="mx-auto max-w-3xl px-6 pt-20 pb-4">
        <SectionEyebrow>{t.eyebrow}</SectionEyebrow>

        <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
          {dict.footer.refunds}
        </h1>

        <p className="mt-4 text-sm text-zinc-500">{t.lastUpdated}</p>
      </section>

      <section className="mx-auto max-w-3xl space-y-6 px-6 py-16 text-zinc-300">
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-white">{t.s4Title}</h2>
          <p className="leading-relaxed">{withBold(t.s4Body)}</p>
          <ul className="list-disc space-y-2 pl-5 leading-relaxed">
            <li>{withBold(t.s4Item1)}</li>
            <li>
              {t.s4Item2Pre}{" "}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="text-white underline underline-offset-4 hover:text-zinc-300"
              >
                {SUPPORT_EMAIL}
              </a>
              {t.s4Item2Post}
            </li>
          </ul>
        </div>

        <p className="text-sm text-zinc-500">
          <Link
            href={`/${locale}/terms`}
            className="text-white underline underline-offset-4 hover:text-zinc-300"
          >
            {t.title}
          </Link>
        </p>
      </section>

      <Footer />
    </main>
  )
}
