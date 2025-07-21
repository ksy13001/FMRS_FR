"use client"

import { useState, useRef, useEffect } from "react"
import { User, LogOut, Settings, ChevronDown } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

export default function UserMenu() {
  const { user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleLogout = () => {
    logout()
    setIsOpen(false)
  }

  if (!user) return null

  return (
    <div className="relative" ref={menuRef}>
      {/* User Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-md text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors"
      >
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <User size={16} className="text-blue-600" />
        </div>
        <span className="text-sm font-medium hidden sm:block">{user.username}</span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
          {/* User Info */}
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">{user.username}</p>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <button
              onClick={() => {
                setIsOpen(false)
                // TODO: 프로필 페이지로 이동
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Settings size={16} className="mr-3" />
              Profile Settings
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={16} className="mr-3" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
