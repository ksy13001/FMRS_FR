"use client"

import type React from "react"

import { forwardRef } from "react"

interface MobileTouchAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  minHeight?: string
  asButton?: boolean
}

const MobileTouchArea = forwardRef<HTMLDivElement, MobileTouchAreaProps>(
  ({ children, minHeight = "44px", asButton = false, className = "", ...props }, ref) => {
    const baseClasses = `
      relative
      ${asButton ? "cursor-pointer select-none" : ""}
      transition-colors
      duration-150
      active:bg-gray-50
      touch-manipulation
    `

    return (
      <div ref={ref} className={`${baseClasses} ${className}`} style={{ minHeight }} {...props}>
        {children}
      </div>
    )
  },
)

MobileTouchArea.displayName = "MobileTouchArea"

export default MobileTouchArea
