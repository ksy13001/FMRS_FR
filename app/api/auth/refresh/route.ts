import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 토큰 갱신 API 호출")

    const backendUrl = process.env.BACKEND_URL || "https://localhost:8443"
    const apiUrl = new URL("/api/auth/reissue", backendUrl)

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    }

    // 🍪 Refresh Token 쿠키 전달
    const cookieHeader = request.headers.get("cookie")
    if (cookieHeader) {
      headers.Cookie = cookieHeader
      console.log("🍪 Refresh Token 쿠키 헤더 전달")
    }

    const backendResponse = await fetch(apiUrl.toString(), {
      method: "POST",
      headers,
      signal: AbortSignal.timeout(10000),
    })

    console.log(`🔄 백엔드 응답 상태: ${backendResponse.status}`)

    if (backendResponse.ok) {
      // 🔑 Authorization 헤더에서 새 Access Token 추출
      const authHeader = backendResponse.headers.get("Authorization")
      console.log("🔑 새 Access Token 헤더:", authHeader)

      // 🍪 새 Refresh Token 쿠키 전달
      const setCookieHeaders = backendResponse.headers.getSetCookie()
      console.log("🍪 새 Refresh Token 쿠키:", setCookieHeaders)

      const response = NextResponse.json(
        {
          success: true,
          message: "Token refreshed successfully",
        },
        { status: 200 },
      )

      // 🔑 Authorization 헤더 전달 (클라이언트에서 메모리에 저장)
      if (authHeader) {
        response.headers.set("Authorization", authHeader)
      }

      // 🍪 새 Refresh Token 쿠키 전달
      setCookieHeaders.forEach((cookie) => {
        response.headers.append("Set-Cookie", cookie)
      })

      return response
    } else {
      console.log("❌ 토큰 갱신 실패")
      return NextResponse.json(
        {
          success: false,
          message: "Token refresh failed",
        },
        { status: 401 },
      )
    }
  } catch (error) {
    console.error("❌ 토큰 갱신 API 오류:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Network error during token refresh",
      },
      { status: 500 },
    )
  }
}
