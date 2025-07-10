import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("🚪 로그아웃 API 호출")

    const backendUrl = process.env.BACKEND_URL || "http://localhost:8080"
    const apiUrl = new URL("/api/auth/logout", backendUrl)

    // 🔑 Access Token 쿠키에서 추출
    const accessToken = request.cookies.get("access_token")?.value
    console.log("🔑 Access Token:", accessToken ? "존재함" : "없음")

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

    console.log(`🚪 백엔드 호출: ${apiUrl.toString()}`)

    const backendResponse = await fetch(apiUrl.toString(), {
      method: "POST",
      headers,
      signal: AbortSignal.timeout(10000),
    })

    console.log(`🚪 백엔드 응답 상태: ${backendResponse.status}`)

    // 성공/실패 관계없이 클라이언트 쿠키 정리
    const response = NextResponse.json({ success: true, message: "Logged out" }, { status: 200 })

    // 🔑 Access Token 쿠키 삭제
    response.cookies.delete("access_token")
    console.log("🔑 Access Token 쿠키 삭제")

    // 백엔드에서 Refresh Token 쿠키 삭제 응답이 있으면 전달
    const setCookieHeaders = backendResponse.headers.get("set-cookie")
    if (setCookieHeaders) {
      console.log("🍪 Refresh Token 쿠키 삭제 전달:", setCookieHeaders)
      response.headers.set("Set-Cookie", setCookieHeaders)
    }

    return response
  } catch (error) {
    console.error("❌ 로그아웃 API 오류:", error)

    // 오류가 발생해도 클라이언트 쿠키는 정리
    const response = NextResponse.json(
      {
        success: false,
        message: "Logout error, but client cookies cleared",
      },
      { status: 500 },
    )

    response.cookies.delete("access_token")

    return response
  }
}
