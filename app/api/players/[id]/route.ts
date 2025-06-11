import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
  try {
    const playerId = params?.id || ""

    // localhost 개발 환경 설정
    const backendUrl = process.env.BACKEND_URL || "http://localhost:8080"

    // 백엔드 API 경로 수정: /players/{id} -> /api/players/{id}
    const apiUrl = new URL(`/api/players/${playerId}`, backendUrl)

    console.log(`Calling backend: ${apiUrl.toString()}`)

    const response = await fetch(apiUrl.toString(), {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      // 개발 환경에서 timeout 설정
      signal: AbortSignal.timeout(10000), // 10초 timeout
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: "Player not found" }, { status: 404 })
      }
      console.error(`Backend response error: ${response.status} ${response.statusText}`)
      throw new Error(`Backend returned ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Player API error:", error)

    // 개발 환경에서 더 자세한 에러 정보 제공
    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: "Failed to fetch player",
          details: error.message,
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      )
    }

    return NextResponse.json({ error: "Failed to fetch player" }, { status: 500 })
  }
}
