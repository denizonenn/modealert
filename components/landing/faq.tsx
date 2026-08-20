"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { SectionEyebrow } from "@/components/shared/section-eyebrow"
import { useI18n } from "@/components/providers/i18n-provider"
import { GAMES_WITH_PROVIDER } from "@/lib/constants/games"

export function Faq() {
  const { dict } = useI18n()

  const items = dict.faqPage.items.map((item) => ({
    question: item.question,
    answer: item.answer.replace(
      "{count}",
      String(GAMES_WITH_PROVIDER.size)
    ),
  }))

  return (
    <section id="faq" className="mx-auto max-w-3xl px-6 py-24">
      <div className="text-center">
        <SectionEyebrow className="justify-center">
          {dict.faqPage.eyebrow}
        </SectionEyebrow>

        <h2 className="mt-4 text-4xl font-bold tracking-tight">
          {dict.faqPage.title}
        </h2>
      </div>

      <Accordion className="mt-12">
        {items.map((item) => (
          <AccordionItem
            key={item.question}
            value={item.question}
            className="border-white/10"
          >
            <AccordionTrigger className="py-5 text-base text-white hover:no-underline">
              {item.question}
            </AccordionTrigger>

            <AccordionContent className="pb-5 text-zinc-400">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}
