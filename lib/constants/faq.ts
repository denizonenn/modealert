import { GAMES_WITH_PROVIDER } from "@/lib/constants/games"

export const FAQS = [
  {
    question: "How often does ModeAlert check for updates?",
    answer:
      "Automatically, once a day — you never have to refresh a page or check a launcher yourself.",
  },
  {
    question: "Which games are supported?",
    answer: `${GAMES_WITH_PROVIDER.size} games today — League of Legends, Valorant, Destiny 2, TFT, Fortnite, Warframe, Path of Exile, Helldivers 2, Foxhole, PUBG, and PlanetSide 2 — with more added as new tracking sources come online.`,
  },
  {
    question: "Is ModeAlert free?",
    answer:
      "Yes — the Free plan tracks up to 5 events with email alerts, no credit card required. Premium ($4.99/mo) adds unlimited tracked events and per-event predictions.",
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
