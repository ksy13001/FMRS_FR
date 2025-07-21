import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("🔐 프론트엔드 로그인 API 호출")

    const body = await request.json()
    const backendUrl = process.env.BACKEND_URL || "https://localhost:8443"
    const apiUrl = new URL("/api/auth/login", backendUrl)

    const backendResponse = await fetch(apiUrl.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    })

    console.log(`🔐 백엔드 응답 상태: ${backendResponse.status}`)

    const responseText = await backendResponse.text()

    if (backendResponse.ok) {
      const backendData = JSON.parse(responseText)
      // 🔑 Authorization 헤더에서 Access Token 추출
      const authHeader = backendResponse.headers.get("Authorization")
      let accessToken = null
      if (authHeader && authHeader.startsWith("Bearer ")) {
        accessToken = authHeader.substring(7)
      }
      // 🍪 Set-Cookie 헤더에서 Refresh Token 쿠키 전달
      const setCookieHeaders = backendResponse.headers.getSetCookie()
      const frontendResponse = NextResponse.json({
        success: backendData.success,
        message: backendData.message,
        user: {
          id: backendData.userId,
          username: backendData.username,
        },
      })
      // 🍪 Refresh Token 쿠키 전달
      setCookieHeaders.forEach((cookie) => {
        frontendResponse.headers.append("Set-Cookie", cookie)
      })
      // 🍪 Access Token을 HttpOnly, Secure, SameSite=None 쿠키로 설정
      if (accessToken) {
        frontendResponse.cookies.set("access_token", accessToken, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          path: "/",
          maxAge: 60 * 30, // 30분
        })
      }
      return frontendResponse
    } else {
      const errorData = JSON.parse(responseText)
      return NextResponse.json(
        { success: false, message: errorData.message || "Login failed" },
        { status: backendResponse.status },
      )
    }
  } catch (error) {
    console.error("❌ 로그인 API 오류:", error)
    return NextResponse.json({ success: false, message: "Network error" }, { status: 500 })
  }
}
