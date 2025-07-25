import { type NextRequest, NextResponse } from "next/server"
import { createBackendUrl } from "@/lib/api-config"

// 댓글 soft delete (PATCH)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; commentId: string } }
): Promise<NextResponse> {
  try {
    const playerId = params?.id || ""
    const commentId = params?.commentId || ""
    const body = await request.json()

    console.log("🔍 Comment soft delete request - Player ID:", playerId, "Comment ID:", commentId)
    console.log("🔍 Request body:", body)
    console.log("🔍 Request headers:", Object.fromEntries(request.headers.entries()))
    console.log("🔍 Request cookies:", request.cookies.getAll())
    console.log("🔍 Params object:", params)

    // 백엔드 URL 생성
    const baseUrl = createBackendUrl(`/api/players/${playerId}/comments/${commentId}`)
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
      method: "PATCH",
      headers,
      credentials: "include",
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    })

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
      if (response.status === 403) {
        return NextResponse.json(
          { 
            success: false, 
            message: "You don't have permission to update this comment.",
            timestamp: new Date().toISOString()
          }, 
          { status: 403 }
        )
      }
      if (response.status === 404) {
        return NextResponse.json(
          { 
            success: false, 
            message: "Comment not found.",
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
  console.error("Update comment API error:", error)

  if (error instanceof Error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update comment.",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }

  return NextResponse.json(
    { 
      success: false, 
      message: "Failed to update comment.",
      timestamp: new Date().toISOString()
    }, 
      { status: 500 }
    )
  }
} 