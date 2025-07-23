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
      console.log("🍪 쿠키 헤더 전달:", cookieHeader)
    } else {
      console.log("⚠️ 쿠키 헤더 없음")
    }

    const backendUrl = createBackendUrl("/api/auth/reissue")
    console.log("🔍 백엔드 URL:", backendUrl)

    const backendResponse = await fetch(backendUrl, {
      method: "POST",
      headers,
    })

    console.log("🔍 백엔드 응답 상태:", backendResponse.status)
    console.log("🔍 백엔드 응답 헤더:", Object.fromEntries(backendResponse.headers.entries()))

    if (backendResponse.ok) {
      console.log("✅ [REISSUE] 토큰 재발급 성공");
      const authHeader = backendResponse.headers.get("Authorization")
      let accessToken = null
      if (authHeader && authHeader.startsWith("Bearer ")) {
        accessToken = authHeader.substring(7)
        console.log("🔑 새로운 Access Token 추출됨")
      } else {
        console.log("⚠️ Authorization 헤더 없음")
      }
      
      const setCookieHeaders = backendResponse.headers.getSetCookie()
      console.log("🍪 Set-Cookie 헤더:", setCookieHeaders)
      
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
      try {
        const errorData = await backendResponse.json()
        console.log("❌ 백엔드 에러 응답:", errorData)
        // 백엔드 상태 코드를 그대로 전달
        return NextResponse.json(errorData, { status: backendResponse.status })
      } catch (jsonError) {
        console.log("❌ 백엔드 에러 응답 파싱 실패:", jsonError)
        // 백엔드 상태 코드를 그대로 전달
        return NextResponse.json(
          { success: false, message: "Backend error" },
          { status: backendResponse.status }
        )
      }
    }
  } catch (error) {
    console.log("💥 [REISSUE] 에러 발생:", error);
    if (error instanceof Error) {
      console.log("🔍 에러 타입:", error.constructor.name);
      console.log("🔍 에러 메시지:", error.message);
    }
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    )
  }
} 