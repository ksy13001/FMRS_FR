// API 설정 유틸리티
export const API_CONFIG = {
  // 프론트엔드 기본 URL
  FRONTEND_BASE_URL: process.env.NEXT_PUBLIC_FRONTEND_PROTOCOL
    ? `${process.env.NEXT_PUBLIC_FRONTEND_PROTOCOL}://${process.env.NEXT_PUBLIC_FRONTEND_HOST}`
    : typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.host}`
      : "http://localhost:3000",

  // 백엔드 URL
  BACKEND_URL: process.env.BACKEND_URL || "http://localhost:8080",

  // API 타임아웃
  TIMEOUT: 15000,
} as const

// API 요청 헬퍼
export const createApiUrl = (path: string) => {
  const baseUrl = API_CONFIG.FRONTEND_BASE_URL
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`
}

// 백엔드 API URL 생성
export const createBackendUrl = (path: string) => {
  const baseUrl = API_CONFIG.BACKEND_URL
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`
}
