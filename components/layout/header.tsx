"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X, LogOut, User } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, isAuthenticated, logout, isLoading } = useAuth()

  // 디버깅을 위한 로깅
  console.log("🔍 Header 상태:", { user, isAuthenticated, isLoading })

  const handleLogout = () => {
    logout()
    setIsMenuOpen(false)
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <nav className="w-full max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-lg md:text-xl font-bold text-slate-800 flex-shrink-0">
          FMRS
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4">
          <Link href="/players/detail-search" className="text-slate-600 hover:text-blue-600 transition duration-300">
            Search
          </Link>

          {/* 인증 상태 표시 */}
          <div className="flex items-center space-x-2 ml-4">
            {isLoading ? (
              // 로딩 중
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                <span className="text-sm text-slate-500">Loading...</span>
              </div>
            ) : isAuthenticated && user ? (
              // 로그인된 사용자
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-slate-600">
                  <User size={16} />
                  <span className="text-sm font-medium">{user.username}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-3 py-2 text-sm text-slate-600 hover:text-red-600 transition duration-300"
                >
                  <LogOut size={16} className="mr-1" />
                  Logout
                </button>
              </div>
            ) : (
              // 로그인되지 않은 사용자
              <>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center px-3 py-2 text-sm text-slate-600 hover:text-blue-600 transition duration-300"
                >
                  Login
                </Link>
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300 text-sm"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-lg md:hidden">
            <div className="px-4 py-2 space-y-2">
              <Link
                href="/players/detail-search"
                className="block py-3 text-slate-600 hover:text-blue-600 transition duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                Advanced Search
              </Link>

              <div className="border-t border-gray-200 pt-2">
                {isLoading ? (
                  // 모바일 로딩
                  <div className="flex items-center py-3 text-slate-500">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                    Loading...
                  </div>
                ) : isAuthenticated && user ? (
                  // 모바일 - 로그인된 사용자
                  <>
                    <div className="flex items-center py-3 text-slate-600">
                      <User size={16} className="mr-2" />
                      <span className="font-medium">{user.username}</span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full py-3 text-red-600 hover:text-red-700 transition duration-300"
                    >
                      <LogOut size={16} className="mr-2" />
                      Logout
                    </button>
                  </>
                ) : (
                  // 모바일 - 로그인되지 않은 사용자
                  <>
                    <Link
                      href="/auth/login"
                      className="block py-3 text-slate-600 hover:text-blue-600 transition duration-300"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      href="/auth/signup"
                      className="block py-3 text-blue-600 hover:text-blue-700 transition duration-300 font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
