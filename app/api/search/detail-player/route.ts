import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // 항상 ageMin과 ageMax 포함
    if (!searchParams.has("ageMin")) {
      searchParams.set("ageMin", "15")
    }
    if (!searchParams.has("ageMax")) {
      searchParams.set("ageMax", "50")
    }

    const backendUrl = process.env.BACKEND_URL || "http://localhost:8080"

    console.log(`Calling backend: ${backendUrl}/api/search/detail-player`)
    console.log("Search params:", Object.fromEntries(searchParams.entries()))

    // GET 요청으로 변경, 쿼리 파라미터 사용
    const response = await fetch(`${backendUrl}/api/search/detail-player?${searchParams.toString()}`, {
      method: "GET", // POST → GET 변경
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      // body 제거 (GET 요청이므로)
      signal: AbortSignal.timeout(15000),
    })

    if (!response.ok) {
      console.error(`Backend response error: ${response.status} ${response.statusText}`)
      throw new Error(`Backend returned ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()

    // 응답 구조 확인 및 안전하게 처리
    const safeData = {
      players: Array.isArray(data.players) ? data.players : [],
      totalElements: typeof data.totalElements === "number" ? data.totalElements : 0,
      totalPages: typeof data.totalPages === "number" ? data.totalPages : 0,
    }

    return NextResponse.json(safeData)
  } catch (error) {
    console.error("Detail search API error:", error)

    // 에러 발생 시 안전한 응답 반환
    return NextResponse.json(
      {
        players: [],
        totalElements: 0,
        totalPages: 0,
        error: error instanceof Error ? error.message : "Failed to search players",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
