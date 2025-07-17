import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("query") || ""

    // Mock data for teams
    const teams = [
      { id: 1, name: "Manchester City", league: "Premier League", country: "England" },
      { id: 2, name: "Real Madrid", league: "La Liga", country: "Spain" },
      { id: 3, name: "Bayern Munich", league: "Bundesliga", country: "Germany" },
      { id: 4, name: "Paris Saint-Germain", league: "Ligue 1", country: "France" },
      { id: 5, name: "Juventus", league: "Serie A", country: "Italy" },
    ]

    const filteredTeams = query
      ? teams.filter(
          (team) =>
            team.name.toLowerCase().includes(query.toLowerCase()) ||
            team.league.toLowerCase().includes(query.toLowerCase()) ||
            team.country.toLowerCase().includes(query.toLowerCase()),
        )
      : teams

    return NextResponse.json({
      success: true,
      data: filteredTeams,
      total: filteredTeams.length,
    })
  } catch (error) {
    console.error("Teams API error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch teams" }, { status: 500 })
  }
}
