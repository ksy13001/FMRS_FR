import { type NextRequest, NextResponse } from "next/server"

interface TeamDetailsDto {
  id: number
  teamName: string
  teamLogo: string
}

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("q") || ""

    if (!query || query.length < 2) {
      return NextResponse.json([])
    }

    const backendUrl = process.env.BACKEND_URL || "http://localhost:8080"
    const apiUrl = new URL(`/api/teams/search/${encodeURIComponent(query)}`, backendUrl)

    console.log(`Calling backend: ${apiUrl.toString()}`)

    const response = await fetch(apiUrl.toString(), {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(10000),
    })

    if (!response.ok) {
      console.error(`Backend response error: ${response.status} ${response.statusText}`)
      throw new Error(`Backend returned ${response.status}: ${response.statusText}`)
    }

    const data: TeamDetailsDto[] = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error("Teams API error:", error)

    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: "Failed to fetch teams",
          details: error.message,
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      )
    }

    return NextResponse.json({ error: "Failed to fetch teams" }, { status: 500 })
  }
}
