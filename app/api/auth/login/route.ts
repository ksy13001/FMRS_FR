import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("🔐 프론트엔드 로그인 API 호출")

    const body = await request.json()
    const backendUrl = process.env.BACKEND_URL || "http://localhost:8080"
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
      console.log("✅ 백엔드 로그인 성공:", backendData)

      // 🔑 Authorization 헤더에서 Access Token 추출
      const authHeader = backendResponse.headers.get("Authorization")
      let accessToken = null
      if (authHeader && authHeader.startsWith("Bearer ")) {
        accessToken = authHeader.substring(7)
        console.log("🔑 Access Token 추출됨:", accessToken.substring(0, 20) + "...")
      }

      // 🍪 Set-Cookie 헤더에서 Refresh Token 쿠키 전달
      const setCookieHeaders = backendResponse.headers.getSetCookie()
      console.log("🍪 백엔드 Set-Cookie 헤더들:", setCookieHeaders)

      const frontendResponse = NextResponse.json({
        success: backendData.success,
        message: backendData.message,
        user: {
          id: backendData.userId,
          username: backendData.username,
        },
        accessToken, // 🔑 Access Token을 응답에 포함
      })

      // 🍪 Refresh Token 쿠키 전달
      setCookieHeaders.forEach((cookie) => {
        frontendResponse.headers.append("Set-Cookie", cookie)
      })

      console.log("🔑 Access Token: Authorization 헤더로 전달")
      console.log("🍪 Refresh Token: 쿠키로 전달")

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
