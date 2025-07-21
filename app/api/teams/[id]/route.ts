import { type NextRequest, NextResponse } from "next/server"

interface TeamDetailsDto {
  id: number
  teamName: string
  teamLogo: string
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
  try {
    const teamId = params?.id || ""

    if (!teamId || isNaN(Number(teamId))) {
      return NextResponse.json({ error: "Invalid team ID" }, { status: 400 })
    }

    const backendUrl = process.env.BACKEND_URL || "http://localhost:8080"
    const apiUrl = new URL(`/api/teams/${teamId}`, backendUrl)

    const response = await fetch(apiUrl.toString(), {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(10000),
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: "Team not found" }, { status: 404 })
      }
      console.error(`Backend response error: ${response.status} ${response.statusText}`)
      throw new Error(`Backend returned ${response.status}: ${response.statusText}`)
    }

    const data: TeamDetailsDto = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Team API error:", error)

    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: "Failed to fetch team",
          details: error.message,
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      )
    }

    return NextResponse.json({ error: "Failed to fetch team" }, { status: 500 })
  }
}
