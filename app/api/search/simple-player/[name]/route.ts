import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { name: string } }): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get("page") || "0"
    const size = searchParams.get("size") || "10" // 10개로 수정
    const lastPlayerId = searchParams.get("lastPlayerId")
    const lastCurrentAbility = searchParams.get("lastCurrentAbility")
    const lastMappingStatus = searchParams.get("lastMappingStatus")

    // 동적 파라미터 안전하게 추출
    const playerName = params?.name || ""

    // Build query parameters for the backend API
    const queryParams = new URLSearchParams({
      page,
      size,
    })

    // 커서 파라미터 추가
    if (lastPlayerId) queryParams.append("lastPlayerId", lastPlayerId)
    if (lastCurrentAbility) queryParams.append("lastCurrentAbility", lastCurrentAbility)
    if (lastMappingStatus) queryParams.append("lastMappingStatus", lastMappingStatus)

    const backendUrl = process.env.BACKEND_URL || "http://localhost:8080"

    // 템플릿 리터럴 대신 URL 객체 사용
    const apiUrl = new URL(`/api/search/simple-player/${encodeURIComponent(playerName)}`, backendUrl)
    apiUrl.search = queryParams.toString()

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

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Search API error:", error)

    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: "Failed to search players",
          details: error.message,
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      )
    }

    return NextResponse.json({ error: "Failed to search players" }, { status: 500 })
  }
}
