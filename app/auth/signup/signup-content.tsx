"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { User, Lock, Eye, EyeOff, UserPlus, AlertCircle, CheckCircle } from 'lucide-react'
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { useAuth } from "@/components/auth-provider"
import type { SignupResponse, LoginResponse } from "@/types/auth-types"

interface SignupForm {
  username: string
  password: string
  confirmPassword: string
}

export default function SignupContent() {
  const router = useRouter()
  const { login } = useAuth()
  const [formData, setFormData] = useState<SignupForm>({
    username: "",
    password: "",
    confirmPassword: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<Partial<SignupForm>>({})
  const [apiError, setApiError] = useState<string>("")
  const [successMessage, setSuccessMessage] = useState<string>("")

  // 폼 유효성 검사
  const validateForm = (): boolean => {
    const newErrors: Partial<SignupForm> = {}

    // Username 검사 - 백엔드와 일치: 2~20글자, 영문/숫자/대시/언더스코어/아포스트로피/마침표
    if (!formData.username.trim()) {
      newErrors.username = "Username is required"
    } else if (!formData.username.match(/^[a-zA-Z0-9\-_'.]{2,20}$/)) {
      newErrors.username =
        "Username must be 2-20 characters and contain only letters, numbers, dash, underscore, apostrophe, or period"
    }

    // Password 검사 - 백엔드와 일치: 8~64글자, 영문+숫자+특수문자 포함
    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 8 || formData.password.length > 64) {
      newErrors.password = "Password must be 8-64 characters"
    } else if (
      !/^(?=.*[A-Za-z])(?=.*\d)(?=.*[\x21-\x2F\x3A-\x40\x5B-\x60\x7B-\x7E])[A-Za-z\d\x21-\x2F\x3A-\x40\x5B-\x60\x7B-\x7E]{8,64}$/.test(
        formData.password,
      )
    ) {
      newErrors.password = "Password must contain at least one letter, one number, and one special character"
    }

    // Confirm Password 검사
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof SignupForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // 입력 시 해당 필드의 에러 제거
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
    // API 에러 제거
    if (apiError) {
      setApiError("")
    }
  }

  // 🔧 수정: 자동 로그인 함수 - 사용자 정보만 반환
  const performAutoLogin = async (username: string, password: string): Promise<boolean> => {
    try {
      const loginResponse = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          username: username.trim(),
          password: password,
        }),
      })

      const loginData: LoginResponse = await loginResponse.json()
      console.log("🔐 자동 로그인 응답:", loginData)

      if (loginResponse.ok && loginData.success && loginData.user) {
        // 🔧 수정: login 함수에 사용자 정보만 전달
        console.log("✅ 자동 로그인 성공 - AuthProvider에 저장")
        login(loginData.user) // 🔧 수정: 1개 인수만 전달
        return true
      }

      console.log("❌ 자동 로그인 실패:", loginData.message)
      return false
    } catch (error) {
      console.error("❌ 자동 로그인 오류:", error)
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setApiError("")
    setSuccessMessage("")

    try {
      // 1. 회원가입 요청
      const signupResponse = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username.trim(),
          password: formData.password,
        }),
      })

      const signupData: SignupResponse = await signupResponse.json()

      if (signupResponse.ok && signupData.success) {
        setSuccessMessage("Account created successfully! Logging you in...")

        // 2. 자동 로그인 시도
        const loginSuccess = await performAutoLogin(formData.username, formData.password)

        if (loginSuccess) {
          // 🔧 수정: 즉시 리다이렉트 (setTimeout 제거)
          console.log("🏠 홈페이지로 리다이렉트")
          router.push("/")
        } else {
          // 로그인 실패 시 로그인 페이지로 리다이렉트
          setSuccessMessage("Account created! Please log in.")
          // 🔧 수정: 즉시 리다이렉트 (setTimeout 제거)
          router.push("/auth/login")
        }
      } else {
        setApiError(signupData.message || "Failed to create account. Please try again.")
      }
    } catch (error) {
      console.error("회원가입 오류:", error)
      setApiError("Network error. Please check your connection and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-slate-100 min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="hero-gradient text-white py-6">
        <div className="w-full max-w-7xl mx-auto px-4">
          <h1 className="text-2xl font-bold mb-2">Create Account</h1>
          <p className="text-base text-slate-300">Join FMRS to access advanced player search features</p>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
              <UserPlus className="text-blue-600" size={24} />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Sign Up</h2>
            <p className="text-sm text-slate-600 mt-1">Create your FMRS account</p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-center gap-2">
              <CheckCircle className="text-green-600 flex-shrink-0" size={16} />
              <div className="text-sm text-green-700">{successMessage}</div>
            </div>
          )}

          {/* API Error */}
          {apiError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
              <AlertCircle className="text-red-600 flex-shrink-0" size={16} />
              <div className="text-sm text-red-700">{apiError}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  id="username"
                  value={formData.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.username ? "border-red-300 bg-red-50" : "border-gray-300"
                  }`}
                  placeholder="Enter your username"
                  disabled={isLoading}
                />
              </div>
              {errors.username && <p className="mt-1 text-xs text-red-600">{errors.username}</p>}
              <p className="mt-1 text-xs text-gray-500">
                2-20 characters: letters, numbers, dash, underscore, apostrophe, or period allowed
              </p>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.password ? "border-red-300 bg-red-50" : "border-gray-300"
                  }`}
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
              <p className="mt-1 text-xs text-gray-500">
                Must be 8-64 characters with at least one letter, number, and special character
              </p>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.confirmPassword ? "border-red-300 bg-red-50" : "border-gray-300"
                  }`}
                  placeholder="Confirm your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !!successMessage}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating Account & Logging In...
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  Create Account
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign in
              </Link>
            </p>
          </div>

          {/* Terms */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              By creating an account, you agree to our{" "}
              <Link href="/terms" className="text-blue-600 hover:text-blue-700">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-blue-600 hover:text-blue-700">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
