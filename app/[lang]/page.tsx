import { Navbar } from "@/components/layout/navbar"
import { Hero } from "@/components/landing/hero"
import { SupportedGames } from "@/components/landing/supported-games"
import { Features } from "@/components/landing/features"
import { HowItWorks } from "@/components/landing/how-it-works"
import { Faq } from "@/components/landing/faq"
import { Cta } from "@/components/landing/cta"
import { Footer } from "@/components/layout/footer"
import { SITE_URL } from "@/lib/constants/site"
import { GAMES_WITH_PROVIDER } from "@/lib/constants/games"
import { getDictionary } from "@/lib/i18n/dictionaries"

// Hero fetches real event data server-side for the dashboard preview
// widget — revalidate periodically so it doesn't go stale between
// deploys (events sync once a day, this just needs to be in that
// ballpark, not real-time).
export const revalidate = 1800

export default async function HomePage() {
  const dict = await getDictionary()

  const faqs = dict.faqPage.items.map((item) => ({
    question: item.question,
    answer: item.answer.replace(
      "{count}",
      String(GAMES_WITH_PROVIDER.size)
    ),
  }))

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "ModeAlert",
      url: SITE_URL,
      description: `ModeAlert tracks limited-time game events, modes, and battle passes across ${GAMES_WITH_PROVIDER.size} games — League of Legends, Valorant, Destiny 2, TFT, and more — and alerts you by email or Discord the moment something changes.`,
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "ModeAlert",
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Any (web-based)",
      url: SITE_URL,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    },
  ]

  return (
    <main className="min-h-screen bg-black text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Navbar />
      <Hero />
      <SupportedGames />
      <Features gameCount={GAMES_WITH_PROVIDER.size} />
      <HowItWorks />
      <Faq />
      <Cta />
      <Footer />
    </main>
  )
}
