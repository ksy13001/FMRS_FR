"use client"

import { useState } from "react"
import { LogOut } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

interface LogoutButtonProps {
  variant?: "default" | "minimal" | "danger"
  size?: "sm" | "md" | "lg"
  showIcon?: boolean
  showConfirmation?: boolean
  className?: string
}

export default function LogoutButton({
  variant = "default",
  size = "md",
  showIcon = true,
  showConfirmation = false,
  className = "",
}: LogoutButtonProps) {
  const { logout } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleLogout = async () => {
    if (showConfirmation && !showConfirm) {
      setShowConfirm(true)
      return
    }

    setIsLoading(true)
    try {
      await logout()
    } catch (error) {
      console.error("로그아웃 오류:", error)
    } finally {
      setIsLoading(false)
      setShowConfirm(false)
    }
  }

  const handleCancel = () => {
    setShowConfirm(false)
  }

  const getVariantClasses = () => {
    switch (variant) {
      case "minimal":
        return "text-slate-600 hover:text-red-600 bg-transparent hover:bg-red-50"
      case "danger":
        return "text-white bg-red-600 hover:bg-red-700 border-red-600"
      default:
        return "text-slate-600 hover:text-red-600 bg-white hover:bg-red-50 border-slate-300 hover:border-red-300"
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "px-2 py-1 text-xs"
      case "lg":
        return "px-6 py-3 text-base"
      default:
        return "px-3 py-2 text-sm"
    }
  }

  if (showConfirm) {
    return (
      <div className="inline-flex items-center space-x-2">
        <span className="text-sm text-slate-600">Are you sure?</span>
        <button
          onClick={handleLogout}
          disabled={isLoading}
          className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
        >
          {isLoading ? "..." : "Yes"}
        </button>
        <button
          onClick={handleCancel}
          className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          No
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className={`
        inline-flex items-center justify-center
        border rounded-md
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${getVariantClasses()}
        ${getSizeClasses()}
        ${className}
      `}
    >
      {isLoading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
      ) : (
        <>
          {showIcon && <LogOut size={16} className="mr-1" />}
          Logout
        </>
      )}
    </button>
  )
}
