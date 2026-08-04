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
