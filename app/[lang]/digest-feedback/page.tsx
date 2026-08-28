import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"

export default async function DigestFeedbackPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>
}) {
  const { ok } = await searchParams

  const success = ok === "1"

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="mx-auto max-w-sm px-6 py-24 text-center">
        {success ? (
          <>
            <h1 className="text-2xl font-bold tracking-tight">
              Thanks for the feedback
            </h1>

            <p className="mt-2 text-sm text-zinc-400">
              That helps us figure out what&apos;s actually useful in the
              digest.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold tracking-tight">
              Link expired or invalid
            </h1>

            <p className="mt-2 text-sm text-zinc-400">
              This feedback link doesn&apos;t look right — no worries,
              nothing was recorded.
            </p>
          </>
        )}
      </div>

      <Footer />
    </main>
  )
}
