"use client"

import type React from "react"

import { AlertCircle, CheckCircle, Eye, EyeOff, Lock, LogIn, User } from "lucide-react"
import type { LoginFormData, LoginFormErrors } from "@/lib/login-flow-utils"

interface LoginFormStatesProps {
  formData: LoginFormData
  errors: LoginFormErrors
  apiError: string
  successMessage: string
  isLoading: boolean
  showPassword: boolean
  onInputChange: (field: keyof LoginFormData, value: string) => void
  onTogglePassword: () => void
  onSubmit: (e: React.FormEvent) => void
}

export function LoginFormStates({
  formData,
  errors,
  apiError,
  successMessage,
  isLoading,
  showPassword,
  onInputChange,
  onTogglePassword,
  onSubmit,
}: LoginFormStatesProps) {
  return (
    <>
      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-center gap-2">
          <CheckCircle className="text-green-600 flex-shrink-0" size={16} />
          <div className="text-sm text-green-700">
            {successMessage}
            <div className="text-xs mt-1">Redirecting to home page...</div>
          </div>
        </div>
      )}

      {/* API Error */}
      {apiError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
          <AlertCircle className="text-red-600 flex-shrink-0" size={16} />
          <div className="text-sm text-red-700">{apiError}</div>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
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
              onChange={(e) => onInputChange("username", e.target.value)}
              className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                errors.username ? "border-red-300 bg-red-50" : "border-gray-300"
              }`}
              placeholder="Enter your username"
              disabled={isLoading}
            />
          </div>
          {errors.username && <p className="mt-1 text-xs text-red-600">{errors.username}</p>}
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
              onChange={(e) => onInputChange("password", e.target.value)}
              className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                errors.password ? "border-red-300 bg-red-50" : "border-gray-300"
              }`}
              placeholder="Enter your password"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={onTogglePassword}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              disabled={isLoading}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
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
              Signing In...
            </>
          ) : (
            <>
              <LogIn size={18} />
              Sign In
            </>
          )}
        </button>
      </form>
    </>
  )
}
