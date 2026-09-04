import type { Metadata } from "next"

import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { SectionEyebrow } from "@/components/shared/section-eyebrow"
import { getDictionary, getLocale } from "@/lib/i18n/dictionaries"
import { withBold } from "@/lib/i18n/rich-text"
import { localeAlternates } from "@/lib/i18n/alternates"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()

  return {
    title: "Terms of Service",
    description:
      "The terms for using ModeAlert — a free-to-start game event tracker with an optional Premium plan.",
    alternates: localeAlternates(locale, "/terms"),
  }
}

export default async function TermsPage() {
  const dict = await getDictionary()
  const t = dict.termsPage

  return (
    <main id="main-content" className="min-h-screen bg-black text-white">
      <Navbar />

      <section className="mx-auto max-w-3xl px-6 pt-20 pb-4">
        <SectionEyebrow>{t.eyebrow}</SectionEyebrow>

        <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
          {t.title}
        </h1>

        <p className="mt-4 text-sm text-zinc-500">{t.lastUpdated}</p>
      </section>

      <section className="mx-auto max-w-3xl space-y-10 px-6 py-16 text-zinc-300">
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-white">{t.s1Title}</h2>
          <p className="leading-relaxed">
            {t.s1BodyPre}
            <a
              href="https://modealert.vercel.app"
              className="text-white underline underline-offset-4 hover:text-zinc-300"
            >
              modealert.vercel.app
            </a>
            {t.s1BodyPost}
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-white">{t.s2Title}</h2>
          <p className="leading-relaxed">{t.s2Body}</p>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-white">{t.s3Title}</h2>
          <p className="leading-relaxed">{withBold(t.s3Body)}</p>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-white">{t.s4Title}</h2>
          <p className="leading-relaxed">{withBold(t.s4Body)}</p>
          <ul className="list-disc space-y-2 pl-6 leading-relaxed">
            <li>{withBold(t.s4Item1)}</li>
            <li>
              {t.s4Item2Pre}{" "}
              <a
                href="mailto:denizate@gmail.com"
                className="text-white underline underline-offset-4 hover:text-zinc-300"
              >
                denizate@gmail.com
              </a>{" "}
              {t.s4Item2Post}
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-white">{t.s5Title}</h2>
          <ul className="list-disc space-y-2 pl-6 leading-relaxed">
            {t.s5Items.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-white">{t.s6Title}</h2>
          <p className="leading-relaxed">{t.s6Body}</p>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-white">{t.s7Title}</h2>
          <p className="leading-relaxed">{t.s7Body}</p>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-white">{t.s8Title}</h2>
          <p className="leading-relaxed">{t.s8Body}</p>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-white">{t.s9Title}</h2>
          <p className="leading-relaxed">
            {t.s9BodyPre}{" "}
            <a
              href="mailto:denizate@gmail.com"
              className="text-white underline underline-offset-4 hover:text-zinc-300"
            >
              denizate@gmail.com
            </a>
            {t.s9BodyPost}
          </p>
        </div>
      </section>

      <Footer />
    </main>
  )
}
