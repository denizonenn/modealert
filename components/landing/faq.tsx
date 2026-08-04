"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const FAQS = [
  {
    question: "How often does ModeAlert check for updates?",
    answer:
      "Automatically, around the clock — you never have to refresh a page or check a launcher yourself.",
  },
  {
    question: "Which games are supported?",
    answer:
      "League of Legends, Valorant, and Fortnite today, with more games added as new tracking sources come online.",
  },
  {
    question: "Is ModeAlert free?",
    answer:
      "Yes. ModeAlert is free during early access — no credit card required to start tracking.",
  },
  {
    question: "How do you detect events before Riot announces them?",
    answer:
      "We compare live game data against Riot's public test environment (PBE), which usually receives new content days or weeks before it goes live — giving you the earliest signal available.",
  },
  {
    question: "Do I need to install anything?",
    answer:
      "No. ModeAlert is entirely web-based — no client, no browser extension, no background app.",
  },
  {
    question: "How will I be notified?",
    answer:
      "Email today. Discord and Telegram are on the roadmap.",
  },
]

export function Faq() {
  return (
    <section id="faq" className="mx-auto max-w-3xl px-6 py-24">
      <div className="text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
          FAQ
        </p>

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
