"use client"

import { useState } from "react"
import { MessageSquarePlus } from "lucide-react"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/components/providers/i18n-provider"

const MAX_LENGTH = 2000

export function FeedbackWidget() {
  const { dict } = useI18n()
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const trimmed = message.trim()

    if (!trimmed) return

    setError(null)
    setSubmitting(true)

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error ?? dict.common.somethingWentWrong)
        return
      }

      setSent(true)
      setMessage("")
    } catch {
      setError(dict.common.somethingWentWrong)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)

        if (!next) {
          setSent(false)
          setError(null)
        }
      }}
    >
      <PopoverTrigger
        render={
          <button
            type="button"
            aria-label={dict.feedback.trigger}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-white hover:bg-white/10"
          />
        }
      >
        <MessageSquarePlus className="h-4 w-4" />
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-80 border border-white/10 bg-black p-4 text-white shadow-2xl"
      >
        {sent ? (
          <div className="py-2 text-center">
            <p className="text-sm font-medium text-white">{dict.feedback.thanks}</p>
            <p className="mt-1 text-xs text-zinc-400">
              {dict.feedback.thanksBody}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
            <p className="text-sm font-medium text-white">{dict.feedback.title}</p>
            <p className="text-xs text-zinc-500">
              {dict.feedback.hint}
            </p>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, MAX_LENGTH))}
              placeholder={dict.feedback.placeholder}
              rows={4}
              aria-label={dict.feedback.ariaLabel}
              className="w-full resize-none rounded-lg border border-white/10 bg-white/5 p-2.5 text-sm text-white placeholder:text-zinc-500 outline-none transition-colors focus:border-white/30 focus:ring-2 focus:ring-white/15"
            />

            {error && <p className="text-xs text-red-400">{error}</p>}

            <Button
              type="submit"
              disabled={submitting || !message.trim()}
              className="w-full bg-white text-black hover:bg-zinc-200"
            >
              {submitting ? dict.feedback.sending : dict.feedback.send}
            </Button>
          </form>
        )}
      </PopoverContent>
    </Popover>
  )
}
