// 🔐 인증 관련 상수 정의
export const AUTH_CONFIG = {
  // 액세스 토큰 만료 시간 (30분)
  ACCESS_TOKEN_EXPIRE_TIME: 30 * 60 * 1000, // 30분 (밀리초)

  // 리프레시 토큰 만료 시간 (7일)
  REFRESH_TOKEN_EXPIRE_TIME: 7 * 24 * 60 * 60 * 1000, // 7일 (밀리초)

  // API 타임아웃
  API_TIMEOUT: 10000, // 10초
} as const

// 계산된 설정값들
export const CALCULATED_AUTH_CONFIG = {
  // 액세스 토큰 만료 시간 (분)
  ACCESS_TOKEN_EXPIRE_MINUTES: AUTH_CONFIG.ACCESS_TOKEN_EXPIRE_TIME / (60 * 1000),

  // 리프레시 토큰 만료 시간 (일)
  REFRESH_TOKEN_EXPIRE_DAYS: AUTH_CONFIG.REFRESH_TOKEN_EXPIRE_TIME / (24 * 60 * 60 * 1000),
} as const
