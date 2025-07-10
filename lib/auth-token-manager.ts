// 🔑 Access Token 관리 유틸리티
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
    console.log("🔑 Access Token 설정됨")
  }

  getAccessToken(): string | null {
    return this.accessToken
  }

  clearAccessToken() {
    this.accessToken = null
    console.log("🔑 Access Token 삭제됨")
  }

  // Authorization 헤더 생성
  getAuthHeader(): Record<string, string> {
    if (this.accessToken) {
      return {
        Authorization: `Bearer ${this.accessToken}`,
      }
    }
    return {}
  }
}

export const authTokenManager = AuthTokenManager.getInstance()
