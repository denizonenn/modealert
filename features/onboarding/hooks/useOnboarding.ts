"use client"

import { useState } from "react"

export function useOnboarding() {
  const [selectedGames, setSelectedGames] = useState<string[]>([])

  function toggleGame(id: string) {
    setSelectedGames((prev) =>
      prev.includes(id)
        ? prev.filter((g) => g !== id)
        : [...prev, id]
    )
  }

  return {
    selectedGames,
    toggleGame,
  }
}