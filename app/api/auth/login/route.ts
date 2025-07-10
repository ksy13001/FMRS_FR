import { type NextRequest, NextResponse } from "next/server"

interface BackendLoginResponse {
  success: boolean
  message: string
  userId: number
  username: string
}

interface FrontendLoginResponse {
  success: boolean
  message: string
  user?: {
    id: number
    username: string
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("🔐 로그인 API 호출")

    const body = await request.json()
    console.log("🔐 요청 데이터:", { username: body.username, hasPassword: !!body.password })

    const backendUrl = process.env.BACKEND_URL || "http://localhost:8080"
    const apiUrl = new URL("/api/auth/login", backendUrl)

    console.log(`🔐 백엔드 호출: ${apiUrl.toString()}`)

    const backendResponse = await fetch(apiUrl.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    })

    console.log(`🔐 백엔드 응답 상태: ${backendResponse.status}`)
    console.log(`🔐 백엔드 응답 헤더:`, Object.fromEntries(backendResponse.headers.entries()))

    // 🔧 응답 텍스트 먼저 확인
    const responseText = await backendResponse.text()
    console.log(`🔐 백엔드 응답 본문:`, responseText)

    if (backendResponse.status === 405) {
      console.error("❌ 405 Method Not Allowed - 백엔드 라우팅 문제")
      return NextResponse.json(
        {
          success: false,
          message: "Backend service unavailable. Please check if the backend server is running correctly.",
        },
        { status: 503 },
      )
    }

    if (!backendResponse.ok) {
      let errorMessage = "Login failed"
      try {
        if (responseText.trim()) {
          const errorData = JSON.parse(responseText)
          errorMessage = errorData.message || errorMessage
        }
      } catch {
        errorMessage = `Backend error: ${backendResponse.status}`
      }

      return NextResponse.json(
        {
          success: false,
          message: errorMessage,
        },
        { status: backendResponse.status },
      )
    }

    // 🔧 성공 응답 처리
    let backendData: BackendLoginResponse
    try {
      if (!responseText.trim()) {
        throw new Error("Empty response from backend")
      }
      backendData = JSON.parse(responseText)
    } catch (parseError) {
      console.error("❌ 백엔드 응답 JSON 파싱 실패:", parseError)
      return NextResponse.json(
        {
          success: false,
          message: "Invalid response from backend server",
        },
        { status: 500 },
      )
    }

    console.log("✅ 백엔드 로그인 성공:", backendData)

    // 🔧 Authorization 헤더에서 Access Token 추출
    const authHeader = backendResponse.headers.get("authorization")
    let accessToken: string | undefined

    if (authHeader && authHeader.startsWith("Bearer ")) {
      accessToken = authHeader.substring(7) // "Bearer " 제거
      console.log("🔑 Authorization 헤더에서 Access Token 추출 성공")
    } else {
      console.warn("⚠️ Authorization 헤더에 Access Token 없음")
    }

    // 프론트엔드 응답 생성
    const frontendResponse: FrontendLoginResponse = {
      success: backendData.success,
      message: backendData.message,
      user: {
        id: backendData.userId,
        username: backendData.username,
      },
    }

    const response = NextResponse.json(frontendResponse, { status: 200 })

    // 🔧 백엔드의 Refresh Token 쿠키를 클라이언트로 전달
    const setCookieHeaders = backendResponse.headers.get("set-cookie")
    if (setCookieHeaders) {
      console.log("🍪 Refresh Token 쿠키 전달:", setCookieHeaders)
      response.headers.set("Set-Cookie", setCookieHeaders)
    } else {
      console.warn("⚠️ 백엔드에서 Refresh Token 쿠키 없음")
    }

    // 🔑 Access Token을 HttpOnly 쿠키로 설정
    if (accessToken) {
      console.log("🔑 Access Token을 HttpOnly 쿠키로 설정")
      response.cookies.set("access_token", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 15 * 60, // 15분
      })
    }

    return response
  } catch (error) {
    console.error("❌ 로그인 API 오류:", error)

    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        {
          success: false,
          message: "Request timeout. Please try again.",
        },
        { status: 408 },
      )
    }

    return NextResponse.json(
      {
        success: false,
        message: "Network error. Please check your connection and try again.",
      },
      { status: 500 },
    )
  }
}
