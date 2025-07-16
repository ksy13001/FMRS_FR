// 🔑 Access Token 메모리 관리
class AuthTokenManager {
  private static instance: AuthTokenManager
  private accessToken: string | null = null

  private constructor() {}

  static getInstance(): AuthTokenManager {
    if (!AuthTokenManager.instance) {
      AuthTokenManager.instance = new AuthTokenManager()
    }
    return AuthTokenManager.instance
  }

  setAccessToken(token: string) {
    this.accessToken = token
    console.log("🔑 Access Token 메모리에 저장됨")
  }

  getAccessToken(): string | null {
    return this.accessToken
  }

  clearAccessToken() {
    this.accessToken = null
    console.log("🔑 Access Token 메모리에서 삭제됨")
  }

  // Authorization 헤더 생성
  getAuthHeaders(): Record<string, string> {
    if (this.accessToken) {
      return {
        Authorization: `Bearer ${this.accessToken}`,
      }
    }
    return {}
  }

  // 토큰 존재 여부 확인
  hasToken(): boolean {
    return !!this.accessToken
  }
}

export const authTokenManager = AuthTokenManager.getInstance()
