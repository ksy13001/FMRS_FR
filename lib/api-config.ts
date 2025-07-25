// 환경별 백엔드 URL 설정
const getBackendUrl = () => {
  // 환경 변수가 설정되어 있으면 우선 사용
  if (process.env.BACKEND_URL) {
    return process.env.BACKEND_URL
  }
  
  // 환경별 기본값 설정
  if (process.env.NODE_ENV === 'production') {
    return "http://localhost:8080"  // 배포환경
  } else {
    return "https://localhost:8443" // 로컬환경
  }
}

// API 설정 유틸리티
export const API_CONFIG = {
  // 프론트엔드 기본 URL
  FRONTEND_BASE_URL: process.env.NEXT_PUBLIC_FRONTEND_PROTOCOL
    ? `${process.env.NEXT_PUBLIC_FRONTEND_PROTOCOL}://${process.env.NEXT_PUBLIC_FRONTEND_HOST}`
    : typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.host}`
      : "http://localhost:3000",

  // 백엔드 URL
  BACKEND_URL: getBackendUrl(),

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
