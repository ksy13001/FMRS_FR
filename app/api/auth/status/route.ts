import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 인증 상태 확인 API 호출")

    const backendUrl = process.env.BACKEND_URL || "http://localhost:8080"
    const apiUrl = new URL("/api/auth/status", backendUrl)

    // 🔑 Access Token 쿠키에서 추출 (프론트엔드는 쿠키 기반 인증만 사용)
    const accessToken = request.cookies.get("access_token")?.value
    // Authorization 헤더로 전달하는 부분 제거
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    }
    // Refresh Token 쿠키 전달을 위해 쿠키 헤더 복사
    const cookieHeader = request.headers.get("cookie")
    if (cookieHeader) {
      headers.Cookie = cookieHeader
    }

    console.log(`🔍 백엔드 호출: ${apiUrl.toString()}`)

    const backendResponse = await fetch(apiUrl.toString(), {
      method: "GET",
      headers,
      signal: AbortSignal.timeout(10000),
    })

    console.log(`🔍 백엔드 응답 상태: ${backendResponse.status}`)

    if (backendResponse.ok) {
      console.log("✅ 인증 상태 확인 성공")

      // 로컬스토리지에서 사용자 정보를 가져올 수 있도록 빈 응답 반환
      return NextResponse.json(
        {
          success: true,
          message: "Authenticated",
        },
        { status: 200 },
      )
    } else {
      console.log("❌ 인증 상태 확인 실패")
      return NextResponse.json(
        {
          success: false,
          message: "Authentication failed",
        },
        { status: 401 },
      )
    }
  } catch (error) {
    console.error("❌ 인증 상태 확인 API 오류:", error)

    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        {
          success: false,
          message: "Request timeout",
        },
        { status: 408 },
      )
    }

    return NextResponse.json(
      {
        success: false,
        message: "Network error",
      },
      { status: 500 },
    )
  }
}
