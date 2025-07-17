import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("query") || ""

    // Mock data for now
    const teams = [
      { id: 1, name: "Manchester United", league: "Premier League" },
      { id: 2, name: "Barcelona", league: "La Liga" },
      { id: 3, name: "Bayern Munich", league: "Bundesliga" },
    ]

    const filteredTeams = teams.filter((team) => team.name.toLowerCase().includes(query.toLowerCase()))

    return NextResponse.json({
      success: true,
      data: filteredTeams,
      total: filteredTeams.length,
    })
  } catch (error) {
    console.error("Teams API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
