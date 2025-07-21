// 🔐 백엔드 응답 타입 정의 (백엔드 ReissueResponseDto와 일치)

export interface ReissueResponseDto {
  success: boolean
  message: string
  accessToken?: string
  refreshToken?: string
}

// 백엔드 LoginResponseDto 구조에 맞게 수정
export interface BackendLoginResponse {
  success: boolean
  message: string
  userId?: number
  username?: string
}

// 프론트엔드에서 사용하는 LoginResponse (기존 유지)
export interface LoginResponse {
  success: boolean
  message: string
  user?: {
    id: number
    username: string
  }
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

// 백엔드 에러 케이스들
export type ReissueErrorType =
  | "INVALID_HEADER" // Authorization 헤더 없음
  | "EXPIRED_TOKEN" // 토큰 만료
  | "BLACKLISTED_TOKEN" // 블랙리스트된 토큰
  | "INVALID_TOKEN" // 유효하지 않은 토큰

export interface TokenValidationResult {
  isValid: boolean
  userId?: number
  expiresAt?: Date
  error?: ReissueErrorType
}
