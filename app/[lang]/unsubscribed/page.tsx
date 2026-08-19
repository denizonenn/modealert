import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"

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

  const success = ok === "1"
  const wasUnsubscribed = action !== "resubscribe"

  const toggleUrl =
    userId && token
      ? `/api/unsubscribe?userId=${userId}&token=${token}&action=${
          wasUnsubscribed ? "resubscribe" : "unsubscribe"
        }`
      : null

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="mx-auto max-w-sm px-6 py-24 text-center">
        {success ? (
          <>
            <h1 className="text-2xl font-bold tracking-tight">
              {wasUnsubscribed ? "You're unsubscribed" : "You're back in"}
            </h1>

            <p className="mt-2 text-sm text-zinc-400">
              {wasUnsubscribed
                ? "You won't get any more event emails from ModeAlert. Your watchlist is untouched — you'll still see updates on your dashboard."
                : "You'll get event emails again from ModeAlert."}
            </p>

            {toggleUrl && (
              <a
                href={toggleUrl}
                className="mt-6 inline-block text-sm text-white hover:underline"
              >
                {wasUnsubscribed
                  ? "Changed your mind? Resubscribe"
                  : "Unsubscribe again"}
              </a>
            )}
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold tracking-tight">
              Link expired or invalid
            </h1>

            <p className="mt-2 text-sm text-zinc-400">
              This unsubscribe link doesn&apos;t look right. Sign in and
              check your dashboard, or reply to one of our emails if you
              keep getting ones you don&apos;t want.
            </p>
          </>
        )}
      </div>

      <Footer />
    </main>
  )
}
