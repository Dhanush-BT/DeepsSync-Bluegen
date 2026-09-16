import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import { useState, useRef, useEffect } from 'react'

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAuthStore()
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const dropdownRef = useRef(null)

  const isActive = (path) => location.pathname === path

  const userName = user?.fullName || user?.empIdOrEmail || user?.name || 'Admin Officer'
  const userInitials = userName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('') || 'AD'

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    setUserDropdownOpen(false)
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-9 h-9 rounded-xl overflow-hidden ring-1 ring-sky-500/20 shadow-xs transition-transform duration-200 group-hover:scale-105 bg-white flex items-center justify-center p-0.5">
            <img
              alt="DeepSync Logo"
              className="w-full h-full object-contain"
              src="/images/deepsync-logo.png"
            />
          </div>
          <div className="flex flex-col leading-none">
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-extrabold tracking-tight text-slate-900">DEEPSYNC</span>
              <span className="px-1.5 py-0.5 text-[9px] font-bold tracking-wider uppercase bg-sky-100 text-sky-800 rounded">
                BLUEGEN
              </span>
            </div>
            <span className="text-[10px] font-medium text-slate-400 tracking-tight mt-0.5">
              INCOIS · MoES
            </span>
          </div>
        </Link>

        {/* Center: Clean, Spaced Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 text-xs font-semibold">
          <Link
            to="/"
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              isActive('/')
                ? 'text-sky-700 bg-sky-50 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Home
          </Link>
          <Link
            to="/dashboard"
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              isActive('/dashboard')
                ? 'text-sky-700 bg-sky-50 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Dashboard
          </Link>
          <Link
            to="/geomap"
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              isActive('/geomap')
                ? 'text-sky-700 bg-sky-50 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Geo Map
          </Link>
          <Link
            to="/assistant"
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              isActive('/assistant')
                ? 'text-sky-700 bg-sky-50 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            AI Assistant
          </Link>

          {/* Single clean Data Manager tab for Admin */}
          {isAuthenticated && (
            <Link
              to="/datamanager"
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                isActive('/datamanager')
                  ? 'text-sky-700 bg-sky-50 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span className="material-symbols-outlined text-sm">database</span>
              <span>Data Manager</span>
            </Link>
          )}
        </nav>

        {/* Right: User Profile Menu or Sign In Button */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 pl-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors shadow-2xs focus:outline-none"
                aria-label="User menu"
              >
                <div className="w-7 h-7 rounded-lg bg-sky-900 text-white font-bold text-xs flex items-center justify-center">
                  {userInitials}
                </div>
                <div className="hidden sm:flex flex-col text-left leading-none pr-1">
                  <span className="text-xs font-semibold text-slate-800 max-w-[120px] truncate">
                    {userName}
                  </span>
                  <span className="text-[10px] text-sky-700 font-medium mt-0.5">Admin</span>
                </div>
                <span className="material-symbols-outlined text-sm text-slate-400">
                  {userDropdownOpen ? 'expand_less' : 'expand_more'}
                </span>
              </button>

              {/* Clean Popover Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200/90 shadow-lg py-2 z-50 animate-fade-in">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900 truncate">{userName}</p>
                    <p className="text-[10px] text-slate-500 font-medium">INCOIS Administrator</p>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/datamanager"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-sky-50 hover:text-sky-800 transition-colors"
                    >
                      <span className="material-symbols-outlined text-base text-sky-600">upload_file</span>
                      <span>Data Ingestion Console</span>
                    </Link>

                    <Link
                      to="/settings"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-sky-50 hover:text-sky-800 transition-colors"
                    >
                      <span className="material-symbols-outlined text-base text-slate-500">settings</span>
                      <span>Profile &amp; Settings</span>
                    </Link>
                  </div>

                  <div className="pt-1 border-t border-slate-100">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors text-left"
                    >
                      <span className="material-symbols-outlined text-base text-red-500">logout</span>
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-all"
            >
              <span className="material-symbols-outlined text-sm">lock</span>
              <span>Admin Sign In</span>
            </Link>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
            aria-label="Toggle navigation"
          >
            <span className="material-symbols-outlined text-xl">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1 text-sm font-medium text-slate-700">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg hover:bg-slate-50"
          >
            Home
          </Link>
          <Link
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg hover:bg-slate-50"
          >
            Dashboard
          </Link>
          <Link
            to="/geomap"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg hover:bg-slate-50"
          >
            Geo Map
          </Link>
          <Link
            to="/assistant"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg hover:bg-slate-50"
          >
            AI Assistant
          </Link>
          {isAuthenticated && (
            <>
              <Link
                to="/datamanager"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg ${
                  isActive('/datamanager')
                    ? 'text-sky-700 bg-sky-50 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                Data Manager
              </Link>
              <Link
                to="/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50"
              >
                Profile &amp; Settings
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  handleLogout()
                }}
                className="block w-full text-left px-3 py-2 rounded-lg text-red-600 hover:bg-red-50"
              >
                Sign out
              </button>
            </>
          )}
        </div>
      )}
    </header>
  )
}
