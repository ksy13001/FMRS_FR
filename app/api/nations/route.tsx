import { type NextRequest, NextResponse } from "next/server"

interface NationDto {
  nationName: string
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:8080"
    const apiUrl = new URL("/api/nations", backendUrl)

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

    const data: NationDto[] = await response.json()

    // 국가명으로 정렬
    const sortedData = data.sort((a, b) => a.nationName.localeCompare(b.nationName))

    return NextResponse.json(sortedData)
  } catch (error) {
    console.error("Nations API error:", error)

    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: "Failed to fetch nations",
          details: error.message,
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      )
    }

    return NextResponse.json({ error: "Failed to fetch nations" }, { status: 500 })
  }
}
