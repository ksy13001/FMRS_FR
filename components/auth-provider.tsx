"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@/types/auth-types"
import { apiClient } from "@/lib/api-client"

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

  const isAuthenticated = !!user;

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // localStorage에서 사용자 정보 확인
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        } catch {
          localStorage.removeItem("user");
        }
      }
      
      // 서버에서 인증 상태 확인 (쿠키 기반)
      const response = await fetch("/api/auth/status", { credentials: "include" });
      
      if (response.ok) {
        // 인증 성공 → user 정보 받아서 상태 복구
        const data = await response.json();
        if (data.success && data.dto) {
          const userData = {
            id: data.dto.userId,
            username: data.dto.userName
          };
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));
        }
      } else if (response.status === 401) {
        // 토큰 재발급 시도
        const refreshResponse = await fetch("/api/auth/reissue", {
          method: "POST",
          credentials: "include"
        });
        
        if (refreshResponse.ok) {
          // 재발급 성공 → 다시 상태 확인
          await checkAuthStatus();
        } else {
          // 재발급 실패 → 로그아웃
          setUser(null);
          localStorage.removeItem("user");
        }
      } else {
        // 기타 에러 → 로그아웃
        setUser(null);
        localStorage.removeItem("user");
      }
    } catch {
      setUser(null);
      localStorage.removeItem("user");
    } finally {
      setIsLoading(false);
    }
  };

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } finally {
      setUser(null);
      localStorage.removeItem("user");
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
