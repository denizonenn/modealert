"use client"

import Link from "next/link"

import { useI18n } from "@/components/providers/i18n-provider"

export function Footer() {
  const { dict, path } = useI18n()

  // feed.xml is deliberately not locale-prefixed — it's a
  // machine-readable feed with one canonical URL that RSS readers
  // already hold (see proxy.ts's UNPREFIXED_PATHS).
  const links = [
    { href: path("/status"), label: dict.footer.status },
    { href: path("/statistics"), label: dict.footer.statistics },
    { href: "/feed.xml", label: dict.footer.rss },
    { href: path("/privacy"), label: dict.footer.privacy },
    { href: path("/terms"), label: dict.footer.terms },
  ]

  return (
    <footer className="border-t border-white/10 bg-black/60">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-zinc-500 md:flex-row md:items-center">
        <p>{dict.footer.builtBy}</p>
        <div className="md:ml-auto flex items-center gap-6">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-white">
              {link.label}
            </Link>
          ))}
          <a
            href="https://github.com/denizonenn/modealert"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white"
          >
            {dict.footer.github}
          </a>
        </div>
      </div>
    </footer>
  )
}
