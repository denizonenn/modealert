import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRelativeTime(
  dateInput: string | Date
): string {
  const date =
    typeof dateInput === "string"
      ? new Date(dateInput)
      : dateInput

  const diffSec = Math.floor(
    (Date.now() - date.getTime()) / 1000
  )

  if (diffSec < 60) return "just now"

  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`

  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return `${diffHour}h ago`

  const diffDay = Math.floor(diffHour / 24)
  if (diffDay < 30) return `${diffDay}d ago`

  const diffMonth = Math.floor(diffDay / 30)
  return `${diffMonth}mo ago`
}

export function formatDuration(ms: number): string {
  const days = Math.floor(ms / (1000 * 60 * 60 * 24))
  const hours = Math.floor(
    (ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  )

  if (days > 0) {
    return hours > 0 ? `${days}d ${hours}h` : `${days}d`
  }

  if (hours > 0) {
    return `${hours}h`
  }

  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
  return `${Math.max(minutes, 1)}m`
}

export function formatCount(count: number): string {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`
  }

  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1).replace(/\.0$/, "")}K`
  }

  return `${count}`
}
