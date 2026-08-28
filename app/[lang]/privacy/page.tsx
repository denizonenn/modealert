import type { Metadata } from "next"

import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { SectionEyebrow } from "@/components/shared/section-eyebrow"
import { getDictionary } from "@/lib/i18n/dictionaries"
import { withBold } from "@/lib/i18n/rich-text"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "What ModeAlert collects, why, and how to delete it. Plain-language privacy policy — no tracking pixels, no data resale.",
}

export default async function PrivacyPage() {
  const dict = await getDictionary()
  const t = dict.privacyPage

  return (
    <main className="min-h-screen bg-black text-white">
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
          <h2 className="text-xl font-semibold text-white">
            {t.whoWeAreTitle}
          </h2>
          <p className="leading-relaxed">
            {t.whoWeAreBodyPre}
            <a
              href="https://modealert.vercel.app"
              className="text-white underline underline-offset-4 hover:text-zinc-300"
            >
              modealert.vercel.app
            </a>
            {t.whoWeAreBodyPost}
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-white">
            {t.whatWeCollectTitle}
          </h2>
          <p className="leading-relaxed">{t.whatWeCollectIntro}</p>
          <ul className="list-disc space-y-2 pl-6 leading-relaxed">
            {t.collectItems.map((item) => (
              <li key={item.label}>
                <span className="text-white">{item.label}</span> —{" "}
                {item.body}
              </li>
            ))}
          </ul>
          <p className="leading-relaxed">{t.noThirdPartyTrackers}</p>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-white">
            {t.whoWeShareTitle}
          </h2>
          <p className="leading-relaxed">{t.whoWeShareIntro}</p>
          <ul className="list-disc space-y-2 pl-6 leading-relaxed">
            {t.shareItems.map((item, index) => (
              <li key={index}>{withBold(item)}</li>
            ))}
          </ul>
          <p className="leading-relaxed">{t.publicApisNote}</p>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-white">
            {t.yourControlsTitle}
          </h2>
          <ul className="list-disc space-y-2 pl-6 leading-relaxed">
            {t.controlItems.map((item, index) => (
              <li key={index}>{withBold(item)}</li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-white">
            {t.changesTitle}
          </h2>
          <p className="leading-relaxed">{t.changesBody}</p>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-white">
            {t.contactTitle}
          </h2>
          <p className="leading-relaxed">
            {t.contactBodyPre}{" "}
            <a
              href="mailto:denizate@gmail.com"
              className="text-white underline underline-offset-4 hover:text-zinc-300"
            >
              denizate@gmail.com
            </a>
            {t.contactBodyPost}
          </p>
        </div>
      </section>

      <Footer />
    </main>
  )
}
