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

    // Input validation
    if (!body.username || !body.password) {
      return NextResponse.json(
        {
          success: false,
          message: "Username and password are required",
        },
        { status: 400 },
      )
    }

    // Username validation - matches backend: 2-20 characters, letters/numbers/dash/underscore/apostrophe/period
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

    // Password validation - matches backend: 8-64 characters, must contain letter + number + special character
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

    console.log(`Backend signup call: ${apiUrl.toString()}`)

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

    console.log(`Backend response status: ${response.status}`)
    console.log(`Backend response headers:`, Object.fromEntries(response.headers.entries()))

    // Read response text first for logging
    const responseText = await response.text()
    console.log(`Backend response body:`, responseText)

    if (!response.ok) {
      let errorMessage = "Failed to create account"

      try {
        const errorData = JSON.parse(responseText)
        errorMessage = errorData.message || errorMessage
      } catch {
        console.log("JSON parsing failed - error response")
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

    // Success response processing - now always has JSON
    let data: SignupResponse

    try {
      data = JSON.parse(responseText)
    } catch {
      console.log("JSON parsing failed - success response")
      // Use default value if parsing fails
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
    console.error("Signup API error:", error)

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
        message: "An error occurred during signup process",
      },
      { status: 500 },
    )
  }
}
