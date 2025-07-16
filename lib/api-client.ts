// 🌐 API 클라이언트 (자동 토큰 관리)
import { authTokenManager } from "./auth-token-manager"

interface ApiOptions extends RequestInit {
  skipAuth?: boolean
  skipRetry?: boolean
}

class ApiClient {
  private static instance: ApiClient
  private isRefreshing = false
  private refreshPromise: Promise<boolean> | null = null

  private constructor() {}

  static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient()
    }
    return ApiClient.instance
  }

  async request(url: string, options: ApiOptions = {}): Promise<Response> {
    const { skipAuth = false, skipRetry = false, ...fetchOptions } = options

    // 헤더 설정
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...fetchOptions.headers,
    }

    // Access Token 자동 추가 (인증이 필요한 요청)
    if (!skipAuth && authTokenManager.hasToken()) {
      Object.assign(headers, authTokenManager.getAuthHeaders())
    }

    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      credentials: "include", // 쿠키 포함
    })

    // 401 에러 시 토큰 재발급 시도
    if (response.status === 401 && !skipRetry && !skipAuth) {
      console.log("🔄 401 에러 - 토큰 재발급 시도")

      const refreshSuccess = await this.refreshToken()
      if (refreshSuccess) {
        console.log("✅ 토큰 재발급 성공 - 원래 요청 재시도")
        // 재시도 시 skipRetry=true로 무한 루프 방지
        return this.request(url, { ...options, skipRetry: true })
      } else {
        console.log("❌ 토큰 재발급 실패 - 로그인 필요")
        // 로그인 페이지로 리다이렉트 (AuthProvider에서 처리)
        window.location.href = "/auth/login"
      }
    }

    return response
  }

  private async refreshToken(): Promise<boolean> {
    // 이미 재발급 중이면 기존 Promise 반환
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise
    }

    this.isRefreshing = true
    this.refreshPromise = this.performRefresh()

    try {
      const result = await this.refreshPromise
      return result
    } finally {
      this.isRefreshing = false
      this.refreshPromise = null
    }
  }

  private async performRefresh(): Promise<boolean> {
    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include", // Refresh Token 쿠키 포함
      })

      if (response.ok) {
        // Authorization 헤더에서 새 Access Token 추출
        const authHeader = response.headers.get("Authorization")
        if (authHeader && authHeader.startsWith("Bearer ")) {
          const newAccessToken = authHeader.substring(7)
          authTokenManager.setAccessToken(newAccessToken)
          console.log("🔄 새 Access Token 메모리에 저장")
          return true
        }
      }

      console.log("❌ 토큰 재발급 실패")
      authTokenManager.clearAccessToken()
      return false
    } catch (error) {
      console.error("❌ 토큰 재발급 오류:", error)
      authTokenManager.clearAccessToken()
      return false
    }
  }

  // 편의 메서드들
  async get(url: string, options?: ApiOptions) {
    return this.request(url, { ...options, method: "GET" })
  }

  async post(url: string, data?: any, options?: ApiOptions) {
    return this.request(url, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put(url: string, data?: any, options?: ApiOptions) {
    return this.request(url, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete(url: string, options?: ApiOptions) {
    return this.request(url, { ...options, method: "DELETE" })
  }
}

export const apiClient = ApiClient.getInstance()
