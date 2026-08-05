import { Navbar } from "@/components/layout/navbar"
import { Hero } from "@/components/landing/hero"
import { SupportedGames } from "@/components/landing/supported-games"
import { Features } from "@/components/landing/features"
import { HowItWorks } from "@/components/landing/how-it-works"
import { Faq } from "@/components/landing/faq"
import { Cta } from "@/components/landing/cta"
import { Footer } from "@/components/layout/footer"
import { FAQS } from "@/lib/constants/faq"
import { SITE_URL } from "@/lib/constants/site"

// Hero fetches real event data server-side for the dashboard preview
// widget — revalidate periodically so it doesn't go stale between
// deploys (events sync once a day, this just needs to be in that
// ballpark, not real-time).
export const revalidate = 1800

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ModeAlert",
    url: SITE_URL,
    description:
      "ModeAlert tracks limited-time game events, modes, and battle passes across League of Legends, Valorant, and Destiny 2, and emails you the moment something changes.",
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
    mainEntity: FAQS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  },
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Navbar />
      <Hero />
      <SupportedGames />
      <Features />
      <HowItWorks />
      <Faq />
      <Cta />
      <Footer />
    </main>
  )
}
