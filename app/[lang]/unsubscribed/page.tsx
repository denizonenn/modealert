import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { getDictionary } from "@/lib/i18n/dictionaries"

export default async function UnsubscribedPage({
  searchParams,
}: {
  searchParams: Promise<{
    ok?: string
    action?: string
    userId?: string
    token?: string
  }>
}) {
  const { ok, action, userId, token } = await searchParams
  const dict = await getDictionary()

  const success = ok === "1"
  const wasUnsubscribed = action !== "resubscribe"

  const toggleUrl =
    userId && token
      ? `/api/unsubscribe?userId=${userId}&token=${token}&action=${
          wasUnsubscribed ? "resubscribe" : "unsubscribe"
        }`
      : null

  return (
    <main id="main-content" className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="mx-auto max-w-sm px-6 py-24 text-center">
        {success ? (
          <>
            <h1 className="text-2xl font-bold tracking-tight">
              {wasUnsubscribed
                ? dict.unsubscribed.unsubscribedTitle
                : dict.unsubscribed.resubscribedTitle}
            </h1>

            <p className="mt-2 text-sm text-zinc-400">
              {wasUnsubscribed
                ? dict.unsubscribed.unsubscribedBody
                : dict.unsubscribed.resubscribedBody}
            </p>

            {toggleUrl && (
              <a
                href={toggleUrl}
                className="mt-6 inline-block text-sm text-white hover:underline"
              >
                {wasUnsubscribed
                  ? dict.unsubscribed.resubscribeLink
                  : dict.unsubscribed.unsubscribeAgainLink}
              </a>
            )}
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold tracking-tight">
              {dict.unsubscribed.invalidTitle}
            </h1>

            <p className="mt-2 text-sm text-zinc-400">
              {dict.unsubscribed.invalidBody}
            </p>
          </>
        )}
      </div>

      <Footer />
    </main>
  )
}
