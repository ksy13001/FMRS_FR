import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:8080"
    const apiUrl = new URL("/api/auth/logout", backendUrl)

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    }

    // 🔧 수정: Refresh Token 쿠키만 전달 (백엔드에서 쿠키에서 추출)
    const cookieHeader = request.headers.get("cookie")
    if (cookieHeader) {
      headers.Cookie = cookieHeader
    }

    const backendResponse = await fetch(apiUrl.toString(), {
      method: "POST",
      headers,
      signal: AbortSignal.timeout(10000),
    })

    // 백엔드 응답 내용 로깅
    if (backendResponse.ok) {
    } else {
      const errorData = await backendResponse.text()
    }

    // 성공/실패 관계없이 클라이언트 쿠키 정리
    const response = NextResponse.json(
      {
        success: true,
        message: "Logged out successfully",
        backendStatus: backendResponse.status,
      },
      { status: 200 },
    )

    // 🔑 모든 인증 관련 쿠키 삭제
    response.cookies.delete("access_token")
    response.cookies.delete("refresh_token")

    // 백엔드에서 추가 쿠키 삭제 응답이 있으면 전달
    const setCookieHeaders = backendResponse.headers.get("set-cookie")
    if (setCookieHeaders) {
      response.headers.set("Set-Cookie", setCookieHeaders)
    }

    return response
  } catch (error) {
    // 오류가 발생해도 클라이언트 쿠키는 정리
    const response = NextResponse.json(
      {
        success: true, // 🔧 수정: 오류가 발생해도 로그아웃은 성공으로 처리
        message: "Logged out (with errors, but client cookies cleared)",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 200 }, // 🔧 수정: 200으로 변경
    )

    // 모든 인증 쿠키 삭제
    response.cookies.delete("access_token")
    response.cookies.delete("refresh_token")

    return response
  }
}
