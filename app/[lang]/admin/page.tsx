import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { SectionEyebrow } from "@/components/shared/section-eyebrow"

import { ManualSyncPanel } from "@/components/admin/manual-sync-panel"
import { AdminProviderStatus } from "@/components/admin/admin-provider-status"
import { FunnelPanel } from "@/components/admin/funnel-panel"
import { AnonymousFunnelPanel } from "@/components/admin/anonymous-funnel-panel"
import { FeedbackPanel } from "@/components/admin/feedback-panel"
import { ApiKeysPanel } from "@/components/admin/api-keys-panel"

import { auth } from "@/auth"
import { isAdminEmail } from "@/lib/auth/is-admin"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function AdminPage() {
  const session = await auth()

  if (!isAdminEmail(session?.user?.email)) {
    notFound()
  }

  return (
    <main id="main-content" className="min-h-screen bg-black text-white">
      <Navbar />

      <section className="mx-auto max-w-3xl px-6 py-16">
        <SectionEyebrow>Admin</SectionEyebrow>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">
          Ops
        </h1>
        <p className="mt-4 text-sm text-zinc-400">
          Not public — only visible to admin accounts. No cache layer and no
          data-rebuild tooling exist yet, so those aren&apos;t here; syncing
          is idempotent and safe to run anytime.
        </p>

        <div className="mt-10 space-y-6">
          <ManualSyncPanel />
          <AdminProviderStatus />
          <FunnelPanel />
          <AnonymousFunnelPanel />
          <FeedbackPanel />
          <ApiKeysPanel />
        </div>
      </section>

      <Footer />
    </main>
  )
}
