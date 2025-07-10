"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/components/auth-provider"
import type { LoginResponse } from "@/types/auth-types"

interface LoginFormData {
  username: string
  password: string
}

export default function LoginContent() {
  const [formData, setFormData] = useState<LoginFormData>({
    username: "",
    password: "",
  })
  const [errors, setErrors] = useState<Partial<LoginFormData>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const { login } = useAuth()
  const router = useRouter()

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginFormData> = {}

    if (!formData.username) {
      newErrors.username = "Please enter your username"
    } else if (formData.username.length < 2) {
      newErrors.username = "Username must be at least 2 characters"
    }

    if (!formData.password) {
      newErrors.password = "Please enter your password"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // 입력 시 해당 필드의 에러 메시지 제거
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }

    // 메시지 제거
    if (message) {
      setMessage(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      console.log("🔐 로그인 요청 시작:", formData.username)

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // 쿠키 포함
        body: JSON.stringify(formData),
      })

      console.log("🔐 로그인 응답 상태:", response.status)

      // 🔧 안전한 JSON 파싱
      let data: LoginResponse
      try {
        const responseText = await response.text()
        console.log("🔐 로그인 응답 본문:", responseText)

        if (!responseText.trim()) {
          throw new Error("Empty response from server")
        }

        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error("❌ JSON 파싱 오류:", parseError)
        setMessage({
          type: "error",
          text: "Server returned invalid response. Please try again.",
        })
        return
      }

      console.log("🔐 파싱된 로그인 데이터:", data)

      if (response.ok && data.success) {
        console.log("✅ 로그인 성공!")
        setMessage({ type: "success", text: data.message })

        // 🔧 사용자 정보 저장 (Access Token은 이제 쿠키에 자동 저장됨)
        if (data.user) {
          console.log("🔑 사용자 정보 저장:", data.user)
          login(data.user)
        } else {
          console.warn("⚠️ 사용자 정보 누락")
        }

        // 🔧 수정: 즉시 리다이렉트 (setTimeout 제거)
        router.push("/")
      } else {
        console.log("❌ 로그인 실패:", data.message)
        setMessage({ type: "error", text: data.message || "Login failed" })
      }
    } catch (error) {
      console.error("❌ 로그인 오류:", error)
      setMessage({
        type: "error",
        text: "Network error occurred. Please check your connection and try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
          <CardDescription className="text-center">Sign in to your account to use the service</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={formData.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                disabled={isLoading}
                className={errors.username ? "border-red-500" : ""}
              />
              {errors.username && <p className="text-sm text-red-500">{errors.username}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                disabled={isLoading}
                className={errors.password ? "border-red-500" : ""}
              />
              {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
            </div>

            {message && (
              <Alert className={message.type === "error" ? "border-red-500 bg-red-50" : "border-green-500 bg-green-50"}>
                <AlertDescription className={message.type === "error" ? "text-red-700" : "text-green-700"}>
                  {message.text}
                </AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <a href="/auth/signup" className="font-medium text-blue-600 hover:text-blue-500">
                Sign up
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
