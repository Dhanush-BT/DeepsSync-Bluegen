import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import apiClient from '../api/client'

export default function Signup() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    employeeId: '',
    division: 'ODICT',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const validatePassword = (pwd) => {
    const checks = {
      length: pwd.length >= 12,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      special: /[!@#$%^&*()_+]/.test(pwd),
    }
    return checks
  }

  const passwordChecks = validatePassword(formData.password)
  const passwordStrength = Object.values(passwordChecks).filter(Boolean).length

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (!agreeTerms) {
      setError('You must agree to Terms of Service and Privacy Policy')
      setLoading(false)
      return
    }

    try {
      await apiClient.post('/auth/signup', formData)
      setSuccess('Account created! Admin approval pending.')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-between">
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
          <a href="#" className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-700 hover:bg-sky-100/80 border border-sky-200 text-xs font-semibold transition-colors">
            <span className="material-symbols-outlined text-sm">public</span>
            <span>Explore Public 3D Ocean</span>
          </a>
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
                <span>Smart India Hackathon 2025</span>
              </div>
            </div>
            <h1 className="font-headline-lg text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-slate-900 tracking-tight leading-[1.18] max-w-2xl">
              Interactive 3D Ocean Intelligence & Public Discovery Platform.
            </h1>
            <p className="text-slate-600 text-base sm:text-lg max-w-xl leading-relaxed">
              Bridging state-of-the-art volumetric ocean modeling with INCOIS scientists and intuitive, open-access 3D exploration.
            </p>
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <div className="px-3 py-1.5 rounded-lg bg-white/80 border border-sky-200/70 shadow-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-sky-700 text-base">dataset</span>
                <span className="text-xs font-semibold tracking-tight text-slate-800 font-mono">NetCDF / CF-Compliant</span>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-white/80 border border-sky-200/70 shadow-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-cyan-600 text-base">sensors</span>
                <span className="text-xs font-semibold tracking-tight text-slate-800 font-mono">Argo Telemetry</span>
              </div>
            </div>
          </div>

          {/* Bottom Stats */}
          <div className="relative z-10 space-y-5">
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white/70 rounded-xl p-3.5 border border-sky-100 shadow-xs">
                <div className="font-extrabold text-slate-900 tracking-tight">340K+ km²</div>
                <div className="text-xs sm:text-sm text-slate-600 font-medium">Continuous EEZ Coverage</div>
              </div>
              <div className="bg-white/70 rounded-xl p-3.5 border border-sky-100 shadow-xs">
                <div className="font-extrabold text-sky-700 tracking-tight">&lt; 85ms</div>
                <div className="text-xs sm:text-sm text-slate-600 font-medium">Volumetric Latency</div>
              </div>
            </div>
          </div>
        </section>

        {/* Right Form Column */}
        <section className="lg:col-span-5 bg-white p-6 sm:p-10 lg:p-12 flex items-center justify-center shadow-xl lg:shadow-none overflow-y-auto max-h-[calc(100vh-4rem)]">
          <div className="w-full max-w-md space-y-6 py-4">
            <div className="space-y-1.5 text-left">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-semibold mb-1">
                <span className="material-symbols-outlined text-sm">lock</span>
                <span>Secure Access</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Register Analyst</h2>
              <p className="text-sm text-slate-600">Provision your INCOIS ocean modeling credential profile</p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-base">error</span>
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-base">check_circle</span>
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full h-11 px-3.5 pr-11 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 text-sm focus:border-sky-600 focus:bg-white focus:ring-2 focus:ring-sky-600/20 transition-all outline-none"
                    placeholder="e.g. Dr. Tarun M."
                    required
                  />
                  <div className="absolute right-3.5 top-2.5 flex items-center pointer-events-none text-sky-700">
                    <span className="material-symbols-outlined text-xl">person</span>
                  </div>
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">INCOIS Email</label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full h-11 px-3.5 pr-11 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 text-sm focus:border-sky-600 focus:bg-white focus:ring-2 focus:ring-sky-600/20 transition-all outline-none"
                    placeholder="username@incois.gov.in"
                    required
                  />
                  <div className="absolute right-3.5 top-2.5 flex items-center pointer-events-none text-sky-700">
                    <span className="material-symbols-outlined text-xl">mail</span>
                  </div>
                </div>
              </div>

              {/* Employee ID & Division */}
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">Official INCOIS ID</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="employeeId"
                      value={formData.employeeId}
                      onChange={handleChange}
                      className="w-full h-11 px-3.5 pr-11 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 text-sm focus:border-sky-600 focus:bg-white focus:ring-2 focus:ring-sky-600/20 transition-all outline-none font-mono"
                      placeholder="e.g. 002, 009, 017, 024"
                      required
                    />
                    <div className="absolute right-3.5 top-2.5 flex items-center pointer-events-none text-sky-700">
                      <span className="material-symbols-outlined text-xl">badge</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500">Directory roster ID (002–101) for Scientist / Staff authentication</p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">Designated Division & Group</label>
                  <div className="relative">
                    <select
                      name="division"
                      value={formData.division}
                      onChange={handleChange}
                      className="w-full h-11 px-3.5 pr-10 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-sm focus:border-sky-600 focus:bg-white focus:ring-2 focus:ring-sky-600/20 transition-all outline-none cursor-pointer appearance-none"
                    >
                      <option value="ODICT">ODICT (Ocean Data & Info & ICT)</option>
                      <option value="OMARS">OMARS (Ocean Modeling & Applied Research)</option>
                      <option value="OMDA">OMDA (Ocean Modeling & Data Assimilation)</option>
                      <option value="OON">OON (Ocean Observation Network)</option>
                      <option value="OOS">OOS (Ocean Observation Systems)</option>
                      <option value="ARO">ARO (Applied Research & Oceanography)</option>
                      <option value="ICT">ICT (Information & Comm Tech)</option>
                      <option value="ADMIN">P&S / P&GA / ESS (Administration)</option>
                      <option value="DIR">Directorate & Executive Administration</option>
                    </select>
                    <div className="absolute right-3.5 top-2.5 flex items-center pointer-events-none text-sky-700">
                      <span className="material-symbols-outlined text-xl">corporate_fare</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">Create Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full h-11 px-3.5 pr-11 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 text-sm focus:border-sky-600 focus:bg-white focus:ring-2 focus:ring-sky-600/20 transition-all outline-none"
                    placeholder="Create a strong password"
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

                {/* Password Strength Policy */}
                <div className="space-y-2.5 pt-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 uppercase tracking-wider">Password Policy</span>
                    <span
                      className={`inline-flex items-center gap-1 font-semibold ${
                        passwordStrength === 5
                          ? 'text-emerald-600'
                          : passwordStrength >= 3
                          ? 'text-amber-600'
                          : 'text-slate-500'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          passwordStrength === 5
                            ? 'bg-emerald-500'
                            : passwordStrength >= 3
                            ? 'bg-amber-500'
                            : 'bg-slate-400'
                        }`}
                      ></span>
                      {passwordStrength === 5
                        ? 'Strong'
                        : passwordStrength >= 3
                        ? 'Fair'
                        : 'Weak'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`flex-1 h-1.5 rounded-full ${
                          passwordStrength >= i ? 'bg-emerald-500' : 'bg-slate-200'
                        }`}
                      ></div>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 gap-1.5 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                    <div
                      className={`flex items-center gap-2 ${
                        passwordChecks.length ? 'text-emerald-700' : 'text-slate-600'
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">
                        {passwordChecks.length ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                      <span>Minimum 12 characters</span>
                    </div>
                    <div
                      className={`flex items-center gap-2 ${
                        passwordChecks.uppercase && passwordChecks.lowercase
                          ? 'text-emerald-700'
                          : 'text-slate-600'
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">
                        {passwordChecks.uppercase && passwordChecks.lowercase
                          ? 'check_circle'
                          : 'radio_button_unchecked'}
                      </span>
                      <span>Uppercase and lowercase letters</span>
                    </div>
                    <div
                      className={`flex items-center gap-2 ${
                        passwordChecks.number ? 'text-emerald-700' : 'text-slate-600'
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">
                        {passwordChecks.number ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                      <span>At least one number (0-9)</span>
                    </div>
                    <div
                      className={`flex items-center gap-2 ${
                        passwordChecks.special ? 'text-emerald-700' : 'text-slate-600'
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">
                        {passwordChecks.special ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                      <span>At least one special symbol (!@#$%^&*)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Terms & Conditions */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 mt-0.5 border border-slate-300 text-blue-600 focus:ring-sky-500 focus:ring-offset-0 rounded"
                  />
                  <span className="text-xs text-slate-600 leading-relaxed">
                    I agree to the{' '}
                    <a href="#" className="text-sky-700 font-semibold hover:underline">
                      Terms of Service
                    </a>
                    {' '}and{' '}
                    <a href="#" className="text-sky-700 font-semibold hover:underline">
                      Privacy Policy
                    </a>
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !agreeTerms}
                className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 active:scale-[0.99] transition-all duration-150"
              >
                <span className="material-symbols-outlined text-lg">person_add</span>
                <span>{loading ? 'Creating Account...' : 'Create My Account'}</span>
              </button>
            </form>

            {/* Login Link */}
            <div className="text-center pt-2">
              <span className="text-xs text-slate-600">
                Already registered?{' '}
                <Link to="/login" className="font-semibold text-sky-700 hover:text-sky-800 transition-colors">
                  Sign in here
                </Link>
              </span>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full px-6 md:px-12 py-5 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-slate-200 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <img alt="DeepSync" className="w-5 h-5 object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6dT7-MpeA7TrYqXMNLNHghOsJRKO5zH_w5NMevGaCm8IKudlDtJ04bxVrNv8jb-nX8_wF0K5clPKe-1TlIlWzzPKGbCp2alPt1b_djLZrwTQNlPdngG2G4k7ndwnoykUHR9aQeYPg-Sst_Gjp7_auOaJmQU47cZsqzbkLeVkENs80RDqPdQ1W5xr69wI4cHFfmbzGJO-Tj0A2rOBJA3uYpOOkqlbwnDK153MsTCJPP0q-pDU0HdgisydPOaqtk5X85Ls" />
          <span className="font-bold text-slate-800">DeepSync by Bluegen</span>
          <span className="text-slate-400">•</span>
          <span>© 2026 DeepSync by INCOIS</span>
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
