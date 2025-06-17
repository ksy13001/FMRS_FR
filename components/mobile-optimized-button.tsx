"use client"

import type React from "react"

import { forwardRef } from "react"

interface MobileOptimizedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost"
  size?: "sm" | "md" | "lg"
  fullWidth?: boolean
  loading?: boolean
  icon?: React.ReactNode
}

const MobileOptimizedButton = forwardRef<HTMLButtonElement, MobileOptimizedButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      fullWidth = false,
      loading = false,
      icon,
      children,
      className = "",
      disabled,
      ...props
    },
    ref,
  ) => {
    const baseClasses =
      "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95"

    const variantClasses = {
      primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-300",
      secondary: "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 disabled:bg-gray-300",
      outline:
        "border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500 disabled:border-blue-300 disabled:text-blue-300",
      ghost: "text-gray-600 hover:bg-gray-100 focus:ring-gray-500 disabled:text-gray-300",
    }

    const sizeClasses = {
      sm: "px-3 py-2 text-sm min-h-[36px] md:min-h-[32px]",
      md: "px-4 py-3 text-base md:text-sm md:py-2 min-h-[44px] md:min-h-[36px]",
      lg: "px-6 py-4 text-lg md:text-base md:py-3 min-h-[52px] md:min-h-[44px]",
    }

    const widthClass = fullWidth ? "w-full" : ""

    return (
      <button
        ref={ref}
        className={`
          ${baseClasses}
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${widthClass}
          ${disabled || loading ? "cursor-not-allowed opacity-50" : ""}
          ${className}
        `}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>}
        {!loading && icon && <span className="mr-2">{icon}</span>}
        {children}
      </button>
    )
  },
)

MobileOptimizedButton.displayName = "MobileOptimizedButton"

export default MobileOptimizedButton
