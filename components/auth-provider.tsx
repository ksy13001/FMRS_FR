"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useRef } from "react"
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
  const isCheckingAuth = useRef(false)

  const isAuthenticated = !!user;

  useEffect(() => {
    if (!isCheckingAuth.current) {
      isCheckingAuth.current = true;
      checkAuthStatus();
    }
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
        // 토큰 재발급 시도 (한 번만)
        console.log("🔄 토큰 재발급 시도...");
        const refreshResponse = await fetch("/api/auth/reissue", {
          method: "POST",
          credentials: "include"
        });
        
        if (refreshResponse.ok) {
          // 재발급 성공 → localStorage의 기존 user 정보로 복구
          console.log("✅ 토큰 재발급 성공, 기존 user 정보로 복구");
          
          // localStorage에서 기존 user 정보 확인
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            try {
              const userData = JSON.parse(storedUser);
              setUser(userData);
              console.log("✅ 기존 user 정보로 로그인 상태 복구 완료");
              return; // status 재확인 생략
            } catch (error) {
              console.log("⚠️ 기존 user 정보 파싱 실패");
            }
          }
          
          // 기존 user 정보가 없으면 status 재확인
          console.log("⚠️ 기존 user 정보 없음, status 재확인");
          const statusResponse = await fetch("/api/auth/status", { credentials: "include" });
          
          if (statusResponse.ok) {
            const data = await statusResponse.json();
            if (data.success && data.dto) {
              const userData = {
                id: data.dto.userId,
                username: data.dto.userName
              };
              setUser(userData);
              localStorage.setItem("user", JSON.stringify(userData));
            }
          } else {
            // 재발급 후에도 실패 → 로그아웃
            console.log("❌ 토큰 재발급 후에도 인증 실패");
            setUser(null);
            localStorage.removeItem("user");
          }
        } else if (refreshResponse.status === 401) {
          // Refresh Token도 만료 → 즉시 로그아웃
          console.log("❌ Refresh Token 만료, 즉시 로그아웃");
          setUser(null);
          localStorage.removeItem("user");
        } else {
          // 기타 재발급 실패 → 로그아웃
          console.log("❌ 토큰 재발급 실패 - 상태:", refreshResponse.status);
          try {
            const errorData = await refreshResponse.json();
            console.log("❌ 재발급 실패 상세:", errorData);
          } catch (e) {
            console.log("❌ 재발급 실패 응답 파싱 불가");
          }
          setUser(null);
          localStorage.removeItem("user");
        }
      } else {
        // 기타 에러 → 로그아웃
        console.log("❌ 인증 상태 확인 실패:", response.status);
        setUser(null);
        localStorage.removeItem("user");
      }
    } catch (error) {
      console.log("💥 인증 상태 확인 중 에러:", error);
      setUser(null);
      localStorage.removeItem("user");
    } finally {
      setIsLoading(false);
      isCheckingAuth.current = false;
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
