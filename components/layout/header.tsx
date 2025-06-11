import Link from "next/link"

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <nav className="w-full max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-lg font-bold text-slate-800 flex-shrink-0">
          FMRS
        </Link>
        <div className="space-x-4">
          <Link href="/players/detail-search" className="text-slate-600 hover:text-blue-600 transition duration-300">
            Search
          </Link>
        </div>
      </nav>
    </header>
  )
}
