import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { getDictionary } from "@/lib/i18n/dictionaries"

export default async function DigestFeedbackPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>
}) {
  const { ok } = await searchParams
  const dict = await getDictionary()

  const success = ok === "1"

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="mx-auto max-w-sm px-6 py-24 text-center">
        {success ? (
          <>
            <h1 className="text-2xl font-bold tracking-tight">
              {dict.digestFeedback.thanksTitle}
            </h1>

            <p className="mt-2 text-sm text-zinc-400">
              {dict.digestFeedback.thanksBody}
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold tracking-tight">
              {dict.digestFeedback.invalidTitle}
            </h1>

            <p className="mt-2 text-sm text-zinc-400">
              {dict.digestFeedback.invalidBody}
            </p>
          </>
        )}
      </div>

      <Footer />
    </main>
  )
}
