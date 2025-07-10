"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@/types/auth-types"

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (user: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!user

  useEffect(() => {
    console.log("🔄 AuthProvider 초기화 시작")
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      console.log("📡 인증 상태 확인 중...")

      // 🔧 수정: 먼저 localStorage 확인하고 즉시 로딩 해제
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser)
          console.log("💾 localStorage에서 사용자 정보 발견:", userData)
          setUser(userData)
          setIsLoading(false) // 🔧 추가: 사용자 정보가 있으면 즉시 로딩 해제
        } catch (parseError) {
          console.error("localStorage 파싱 오류:", parseError)
          localStorage.removeItem("user")
        }
      } else {
        // 🔧 추가: localStorage에 사용자 정보가 없으면 즉시 로딩 해제
        setIsLoading(false)
        console.log("💾 localStorage에 사용자 정보 없음 - 로딩 해제")
      }

      // 🔧 수정: 백그라운드에서 서버 확인 (로딩 상태에 영향 없음)
      try {
        const response = await fetch("/api/auth/status", {
          credentials: "include",
        })

        console.log("📡 Auth Status 응답:", response.status)

        if (response.ok) {
          const data = await response.json()
          console.log("✅ 서버 인증 상태 확인 성공:", data)
          // localStorage 정보와 서버 상태가 일치하므로 추가 작업 없음
        } else {
          console.log("❌ 서버 인증 실패, 토큰 갱신 시도...")

          const refreshResponse = await fetch("/api/auth/refresh", {
            method: "POST",
            credentials: "include",
          })

          console.log("🔄 토큰 갱신 응답:", refreshResponse.status)

          if (refreshResponse.ok) {
            console.log("✅ 토큰 갱신 성공 - 사용자 상태 유지")
          } else {
            console.log("❌ 토큰 갱신 실패 - 로그아웃 처리")
            setUser(null)
            localStorage.removeItem("user")
          }
        }
      } catch (serverError) {
        console.error("🚨 서버 통신 오류 (백그라운드):", serverError)
        // 서버 오류는 사용자 상태에 영향을 주지 않음
      }
    } catch (error) {
      console.error("🚨 인증 상태 확인 중 오류:", error)
      setUser(null)
      localStorage.removeItem("user")
      setIsLoading(false)
    }
  }

  const login = (userData: User) => {
    console.log("🔐 로그인 처리:", userData)
    setUser(userData)
    localStorage.setItem("user", JSON.stringify(userData))
  }

  const logout = async () => {
    try {
      console.log("🚪 로그아웃 처리 시작")

      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })

      setUser(null)
      localStorage.removeItem("user")
      console.log("✅ 로그아웃 완료")
    } catch (error) {
      console.error("🚨 로그아웃 중 오류:", error)
      setUser(null)
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
