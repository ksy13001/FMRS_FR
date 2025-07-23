// 🔐 로그인 플로우 관련 유틸리티 함수들

export interface LoginFormData {
  username: string
  password: string
}

export interface LoginResponse {
  success: boolean
  message: string
  user?: {
    id: number
    username: string
  }
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

  // Username validation - matches backend: 2-20 characters, letters/numbers/dash/underscore/apostrophe/period
  if (!formData.username.trim()) {
    errors.username = "Username is required"
  } else if (!formData.username.match(/^[a-zA-Z0-9\-_'.]{2,20}$/)) {
    errors.username = "Username must be 2-20 characters and contain only letters, numbers, dash, underscore, apostrophe, or period"
  }

  // Password validation - matches backend: 8-64 characters, must contain letter + number + special character
  if (!formData.password) {
    errors.password = "Password is required"
  } else if (formData.password.length < 8 || formData.password.length > 64) {
    errors.password = "Password must be 8-64 characters"
  } else if (
    !/^(?=.*[A-Za-z])(?=.*\d)(?=.*[\x21-\x2F\x3A-\x40\x5B-\x60\x7B-\x7E])[A-Za-z\d\x21-\x2F\x3A-\x40\x5B-\x60\x7B-\x7E]{8,64}$/.test(
      formData.password,
    )
  ) {
    errors.password = "Password must contain at least one letter, one number, and one special character"
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
  });
  const data: LoginResponse = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Login failed");
  }
  return data;
}

/**
 * 로그인 성공 후 처리
 */
export function handleLoginSuccess(userData: LoginResponse["user"]): void {
  if (userData) {
    localStorage.setItem("user", JSON.stringify(userData));
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
