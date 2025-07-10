"use client"

import { Suspense } from "react"
import LoginContent from "./login-content"

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-slate-100 min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  )
}
