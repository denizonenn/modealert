"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { SectionEyebrow } from "@/components/shared/section-eyebrow"
import { FAQS } from "@/lib/constants/faq"

export function Faq() {
  return (
    <section id="faq" className="mx-auto max-w-3xl px-6 py-24">
      <div className="text-center">
        <SectionEyebrow className="justify-center">
          FAQ
        </SectionEyebrow>

        <h2 className="mt-4 text-4xl font-bold tracking-tight">
          Questions, answered.
        </h2>
      </div>

      <Accordion className="mt-12">
        {FAQS.map((item) => (
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
