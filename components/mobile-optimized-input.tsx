"use client"

import type React from "react"

import { forwardRef } from "react"

interface MobileOptimizedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

const MobileOptimizedInput = forwardRef<HTMLInputElement, MobileOptimizedInputProps>(
  ({ label, error, icon, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <label className="block text-sm md:text-xs font-medium text-gray-700 mb-2 md:mb-1">{label}</label>}
        <div className="relative">
          {icon && <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">{icon}</div>}
          <input
            ref={ref}
            className={`
              w-full 
              ${icon ? "pl-10" : "pl-3"} 
              pr-3 
              py-3 md:py-2 
              text-base md:text-sm 
              border border-gray-300 
              rounded-lg md:rounded-md 
              shadow-sm 
              focus:outline-none 
              focus:ring-2 
              focus:ring-blue-500 
              focus:border-blue-500
              transition-colors
              ${error ? "border-red-300 bg-red-50" : ""}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    )
  },
)

MobileOptimizedInput.displayName = "MobileOptimizedInput"

export default MobileOptimizedInput
