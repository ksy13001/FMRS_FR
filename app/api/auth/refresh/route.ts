import { type NextRequest, NextResponse } from "next/server"

interface RefreshResponse {
  success: boolean
  message: string
}

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 토큰 갱신 API 호출")

    const backendUrl = process.env.BACKEND_URL || "http://localhost:8080"
    const apiUrl = new URL("/api/auth/reissue", backendUrl)

    // 🔑 Access Token 쿠키에서 추출
    const accessToken = request.cookies.get("access_token")?.value
    console.log("🔑 기존 Access Token:", accessToken ? "존재함" : "없음")

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    }

    // Access Token이 있으면 Authorization 헤더에 추가
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`
      console.log("🔑 Authorization 헤더 추가")
    }

    // Refresh Token 쿠키 전달을 위해 쿠키 헤더 복사
    const cookieHeader = request.headers.get("cookie")
    if (cookieHeader) {
      headers.Cookie = cookieHeader
      console.log("🍪 쿠키 헤더 전달:", cookieHeader)
    }

    console.log(`🔄 백엔드 호출: ${apiUrl.toString()}`)

    const backendResponse = await fetch(apiUrl.toString(), {
      method: "POST",
      headers,
      signal: AbortSignal.timeout(10000),
    })

    console.log(`🔄 백엔드 응답 상태: ${backendResponse.status}`)
    console.log(`🔄 백엔드 응답 헤더:`, Object.fromEntries(backendResponse.headers.entries()))

    const responseText = await backendResponse.text()
    console.log(`🔄 백엔드 응답 본문:`, responseText)

    if (backendResponse.ok) {
      let refreshData: RefreshResponse
      try {
        if (responseText.trim()) {
          refreshData = JSON.parse(responseText)
        } else {
          refreshData = { success: true, message: "Token refreshed" }
        }
      } catch {
        refreshData = { success: true, message: "Token refreshed" }
      }

      console.log("✅ 토큰 갱신 성공:", refreshData)

      // 🔧 새로운 Access Token 추출
      const newAuthHeader = backendResponse.headers.get("authorization")
      let newAccessToken: string | undefined

      if (newAuthHeader && newAuthHeader.startsWith("Bearer ")) {
        newAccessToken = newAuthHeader.substring(7)
        console.log("🔑 새로운 Access Token 추출 성공")
      }

      const response = NextResponse.json(refreshData, { status: 200 })

      // 🔧 새로운 Refresh Token 쿠키 전달
      const setCookieHeaders = backendResponse.headers.get("set-cookie")
      if (setCookieHeaders) {
        console.log("🍪 새로운 Refresh Token 쿠키 전달:", setCookieHeaders)
        response.headers.set("Set-Cookie", setCookieHeaders)
      }

      // 🔑 새로운 Access Token을 HttpOnly 쿠키로 설정
      if (newAccessToken) {
        console.log("🔑 새로운 Access Token을 HttpOnly 쿠키로 설정")
        response.cookies.set("access_token", newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 15 * 60, // 15분
        })
      }

      return response
    } else {
      console.log("❌ 토큰 갱신 실패")

      // 토큰 갱신 실패 시 Access Token 쿠키 삭제
      const response = NextResponse.json(
        {
          success: false,
          message: "Token refresh failed",
        },
        { status: 401 },
      )

      response.cookies.delete("access_token")

      return response
    }
  } catch (error) {
    console.error("❌ 토큰 갱신 API 오류:", error)

    const response = NextResponse.json(
      {
        success: false,
        message: "Network error",
      },
      { status: 500 },
    )

    // 오류 시 Access Token 쿠키 삭제
    response.cookies.delete("access_token")

    return response
  }
}
