"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useSession } from "next-auth/react"

export function useRequireAuth() {
  const { status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(
        `/signin?callbackUrl=${encodeURIComponent(pathname)}`
      )
    }
  }, [status, pathname, router])

  return status
}
