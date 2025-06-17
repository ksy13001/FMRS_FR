export default function Footer() {
  return (
    <footer className="bg-slate-800 text-white py-6 md:py-4 text-xs">
      <div className="w-full max-w-7xl mx-auto px-4">
        <div className="text-center">
          <div className="mb-3 md:mb-2">
            <h3 className="text-sm font-semibold mb-2 md:mb-1">About FMRS</h3>
            <p className="text-slate-400 text-xs leading-relaxed md:leading-normal">
              Comprehensive, up-to-date information about professional soccer players worldwide.
            </p>
          </div>
          <div className="pt-4 md:pt-3 border-t border-slate-700">
            <p className="text-slate-400 text-xs">&copy; 2025 FMRS. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
