import Link from "next/link"
import { Compass } from "lucide-react"

import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import KineticGrid from "@/components/ui/kinetic-grid"
import { getDictionary, getLocale } from "@/lib/i18n/dictionaries"

export default async function NotFound() {
  const dict = await getDictionary()
  const locale = await getLocale()

  return (
    <KineticGrid globalColor="monochrome" className="text-white">
      <Navbar />

      <div className="mx-auto flex max-w-sm flex-col items-center px-6 py-24 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
          <Compass className="h-5 w-5 text-zinc-400" />
        </div>

        <h1 className="mt-6 text-3xl font-bold tracking-tight">
          {dict.notFoundPage.title}
        </h1>

        <p className="mt-2 text-sm text-zinc-400">
          {dict.notFoundPage.intro}
        </p>

        <Link href={`/${locale}`} className="mt-8">
          <Button className="bg-white text-black hover:bg-zinc-200">
            {dict.notFoundPage.backToHomepage}
          </Button>
        </Link>
      </div>

      <Footer />
    </KineticGrid>
  )
}
