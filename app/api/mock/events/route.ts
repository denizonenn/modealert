import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json([
    {
      id: 1,
      game: "League of Legends",
      event: "URF",
      status: "offline",
      tracking: 14281,
    },
    {
      id: 2,
      game: "Valorant",
      event: "Night Market",
      status: "live",
      tracking: 8832,
    },
    {
      id: 3,
      game: "Steam",
      event: "Summer Sale",
      status: "offline",
      tracking: 23421,
    },
  ])
}