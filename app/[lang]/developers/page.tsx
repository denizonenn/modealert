import type { Metadata } from "next"

import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { SectionEyebrow } from "@/components/shared/section-eyebrow"
import { getLocale } from "@/lib/i18n/dictionaries"
import { localeAlternates } from "@/lib/i18n/alternates"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()

  return {
    title: "ModeAlert API — Developers",
    description:
      "Read-only REST API for normalized game event and mode status across 15+ games. Currently invite-only.",
    alternates: localeAlternates(locale, "/developers"),
  }
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-300">
      <code>{children}</code>
    </pre>
  )
}

function Endpoint({
  method,
  path,
  description,
}: {
  method: string
  path: string
  description: string
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-white/10 py-4 last:border-none">
      <div className="flex items-center gap-3 font-mono text-sm">
        <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-emerald-400">
          {method}
        </span>
        <span className="text-zinc-200">{path}</span>
      </div>
      <p className="text-sm text-zinc-400">{description}</p>
    </div>
  )
}

export default async function DevelopersPage() {
  return (
    <main id="main-content" className="min-h-screen bg-black text-white">
      <Navbar />

      <section className="mx-auto max-w-3xl px-6 pt-20 pb-4">
        <SectionEyebrow>Developers</SectionEyebrow>

        <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
          ModeAlert API
        </h1>

        <p className="mt-5 text-lg text-zinc-400">
          Read-only REST API for normalized game event and mode status
          across 15+ games — URF/Arena rotations, season passes, item
          shops, platform status, and more, in one consistent shape
          instead of building a scraper per game.
        </p>
      </section>

      <section className="mx-auto max-w-3xl space-y-12 px-6 py-16">
        <div>
          <h2 className="text-xl font-semibold">Access</h2>
          <p className="mt-3 text-zinc-400">
            The API is currently invite-only while pricing is finalized.
            Email{" "}
            <a
              href="mailto:denizate@gmail.com?subject=ModeAlert%20API%20access"
              className="text-white underline underline-offset-4"
            >
              denizate@gmail.com
            </a>{" "}
            with what you&apos;re building and you&apos;ll get a key manually.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">Authentication</h2>
          <p className="mt-3 text-zinc-400">
            Pass your key as a bearer token on every request:
          </p>
          <div className="mt-3">
            <CodeBlock>{`curl https://modealert.vercel.app/api/v1/events \\
  -H "Authorization: Bearer mdlrt_live_..."`}</CodeBlock>
          </div>
          <p className="mt-3 text-sm text-zinc-500">
            300 requests / hour per key. Requests over the limit return
            429.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">Endpoints</h2>
          <div className="mt-3 rounded-xl border border-white/10 bg-white/5 px-4">
            <Endpoint
              method="GET"
              path="/api/v1/games"
              description="Every supported game — id, slug, name, logo, color."
            />
            <Endpoint
              method="GET"
              path="/api/v1/events"
              description="Current events. Filter with ?game=<slug>&category=<PLAYABLE|SEASON_PASS|ROTATION_MILESTONE|COSMETIC_SHOP|PLATFORM_STATUS>&status=<LIVE|UPCOMING|TRACKING|ENDED>&limitedTime=<true|false>. Paginate with ?limit=&offset=."
            />
            <Endpoint
              method="GET"
              path="/api/v1/events/:slug"
              description="A single event's current status."
            />
            <Endpoint
              method="GET"
              path="/api/v1/events/:slug/history"
              description="Every recorded LIVE/TRACKING window for this event (or its full recurring series, when one exists)."
            />
            <Endpoint
              method="GET"
              path="/api/v1/events/:slug/statistics"
              description="Appearance count, average duration, first/last seen — computed from history."
            />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold">Example</h2>
          <div className="mt-3">
            <CodeBlock>{`curl "https://modealert.vercel.app/api/v1/events?game=league-of-legends&limitedTime=true" \\
  -H "Authorization: Bearer mdlrt_live_..."`}</CodeBlock>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
