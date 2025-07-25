import { type NextRequest, NextResponse } from "next/server"
import { createBackendUrl } from "@/lib/api-config"

// 댓글 목록 조회 (GET)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const playerId = params?.id || ""
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "0")
    const size = Math.min(parseInt(searchParams.get("size") || "10"), 50)

    // 백엔드 URL 생성
    const baseUrl = createBackendUrl(`/api/players/${playerId}/comments`)
    const apiUrl = new URL(baseUrl)
    apiUrl.searchParams.set("page", page.toString())
    apiUrl.searchParams.set("size", size.toString())

    console.log("🔗 Backend URL:", apiUrl.toString())

    // 쿠키 헤더 복사 (조회는 인증이 필요하지 않지만 일관성을 위해)
    const cookieHeader = request.headers.get("cookie")
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    }
    
    if (cookieHeader) {
      headers.Cookie = cookieHeader
    }

    const response = await fetch(apiUrl.toString(), {
      headers,
      signal: AbortSignal.timeout(10000),
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { 
            success: false, 
            message: "Player not found.",
            timestamp: new Date().toISOString()
          }, 
          { status: 404 }
        )
      }
      console.error(`Backend response error: ${response.status} ${response.statusText}`)
      throw new Error(`Backend returned ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Comments API error:", error)

    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to load comments.",
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      )
    }

    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to load comments.",
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    )
  }
}

// 댓글 작성 (POST)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const playerId = params?.id || ""
    const body = await request.json()

    console.log("Comment creation request - Player ID:", playerId)
    console.log("Request body:", body)
    console.log("Request headers:", Object.fromEntries(request.headers.entries()))
    console.log("Request cookies:", request.cookies.getAll())

    // 백엔드 URL 생성
    const baseUrl = createBackendUrl(`/api/players/${playerId}/comments`)
    const apiUrl = new URL(baseUrl)

    console.log("🔗 Backend URL:", apiUrl.toString())

    // 쿠키 헤더 복사
    const cookieHeader = request.headers.get("cookie")
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    }
    
    if (cookieHeader) {
      headers.Cookie = cookieHeader
      console.log("🍪 쿠키 헤더 전달:", cookieHeader)
    } else {
      console.log("⚠️ 쿠키 헤더 없음")
    }

    const response = await fetch(apiUrl.toString(), {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    })

    console.log("Backend response status:", response.status)
    console.log("Backend response headers:", Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json(
          { 
            success: false, 
            message: "Login required.",
            timestamp: new Date().toISOString()
          }, 
          { status: 401 }
        )
      }
      if (response.status === 404) {
        return NextResponse.json(
          { 
            success: false, 
            message: "Player not found.",
            timestamp: new Date().toISOString()
          }, 
          { status: 404 }
        )
      }
      if (response.status === 400) {
        const errorData = await response.json()
        return NextResponse.json(
          { 
            success: false, 
            message: errorData.message || "Invalid request.",
            timestamp: new Date().toISOString()
          }, 
          { status: 400 }
        )
      }
      console.error(`Backend response error: ${response.status} ${response.statusText}`)
      throw new Error(`Backend returned ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Create comment API error:", error)

    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to create comment.",
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      )
    }

    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to create comment.",
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    )
  }
} 