import { NextRequest, NextResponse } from "next/server"
import { createBackendUrl } from "@/lib/api-config"

export async function POST(request: NextRequest) {
  console.log("🔄 [REISSUE] 토큰 재발급 요청 받음");
  console.log("📅 시간:", new Date().toISOString());
  console.log("🍪 쿠키:", request.cookies.getAll());
  
  try {
    console.log("🔄 토큰 재발급 API 호출")
    
    // Refresh Token 쿠키 전달을 위해 쿠키 헤더 복사
    const cookieHeader = request.headers.get("cookie")
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    }
    
    if (cookieHeader) {
      headers.Cookie = cookieHeader
    }

    const backendResponse = await fetch(createBackendUrl("/api/auth/reissue"), {
      method: "POST",
      headers,
    })

    if (backendResponse.ok) {
      console.log("✅ [REISSUE] 토큰 재발급 성공");
      const authHeader = backendResponse.headers.get("Authorization")
      let accessToken = null
      if (authHeader && authHeader.startsWith("Bearer ")) {
        accessToken = authHeader.substring(7)
      }
      const setCookieHeaders = backendResponse.headers.getSetCookie()
      const response = NextResponse.json(
        {
          success: true,
          message: "Token refreshed successfully",
        },
        { status: 200 },
      )
      setCookieHeaders.forEach((cookie) => {
        response.headers.append("Set-Cookie", cookie)
      })
      if (accessToken) {
        response.cookies.set("access_token", accessToken, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          path: "/",
          maxAge: 60 * 30, // 30분
        })
      }
      return response
    } else {
      console.log("❌ [REISSUE] 토큰 재발급 실패 - 상태:", backendResponse.status);
      const errorData = await backendResponse.json()
      return NextResponse.json(errorData, { status: backendResponse.status })
    }
  } catch (error) {
    console.log("💥 [REISSUE] 에러 발생:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    )
  }
} 