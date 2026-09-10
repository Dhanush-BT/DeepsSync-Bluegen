import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import { useState } from 'react'

export default function Navbar() {
  const location = useLocation()
  const { isAuthenticated, user, logout } = useAuthStore()
  const [docsOpen, setDocsOpen] = useState(false)

  const isActive = (path) => location.pathname === path

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-sky-100/90 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <Link
            to="/"
            className="flex items-center space-x-3 group"
            title="DeepSync Home"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-ocean-600 flex items-center justify-center text-white font-bold group-hover:scale-105 transition-transform">
              D
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-xl font-bold tracking-tight text-slate-900">DeepSync</span>
              <span className="text-[10px] font-bold tracking-widest text-sky-600 uppercase bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200/80">
                By Bluegen
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          <Link
            to="/"
            className={`px-3.5 py-2 text-sm font-semibold rounded-lg transition-colors ${
              isActive('/') 
                ? 'text-ocean-700 after:h-0.5 after:bg-ocean-600' 
                : 'text-slate-600 hover:text-ocean-700 hover:bg-sky-50/60'
            }`}
          >
            Home
          </Link>
          <Link
            to="/dashboard"
            className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${
              isActive('/dashboard')
                ? 'text-ocean-700 bg-sky-50/60'
                : 'text-slate-600 hover:text-ocean-700 hover:bg-sky-50/60'
            }`}
          >
            Dashboard
          </Link>
          <Link
            to="/geomap"
            className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${
              isActive('/geomap')
                ? 'text-ocean-700 bg-sky-50/60'
                : 'text-slate-600 hover:text-ocean-700 hover:bg-sky-50/60'
            }`}
          >
            Geo Map
          </Link>
          <Link
            to="/assistant"
            className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${
              isActive('/assistant')
                ? 'text-ocean-700 bg-sky-50/60'
                : 'text-slate-600 hover:text-ocean-700 hover:bg-sky-50/60'
            }`}
          >
            AI Assistant
          </Link>

          {/* Docs Dropdown */}
          <div className="relative group">
            <button
              className="inline-flex items-center px-3.5 py-2 text-sm font-medium text-slate-600 group-hover:text-ocean-700 group-hover:bg-sky-50/60 rounded-lg transition-colors"
              onMouseEnter={() => setDocsOpen(true)}
              onMouseLeave={() => setDocsOpen(false)}
            >
              <span>Docs</span>
              <svg className="w-3.5 h-3.5 ml-1 text-slate-400 group-hover:text-ocean-600 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              </svg>
            </button>
            {docsOpen && (
              <div className="absolute left-0 mt-1 w-52 bg-white rounded-xl shadow-lg border border-sky-100 py-1.5 z-50">
                <a href="#docs" className="block px-4 py-2 text-xs font-medium text-slate-700 hover:bg-sky-50 hover:text-ocean-700">
                  API Documentation
                </a>
                <a href="#docs" className="block px-4 py-2 text-xs font-medium text-slate-700 hover:bg-sky-50 hover:text-ocean-700">
                  Forecaster Manual
                </a>
                <a href="#docs" className="block px-4 py-2 text-xs font-medium text-slate-700 hover:bg-sky-50 hover:text-ocean-700">
                  Geo Map Guide
                </a>
              </div>
            )}
          </div>
        </nav>

        {/* Auth Section */}
        <div className="flex items-center space-x-3.5">
          {isAuthenticated ? (
            <div className="flex items-center space-x-3">
              <span className="text-xs sm:text-sm font-medium text-slate-600">
                {user?.name || 'Admin'}
              </span>
              <button
                onClick={logout}
                className="inline-flex items-center justify-center px-4 py-1.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-sky-50/60 hover:border-sky-300 hover:text-ocean-600 transition-all shadow-sm"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-4 py-1.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-sky-50/60 hover:border-sky-300 hover:text-ocean-600 transition-all shadow-sm"
            >
              Admin sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
