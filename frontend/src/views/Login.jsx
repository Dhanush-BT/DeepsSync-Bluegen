import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import apiClient from '../api/client'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { login } = useAuthStore()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await apiClient.post('/auth/login', { email, password })
      login(res.data.user, res.data.token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#faf8ff] text-slate-900 antialiased flex flex-col justify-between">
      {/* Header */}
      <header className="w-full px-6 md:px-12 h-16 flex items-center justify-between border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <img alt="DeepSync Logo" className="w-9 h-9 object-contain rounded-xl shadow-md shadow-sky-600/20" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBWF_O1x8nktIFzLBu6ec0IJe_UJGcEZeXk7FPJaZ7GBTUsUJac695uj8UTV0mCNwoEPONL-5Meh2hHnbnklGbYWbPZBHkDZRSbIam5DL7xbNZq8Xffvxh6g0iSW8b8SE7uF6pFbwz2FKRs7heQ5R7lZuQjfvXVIYitS6zugQ-j-Y9sdyS_ODdymJrrUhPi1MBwQ0KguedFBrfZdfC-VQg1x46rsT_hBKxL8SkLEYoL74YsStHofraothlDSgoDuEafAg0" />
          <div className="flex items-baseline gap-2">
            <span className="font-headline-md font-extrabold tracking-tight text-slate-900 text-lg sm:text-xl">DeepSync</span>
            <span className="text-xs font-semibold text-sky-700 uppercase tracking-wider bg-sky-100/80 px-2 py-0.5 rounded">by Bluegen</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/" className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-700 hover:bg-sky-100/80 border border-sky-200 text-xs font-semibold transition-colors">
            <span className="material-symbols-outlined text-sm">explore</span>
            <span>Explore Public 3D Ocean</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-4rem-4.5rem)]">
        {/* Left Showcase Column */}
        <section className="lg:col-span-7 relative bg-gradient-to-br from-sky-50 via-blue-50/40 to-slate-50 p-8 sm:p-12 lg:p-16 flex flex-col justify-between overflow-hidden border-b lg:border-b-0 lg:border-r border-sky-100">
          {/* Ambient Glow Accents */}
          <div className="absolute -top-24 -left-24 w-[28rem] h-[28rem] bg-sky-200/40 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute top-1/2 right-0 w-96 h-96 bg-cyan-100/50 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-20 left-1/3 w-80 h-80 bg-blue-100/60 rounded-full blur-3xl pointer-events-none"></div>

          {/* Top Tagline */}
          <div className="relative z-10 space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-sky-200/80 text-sky-800 font-medium text-xs shadow-sm backdrop-blur-sm">
                <span className="material-symbols-outlined text-sky-600 text-base">explore</span>
                <span>INCOIS Ocean Modeling & Volumetric 3D Engine</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/70 text-emerald-700 font-semibold text-xs shadow-xs">
                <span className="material-symbols-outlined text-emerald-600 text-sm">school</span>
              </div>
            </div>
            <h1 className="font-headline-lg text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-slate-900 tracking-tight leading-[1.18] max-w-2xl">
              Interactive 3D Ocean Intelligence & Public Discovery Platform.
            </h1>
            <p className="text-slate-600 text-base sm:text-lg max-w-xl leading-relaxed">
              Bridging state-of-the-art volumetric ocean modeling for INCOIS scientists with intuitive, open-access 3D exploration.
            </p>
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <div className="px-3 py-1.5 rounded-lg bg-white/80 border border-sky-200/70 shadow-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-sky-700 text-base">dataset</span>
                <span className="text-xs font-semibold tracking-tight text-slate-800 font-mono">NetCDF / CF-Compliant</span>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-white/80 border border-sky-200/70 shadow-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-cyan-600 text-base">sensors</span>
                <span className="text-xs font-semibold tracking-tight text-slate-800 font-mono">Argo & Glider Telemetry</span>
              </div>
            </div>
          </div>

          {/* Bottom Metrics */}
          <div className="relative z-10 space-y-5">
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white/70 rounded-xl p-3.5 border border-sky-100 shadow-xs">
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">340K+ km²</div>
                <div className="text-xs sm:text-sm text-slate-600 font-medium">Continuous EEZ 3D Coverage</div>
              </div>
              <div className="bg-white/70 rounded-xl p-3.5 border border-sky-100 shadow-xs">
                <div className="text-2xl sm:text-3xl font-extrabold text-sky-700 tracking-tight">&lt; 85ms</div>
                <div className="text-xs sm:text-sm text-slate-600 font-medium">Volumetric Slice Latency</div>
              </div>
            </div>
          </div>
        </section>

        {/* Right Column: Auth Form */}
        <section className="lg:col-span-5 bg-white p-6 sm:p-10 lg:p-12 flex items-center justify-center shadow-xl lg:shadow-none">
          <div className="w-full max-w-md space-y-6">
            <div className="space-y-1.5 text-left">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-semibold mb-1">
                <span className="material-symbols-outlined text-sm">lock</span>
                <span>Secure Access</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Console Access</h2>
              <p className="text-sm text-slate-600">Authenticate with your researcher or institutional credentials</p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-base">error</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-11 px-3.5 pr-11 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 text-sm focus:border-sky-600 focus:bg-white focus:ring-2 focus:ring-sky-600/20 transition-all outline-none"
                    placeholder="researcher@incois.gov.in"
                    required
                  />
                  <div className="absolute right-3.5 top-2.5 flex items-center pointer-events-none text-sky-700">
                    <span className="material-symbols-outlined text-xl">mail</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">Password</label>
                  <Link to="#" className="text-xs font-semibold text-sky-700 hover:text-sky-800">Forgot password?</Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-11 px-3.5 pr-11 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 text-sm focus:border-sky-600 focus:bg-white focus:ring-2 focus:ring-sky-600/20 transition-all outline-none"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2 p-1 text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 active:scale-[0.99] transition-all duration-150"
              >
                <span className="material-symbols-outlined text-lg">login</span>
                <span>{loading ? 'Authenticating...' : 'Authenticate DeepSync Session'}</span>
              </button>
            </form>

            <div className="text-center pt-2">
              <p className="text-xs text-slate-600">
                Don't have an account?{' '}
                <Link to="/signup" className="font-semibold text-sky-700 hover:text-sky-800 transition-colors">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full px-6 md:px-12 py-5 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-slate-200 bg-[#faf8ff] text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <img alt="DeepSync Logo" className="w-5 h-5 object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6dT7-MpeA7TrYqXMNLNHghOsJRKO5zH_w5NMevGaCm8IKudlDtJ04bxVrNv8jb-nX8_wF0K5clPKe-1TlIlWzzPKGbCp2alPt1b_djLZrwTQNlPdngG2G4k7ndwnoykUHR9aQeYPg-Sst_Gjp7_auOaJmQU47cZsqzbkLeVkENs80RDqPdQ1W5xr69wI4cHFfmbzGJO-Tj0A2rOBJA3uYpOOkqlbwnDK153MsTCJPP0q-pDU0HdgisydPOaqtk5X85Ls" />
          <span className="font-bold text-slate-800">DeepSync by Bluegen</span>
          <span className="text-slate-400">•</span>
          <span>© 2026 DeepSync by Bluegen for INCOIS</span>
        </div>
        <nav className="flex flex-wrap items-center gap-5 font-medium">
          <a href="#" className="text-slate-600 hover:text-sky-700 transition-colors">API Docs</a>
          <a href="#" className="text-sky-700 font-semibold hover:text-sky-800 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Live Model Feeds</span>
          </a>
        </nav>
      </footer>
    </div>
  )
}
