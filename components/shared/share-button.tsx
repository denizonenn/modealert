"use client"

import { useState } from "react"
import { Check, Share2 } from "lucide-react"

interface ShareButtonProps {
  url: string
  title: string
  labels: {
    share: string
    copied: string
  }
}

export function ShareButton({ url, title, labels }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url })
      } catch {
        // User cancelled or the share sheet failed — no fallback needed,
        // falling through to clipboard copy here would surprise a user
        // who deliberately dismissed the native share sheet.
      }
      return
    }

    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard access blocked — nothing more we can do silently.
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300 transition-colors hover:border-white/20 hover:text-white"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5" />
      ) : (
        <Share2 className="h-3.5 w-3.5" />
      )}
      {copied ? labels.copied : labels.share}
    </button>
  )
}
