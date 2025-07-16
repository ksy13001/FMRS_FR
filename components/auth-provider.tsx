"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@/types/auth-types"
import { authTokenManager } from "@/lib/auth-token-manager"
import { apiClient } from "@/lib/api-client"

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (user: User, accessToken: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!user && authTokenManager.hasToken()

  useEffect(() => {
    console.log("🔄 AuthProvider 초기화 시작")
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      console.log("📡 인증 상태 확인 중...")

      // 🔧 localStorage에서 사용자 정보 확인
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser)
          console.log("💾 localStorage에서 사용자 정보 발견:", userData)
          setUser(userData)
        } catch (parseError) {
          console.error("localStorage 파싱 오류:", parseError)
          localStorage.removeItem("user")
        }
      }

      // 🔧 서버에서 인증 상태 확인 (Access Token 필요)
      try {
        const response = await apiClient.get("/api/auth/status", { skipRetry: true })

        if (response.ok) {
          console.log("✅ 서버 인증 상태 확인 성공")
          // 이미 localStorage에서 사용자 정보 로드됨
        } else {
          console.log("❌ 서버 인증 실패 - 토큰 갱신 시도")

          // 토큰 갱신 시도
          const refreshResponse = await fetch("/api/auth/refresh", {
            method: "POST",
            credentials: "include",
          })

          if (refreshResponse.ok) {
            // 새 Access Token을 메모리에 저장
            const authHeader = refreshResponse.headers.get("Authorization")
            if (authHeader && authHeader.startsWith("Bearer ")) {
              const newAccessToken = authHeader.substring(7)
              authTokenManager.setAccessToken(newAccessToken)
              console.log("✅ 토큰 갱신 성공 - 사용자 상태 유지")
            }
          } else {
            console.log("❌ 토큰 갱신 실패 - 로그아웃 처리")
            setUser(null)
            authTokenManager.clearAccessToken()
            localStorage.removeItem("user")
          }
        }
      } catch (serverError) {
        console.error("🚨 서버 통신 오류:", serverError)
        // 서버 오류 시에도 로컬 상태는 유지
      }
    } catch (error) {
      console.error("🚨 인증 상태 확인 중 오류:", error)
      setUser(null)
      authTokenManager.clearAccessToken()
      localStorage.removeItem("user")
    } finally {
      setIsLoading(false)
    }
  }

  const login = (userData: User, accessToken: string) => {
    console.log("🔐 로그인 처리:", userData)
    console.log("🔑 Access Token 메모리에 저장")

    // 🔑 Access Token을 메모리에 저장
    authTokenManager.setAccessToken(accessToken)

    // 💾 사용자 정보를 localStorage에 저장
    setUser(userData)
    localStorage.setItem("user", JSON.stringify(userData))
  }

  const logout = async () => {
    try {
      console.log("🚪 로그아웃 처리 시작")

      // 서버에 로그아웃 요청 (Refresh Token 쿠키 무효화)
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })

      // 클라이언트 상태 정리
      setUser(null)
      authTokenManager.clearAccessToken()
      localStorage.removeItem("user")

      console.log("✅ 로그아웃 완료")
    } catch (error) {
      console.error("🚨 로그아웃 중 오류:", error)
      // 오류가 발생해도 클라이언트 상태는 정리
      setUser(null)
      authTokenManager.clearAccessToken()
      localStorage.removeItem("user")
    }
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
