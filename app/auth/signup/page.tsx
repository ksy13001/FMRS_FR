"use client"

import { Suspense } from "react"
import SignupContent from "./signup-content"

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-slate-100 min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      }
    >
      <SignupContent />
    </Suspense>
  )
}
