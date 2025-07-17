import type { User } from "@/types/auth-types"

export interface LoginFormData {
  username: string
  password: string
}

export interface LoginResponse {
  success: boolean
  message: string
  user?: User
  accessToken?: string
}

export interface LoginFormErrors {
  username?: string
  password?: string
}

/**
 * 로그인 폼 유효성 검사
 */
export function validateLoginForm(formData: LoginFormData): {
  isValid: boolean
  errors: LoginFormErrors
} {
  const errors: LoginFormErrors = {}

  // Username 검사
  if (!formData.username.trim()) {
    errors.username = "Username is required"
  } else if (formData.username.length < 2 || formData.username.length > 20) {
    errors.username = "Username must be 2-20 characters"
  }

  // Password 검사
  if (!formData.password) {
    errors.password = "Password is required"
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

/**
 * 로그인 API 호출
 */
export async function performLogin(formData: LoginFormData): Promise<LoginResponse> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: formData.username.trim(),
      password: formData.password,
    }),
    credentials: "include",
  })

  const data: LoginResponse = await response.json()

  if (!response.ok) {
    throw new Error(data.message || "Login failed")
  }

  return data
}

/**
 * 로그인 성공 후 처리
 */
export function handleLoginSuccess(userData: User): void {
  if (userData) {
    localStorage.setItem("user", JSON.stringify(userData))
  }
}

/**
 * 로그인 에러 메시지 생성
 */
export function getLoginErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === "string") {
    return error
  }

  return "Network error. Please check your connection and try again."
}
