import { type NextRequest, NextResponse } from "next/server"
import { createBackendUrl } from "@/lib/api-config"

export async function GET(request: NextRequest) {
  console.log("🔍 [STATUS] 인증 상태 확인 요청 받음");
  console.log("📅 시간:", new Date().toISOString());
  console.log("🍪 쿠키:", request.cookies.getAll());
  
  try {
    console.log("🔍 인증 상태 확인 API 호출")

    const apiUrl = createBackendUrl("/api/auth/status")
    console.log(`🔍 백엔드 URL: ${apiUrl}`)

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

    console.log(`🔍 백엔드 호출: ${apiUrl}`)

    const backendResponse = await fetch(apiUrl, {
      method: "GET",
      headers,
      signal: AbortSignal.timeout(10000),
    })

    console.log(`🔍 백엔드 응답 상태: ${backendResponse.status}`)

    if (backendResponse.ok) {
      console.log("✅ [STATUS] 인증 성공");
      try {
        const backendData = await backendResponse.json();
        console.log("📄 백엔드 응답 데이터:", backendData);
        return NextResponse.json(backendData);
      } catch (jsonError) {
        console.log("💥 JSON 파싱 에러:", jsonError);
        return NextResponse.json(
          {
            success: false,
            message: "Invalid response format",
          },
          { status: 500 },
        )
      }
    } else {
      console.log("❌ [STATUS] 인증 실패 - 상태:", backendResponse.status);
      try {
        const errorData = await backendResponse.json();
        console.log("📄 에러 응답 데이터:", errorData);
        return NextResponse.json(errorData, { status: backendResponse.status });
      } catch (jsonError) {
        console.log("💥 에러 응답 JSON 파싱 실패:", jsonError);
        return NextResponse.json(
          {
            success: false,
            message: "Authentication failed",
          },
          { status: backendResponse.status },
        )
      }
    }
  } catch (error) {
    console.log("💥 [STATUS] 에러 발생:", error);
    console.error("❌ 인증 상태 확인 API 오류:", error)

    if (error instanceof Error) {
      console.log("🔍 에러 타입:", error.constructor.name);
      console.log("🔍 에러 메시지:", error.message);
      
      if (error.name === "AbortError") {
        return NextResponse.json(
          {
            success: false,
            message: "Request timeout",
          },
          { status: 408 },
        )
      }
      
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        return NextResponse.json(
          {
            success: false,
            message: "Backend connection failed",
          },
          { status: 503 },
        )
      }
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
