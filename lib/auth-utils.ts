// 로컬 스토리지에서 사용자 정보 가져오기
export const getCurrentUser = () => {
  if (typeof window === "undefined") return null

  try {
    const userStr = localStorage.getItem("user")
    return userStr ? JSON.parse(userStr) : null
  } catch (error) {
    console.error("로컬스토리지에서 사용자 정보 파싱 오류:", error)
    localStorage.removeItem("user")
    return null
  }
}

// 서버 중심 인증 초기화
export const initializeAuth = async () => {
  try {
    // 서버에서 토큰 상태 확인
    const response = await fetch("/api/auth/status", {
      credentials: "include",
    })

    if (!response.ok) {
      // 서버에서 유효하지 않다고 하면 로컬 정보 삭제
      localStorage.removeItem("user")
      throw new Error("유효하지 않은 토큰")
    }

    return true
  } catch (error) {
    console.error("인증 초기화 실패:", error)
    localStorage.removeItem("user")
    throw error
  }
}

// 서버에서 인증 상태 확인
export const checkAuthStatus = async (): Promise<boolean> => {
  try {
    const response = await fetch("/api/auth/status", {
      credentials: "include",
    })
    return response.ok
  } catch (error) {
    console.error("인증 상태 확인 실패:", error)
    return false
  }
}
