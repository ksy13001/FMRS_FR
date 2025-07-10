"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"

export default function AuthDebug() {
  const [isClient, setIsClient] = useState(false)
  const [browserCookies, setBrowserCookies] = useState("")
  const [localStorageData, setLocalStorageData] = useState("")
  const { user, isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    setIsClient(true)
    updateDebugInfo()
  }, [])

  const updateDebugInfo = () => {
    if (typeof window !== "undefined") {
      setBrowserCookies(document.cookie || "No cookies")
      setLocalStorageData(localStorage.getItem("user") || "No user data")
    }
  }

  const testAuthStatus = async () => {
    try {
      const response = await fetch("/api/auth/status", {
        credentials: "include",
      })
      const data = await response.json()
      console.log("Auth Status Test:", { status: response.status, data })
      alert(`Auth Status: ${response.status} - ${JSON.stringify(data)}`)
    } catch (error) {
      console.error("Auth Status Test Error:", error)
      alert(`Auth Status Error: ${error}`)
    }
  }

  const testTokenRefresh = async () => {
    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
      })
      const data = await response.json()
      console.log("Token Refresh Test:", { status: response.status, data })
      alert(`Token Refresh: ${response.status} - ${JSON.stringify(data)}`)
      updateDebugInfo()
    } catch (error) {
      console.error("Token Refresh Test Error:", error)
      alert(`Token Refresh Error: ${error}`)
    }
  }

  if (!isClient) {
    return (
      <Card className="w-full max-w-2xl mx-auto mt-4">
        <CardHeader>
          <CardTitle>🔧 Auth Debug Panel</CardTitle>
        </CardHeader>
        <CardContent>
          <div>Loading debug information...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto mt-4">
      <CardHeader>
        <CardTitle>🔧 Auth Debug Panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <strong>Auth Provider State:</strong>
          <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto max-h-32">
            {JSON.stringify(
              {
                user,
                isAuthenticated,
                isLoading,
              },
              null,
              2,
            )}
          </pre>
        </div>

        <div>
          <strong>Browser Cookies:</strong>
          <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto max-h-32">{browserCookies}</pre>
        </div>

        <div>
          <strong>LocalStorage User:</strong>
          <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto max-h-32">{localStorageData}</pre>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button onClick={testAuthStatus} size="sm" variant="outline">
            Test Auth Status
          </Button>
          <Button onClick={testTokenRefresh} size="sm" variant="outline">
            Test Token Refresh
          </Button>
          <Button onClick={updateDebugInfo} size="sm" variant="outline">
            Refresh Debug Info
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
