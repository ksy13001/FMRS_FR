export interface User {
  id: number
  username: string
}

export interface LoginResponse {
  success: boolean
  message: string
  user?: User
  accessToken?: string
}

export interface SignupResponse {
  success: boolean
  message: string
  userId?: number
}

export interface AuthStatusResponse {
  success: boolean
  message: string
  user?: User
}

export interface RefreshResponse {
  success: boolean
  message: string
}

export interface LogoutResponse {
  success: boolean
  message: string
}

export interface AuthErrorResponse {
  success: false
  message: string
  details?: string
  timestamp?: string
}

// 백엔드 응답 타입
export interface BackendLoginResponse {
  success: boolean
  message: string
  userId?: number
  username?: string
}

export interface ReissueResponseDto {
  success: boolean
  message: string
  accessToken?: string
  refreshToken?: string
}

export type ReissueErrorType = "INVALID_HEADER" | "EXPIRED_TOKEN" | "BLACKLISTED_TOKEN" | "INVALID_TOKEN"

export interface TokenValidationResult {
  isValid: boolean
  userId?: number
  expiresAt?: Date
  error?: ReissueErrorType
}
