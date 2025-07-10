import { type NextRequest, NextResponse } from "next/server"

interface SignupRequestDto {
  username: string
  password: string
}

interface SignupResponse {
  success: boolean
  message: string
  userId?: number
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: SignupRequestDto = await request.json()

    // 입력 데이터 검증
    if (!body.username || !body.password) {
      return NextResponse.json(
        {
          success: false,
          message: "Username and password are required",
        },
        { status: 400 },
      )
    }

    // 기본 유효성 검사
    if (!body.username.match(/^[a-zA-Z0-9\-_'.]{2,20}$/)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Username must be 2-20 characters and contain only letters, numbers, dash, underscore, apostrophe, or period",
        },
        { status: 400 },
      )
    }

    if (body.password.length < 8 || body.password.length > 64) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be 8-64 characters",
        },
        { status: 400 },
      )
    }

    if (
      !/^(?=.*[A-Za-z])(?=.*\d)(?=.*[\x21-\x2F\x3A-\x40\x5B-\x60\x7B-\x7E])[A-Za-z\d\x21-\x2F\x3A-\x40\x5B-\x60\x7B-\x7E]{8,64}$/.test(
        body.password,
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must contain at least one letter, one number, and one special character",
        },
        { status: 400 },
      )
    }

    const backendUrl = process.env.BACKEND_URL || "http://localhost:8080"
    const apiUrl = new URL("/api/auth/signup", backendUrl)

    console.log(`백엔드 회원가입 호출: ${apiUrl.toString()}`)

    const response = await fetch(apiUrl.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: body.username.trim(),
        password: body.password,
      }),
      signal: AbortSignal.timeout(10000),
    })

    console.log(`백엔드 응답 상태: ${response.status}`)
    console.log(`백엔드 응답 헤더:`, Object.fromEntries(response.headers.entries()))

    // 응답 텍스트를 먼저 읽어서 로깅
    const responseText = await response.text()
    console.log(`백엔드 응답 본문:`, responseText)

    if (!response.ok) {
      let errorMessage = "Failed to create account"

      try {
        const errorData = JSON.parse(responseText)
        errorMessage = errorData.message || errorMessage
      } catch {
        console.log("JSON 파싱 실패 - 에러 응답")
        errorMessage = responseText || errorMessage
      }

      return NextResponse.json(
        {
          success: false,
          message: errorMessage,
        },
        { status: response.status },
      )
    }

    // 성공 응답 처리 - 이제 항상 JSON이 있음
    let data: SignupResponse

    try {
      data = JSON.parse(responseText)
    } catch {
      console.log("JSON 파싱 실패 - 성공 응답")
      // 파싱 실패 시 기본값 사용
      data = {
        success: true,
        message: "Account created successfully!",
      }
    }

    return NextResponse.json({
      success: true,
      message: data.message || "Account created successfully!",
      userId: data.userId,
    })
  } catch (error) {
    console.error("회원가입 API 오류:", error)

    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          message: "Server error. Please try again later.",
          details: error.message,
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      )
    }

    return NextResponse.json(
      {
        success: false,
        message: "회원가입 처리 중 오류가 발생했습니다",
      },
      { status: 500 },
    )
  }
}
