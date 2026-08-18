import { ImageResponse } from "next/og"

import { GAMES_WITH_PROVIDER } from "@/lib/constants/games"

export const alt = "ModeAlert — Never miss a limited-time game event"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#000000",
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(168,85,247,0.35), transparent 55%), radial-gradient(circle at 80% 80%, rgba(59,130,246,0.35), transparent 55%)",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 96,
            fontWeight: 700,
            letterSpacing: -2,
            backgroundImage:
              "linear-gradient(90deg, #c084fc, #d946ef, #3b82f6)",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          ModeAlert
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 36,
            color: "#a1a1aa",
            maxWidth: 880,
            textAlign: "center",
          }}
        >
          Never miss a limited-time game event again
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 40,
            fontSize: 24,
            color: "#71717a",
          }}
        >
          {GAMES_WITH_PROVIDER.size} games, one inbox
        </div>
      </div>
    ),
    { ...size }
  )
}
