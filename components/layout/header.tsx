"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X } from "lucide-react"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <nav className="w-full max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-lg md:text-xl font-bold text-slate-800 flex-shrink-0">
          FMRS
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-4">
          <Link href="/players/detail-search" className="text-slate-600 hover:text-blue-600 transition duration-300">
            Search
          </Link>
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
            <div className="px-4 py-2">
              <Link
                href="/players/detail-search"
                className="block py-3 text-slate-600 hover:text-blue-600 transition duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                Advanced Search
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
