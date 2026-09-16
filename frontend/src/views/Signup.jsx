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
  const [agreeTerms, setAgreeTerms] = useState(true)
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const validatePassword = (pwd) => {
    return {
      length: pwd.length >= 12,
      mixedCase: /[A-Z]/.test(pwd) && /[a-z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      special: /[!@#$%^&*()_+]/.test(pwd),
      noMatch: pwd.length > 0 && !pwd.toLowerCase().includes('incois') && !pwd.toLowerCase().includes('password'),
    }
  }

  const passwordChecks = validatePassword(formData.password)
  const passwordStrength = Object.values(passwordChecks).filter(Boolean).length

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (!agreeTerms) {
      setError('You must agree to the Terms of Service and Privacy Policy.')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.')
      setLoading(false)
      return
    }

    try {
      const res = await apiClient.post('/auth/signup', formData)
      setSuccess(res.data?.message || 'Account created successfully! Redirecting to login...')
      setTimeout(() => navigate('/login'), 1800)
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="deepsync-page-bg text-slate-900 font-sans antialiased min-h-screen flex flex-col justify-between selection:bg-sky-500 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="w-full px-6 md:px-12 h-16 flex items-center justify-between border-b border-slate-200 sticky top-0 z-50 bg-white/90 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <img
            alt="DeepSync Logo"
            className="w-9 h-9 object-contain rounded-xl shadow-md shadow-sky-600/20"
            src="/images/deepsync-logo.png"
          />
          <div className="flex items-baseline gap-2">
            <span className="font-extrabold tracking-tight text-slate-900 text-lg sm:text-xl">DeepSync</span>
            <span className="text-xs font-semibold text-sky-700 uppercase tracking-wider bg-sky-100/80 px-2 py-0.5 rounded">
              by Bluegen
            </span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-700 hover:bg-sky-100/80 border border-sky-200 text-xs font-semibold transition-colors"
          >
            <span className="material-symbols-outlined text-sm text-sky-600">public</span>
            <span>Explore Public 3D Ocean</span>
          </Link>
        </div>
      </header>

      {/* 50/50 Split Screen Auth Canvas */}
      <main className="flex-1 w-full grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-4rem-4.5rem)]">
        {/* Left Showcase Column */}
        <section className="lg:col-span-7 relative bg-gradient-to-br from-sky-50 via-blue-50/40 to-slate-50 p-8 sm:p-12 lg:p-16 flex flex-col justify-between overflow-hidden border-b lg:border-b-0 lg:border-r border-sky-100">
          {/* Ambient Glow Accents */}
          <div className="absolute -top-24 -left-24 w-[28rem] h-[28rem] bg-sky-200/40 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute top-1/2 right-0 w-96 h-96 bg-cyan-100/50 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-20 left-1/3 w-80 h-80 bg-blue-100/60 rounded-full blur-3xl pointer-events-none"></div>

          {/* Top Tagline & Badges */}
          <div className="relative z-10 space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-sky-200/80 text-sky-800 font-medium text-xs shadow-sm backdrop-blur-sm">
                <span className="material-symbols-outlined text-sky-600 text-base">explore</span>
                <span>INCOIS Ocean Modeling &amp; Volumetric 3D Engine</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/70 text-emerald-700 font-semibold text-xs shadow-xs">
                <span className="material-symbols-outlined text-emerald-600 text-sm">school</span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-slate-900 tracking-tight leading-[1.18] max-w-2xl">
              Interactive 3D Ocean Intelligence &amp; Public Discovery Platform.
            </h1>
            <p className="text-slate-600 text-base sm:text-lg max-w-xl leading-relaxed">
              Bridging state-of-the-art volumetric ocean modeling for INCOIS scientists with intuitive, open-access 3D exploration for university researchers, educators, students, and citizen marine enthusiasts.
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <div className="px-3 py-1.5 rounded-lg bg-white/80 border border-sky-200/70 shadow-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-sky-700 text-base">dataset</span>
                <span className="text-xs font-semibold tracking-tight text-slate-800 font-mono">NetCDF / CF-Compliant</span>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-white/80 border border-sky-200/70 shadow-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-cyan-600 text-base">sensors</span>
                <span className="text-xs font-semibold tracking-tight text-slate-800 font-mono">Argo &amp; Glider Telemetry</span>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-white/80 border border-sky-200/70 shadow-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-700 text-base">view_in_ar</span>
                <span className="text-xs font-semibold tracking-tight text-slate-800 font-mono">WebGL 3D Volumetric Slices</span>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-white/80 border border-sky-200/70 shadow-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-teal-600 text-base">hub</span>
                <span className="text-xs font-semibold tracking-tight text-slate-800 font-mono">OPeNDAP / OGC WMS</span>
              </div>
            </div>
          </div>

          {/* Center Sonar / Telemetry Graphic */}
          <div className="relative z-10 py-6 my-auto grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="bg-white/70 backdrop-blur-sm border border-sky-100/80 rounded-xl p-4 shadow-sm hover:border-sky-300 transition-all flex flex-col justify-between space-y-2.5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-sky-100/80 text-sky-700 shrink-0">
                  <span className="material-symbols-outlined text-lg">layers</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">Real-Time Volumetric 4D Slicing</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Instant dynamic isosurface extraction across depth levels (0m to -6000m) with GPU-accelerated WebGL rendering.
              </p>
            </div>

            <div className="bg-white/70 backdrop-blur-sm border border-sky-100/80 rounded-xl p-4 shadow-sm hover:border-sky-300 transition-all flex flex-col justify-between space-y-2.5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-cyan-100/50 text-cyan-600 shrink-0">
                  <span className="material-symbols-outlined text-lg">sensors</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">Autonomous Sensor Fusion</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Seamless live ingestion and co-visualization of 140+ active Argo floats, underwater gliders, and mooring arrays.
              </p>
            </div>

            <div className="bg-white/70 backdrop-blur-sm border border-sky-100/80 rounded-xl p-4 shadow-sm hover:border-sky-300 transition-all flex flex-col justify-between space-y-2.5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-100/60 text-blue-700 shrink-0">
                  <span className="material-symbols-outlined text-lg">school</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">Interactive 3D E-Learning</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Interactive 3D bathymetry tours for university classrooms, science centers, and marine policy awareness without institutional barriers.
              </p>
            </div>

            <div className="bg-white/70 backdrop-blur-sm border border-sky-100/80 rounded-xl p-4 shadow-sm hover:border-sky-300 transition-all flex flex-col justify-between space-y-2.5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-50 text-teal-600 shrink-0">
                  <span className="material-symbols-outlined text-lg">crisis_alert</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">Automated Operational Advisories</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Algorithmic hazard alerts, cyclone storm surge forecasts, and Indian EEZ potential fishing zone mapping.
              </p>
            </div>
          </div>

          {/* Bottom Metrics & Quote */}
          <div className="relative z-10 p-4 rounded-xl bg-white/70 backdrop-blur-sm border border-sky-200/80 shadow-xs space-y-2 text-xs">
            <div className="flex items-center gap-2 text-sky-950 font-semibold">
              <span className="material-symbols-outlined text-base text-sky-700 shrink-0">verified_user</span>
              <span>Access Governance &amp; INCOIS Directory Policy</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              <span className="font-semibold text-slate-800">Public &amp; Educational Access:</span> Open 3D ocean exploration and volumetric telemetry are freely available in read-only mode without credentials via{' '}
              <Link to="/" className="text-sky-700 font-medium hover:underline">
                'Explore Public 3D Ocean'
              </Link>.
            </p>
            <p className="text-slate-600 leading-relaxed border-t border-sky-100 pt-2">
              <span className="font-semibold text-slate-800">INCOIS Directory Roster:</span> Full administrative and scientific CRUD permissions are provisioned according to official INCOIS Employee Directory roster (Director Dr. Balakrishnan Nair TM, Scientists-G/F/E/D/C/B, Scientific Assistants, and Officers across divisions ODICT, OMARS, OMDA, OON, OOS, ICT, and Admin, Emp IDs 002–101).
            </p>
          </div>

          <div className="relative z-10 space-y-5 border-t border-sky-200/60 pt-6">
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

        {/* Right Column: Clean White Authentication Form */}
        <section className="lg:col-span-5 bg-white p-6 sm:p-10 lg:p-12 flex items-center justify-center shadow-xl lg:shadow-none overflow-y-auto">
          <div className="w-full max-w-md space-y-6">
            <div className="space-y-1.5 text-left">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-semibold mb-1">
                <span className="material-symbols-outlined text-sm">lock</span>
                <span>Secure Access</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Create DeepSync Account</h2>
              <p className="text-sm text-slate-600">
                Join the 3D ocean intelligence platform for interactive data, research models, and public exploration.
              </p>
            </div>

            {/* Portal tier selector / tabs */}
            <div aria-label="Portal tier selector" className="p-1 rounded-xl bg-slate-100 border border-slate-200 flex gap-1" role="tablist">
              <button
                onClick={() => navigate('/login')}
                className="flex-1 py-2 px-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 text-slate-600 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 flex items-center justify-center gap-1.5"
                type="button"
                role="tab"
              >
                <span className="material-symbols-outlined text-base text-slate-500">login</span>
                <span>Sign In</span>
              </button>
              <button
                className="flex-1 py-2 px-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 bg-white text-sky-950 shadow-sm border border-slate-200/80 focus:outline-none focus:ring-2 focus:ring-sky-600 flex items-center justify-center gap-1.5"
                type="button"
                role="tab"
              >
                <span className="material-symbols-outlined text-base text-sky-700">person_add</span>
                <span>Sign Up</span>
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm rounded-xl flex items-center gap-2">
                <span className="material-symbols-outlined text-base shrink-0">error</span>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm rounded-xl flex items-center gap-2">
                <span className="material-symbols-outlined text-base shrink-0">check_circle</span>
                <span>{success}</span>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700" htmlFor="fullNameInput">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    id="fullNameInput"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full h-11 px-3.5 pr-11 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 text-sm focus:border-sky-600 focus:bg-white focus:ring-2 focus:ring-sky-600/20 transition-all outline-none"
                    placeholder="e.g. Dr. Balakrishnan Nair TM or E.Pattabhi Rama Rao"
                    required
                  />
                  <div className="absolute right-3.5 top-2.5 flex items-center pointer-events-none text-sky-700">
                    <span className="material-symbols-outlined text-xl">person</span>
                  </div>
                </div>
              </div>

              {/* INCOIS Institutional Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700" htmlFor="emailInput">
                  INCOIS Institutional Email (@incois.gov.in)
                </label>
                <div className="relative">
                  <input
                    id="emailInput"
                    name="email"
                    type="email"
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
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700" htmlFor="instituteIdInput">
                      Official INCOIS Employee ID (Emp ID)
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      id="instituteIdInput"
                      name="employeeId"
                      type="text"
                      value={formData.employeeId}
                      onChange={handleChange}
                      className="w-full h-11 px-3.5 pr-11 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 text-sm focus:border-sky-600 focus:bg-white focus:ring-2 focus:ring-sky-600/20 transition-all outline-none font-mono"
                      placeholder="e.g. 002, 009, 017, 024 or official 3-digit ID"
                    />
                    <div className="absolute right-3.5 top-2.5 flex items-center pointer-events-none text-sky-700">
                      <span className="material-symbols-outlined text-xl">badge</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500">Directory roster ID (002–101) for Scientist / Staff authentication</p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700" htmlFor="divisionSelect">
                    Designated Division &amp; Group
                  </label>
                  <div className="relative">
                    <select
                      id="divisionSelect"
                      name="division"
                      value={formData.division}
                      onChange={handleChange}
                      className="w-full h-11 px-3.5 pr-10 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-sm focus:border-sky-600 focus:bg-white focus:ring-2 focus:ring-sky-600/20 transition-all outline-none cursor-pointer appearance-none"
                    >
                      <option value="ODICT">ODICT (Ocean Data &amp; Info &amp; ICT)</option>
                      <option value="OMARS">OMARS (Ocean Modeling &amp; Applied Research)</option>
                      <option value="OMDA">OMDA (Ocean Modeling &amp; Data Assimilation)</option>
                      <option value="OON">OON (Ocean Observation Network)</option>
                      <option value="OOS">OOS (Ocean Observation Systems)</option>
                      <option value="ARO">ARO (Applied Research &amp; Oceanography)</option>
                      <option value="ICT">ICT (Information &amp; Comm Tech)</option>
                      <option value="ADMIN">P&amp;S / P&amp;GA / ESS (Administration, Purchase &amp; Accounts)</option>
                      <option value="DIR">Directorate &amp; Executive Administration</option>
                    </select>
                    <div className="absolute right-3.5 top-2.5 flex items-center pointer-events-none text-sky-700">
                      <span className="material-symbols-outlined text-xl">corporate_fare</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700" htmlFor="passwordInput">
                  Create Password
                </label>
                <div className="relative">
                  <input
                    id="passwordInput"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full h-11 px-3.5 pr-11 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 text-sm focus:border-sky-600 focus:bg-white focus:ring-2 focus:ring-sky-600/20 transition-all outline-none"
                    placeholder="At least 12 characters (symbol, number &amp; mixed case)"
                    required
                  />
                  <button
                    aria-label="Toggle password visibility"
                    className="absolute right-3 top-2 p-1 text-slate-400 hover:text-slate-700 transition-colors focus:outline-none"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined text-xl">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>

                {/* Password Security Policy Checklist */}
                <div className="space-y-2.5 pt-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
                      Password Security Policy
                    </span>
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 text-[11px]">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Scientific Level Compliance
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((idx) => (
                      <div
                        key={idx}
                        className={`flex-1 h-1.5 rounded-full transition-colors ${
                          passwordStrength >= idx ? 'bg-emerald-500' : 'bg-slate-200'
                        }`}
                      ></div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 gap-1.5 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                    <div className={`flex items-center gap-2 ${passwordChecks.length ? 'text-emerald-700 font-medium' : 'text-slate-600'}`}>
                      <span className="material-symbols-outlined text-sm text-emerald-600">
                        {passwordChecks.length ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                      <span>Minimum 12 characters (16+ recommended for telemetry write access)</span>
                    </div>
                    <div className={`flex items-center gap-2 ${passwordChecks.mixedCase ? 'text-emerald-700 font-medium' : 'text-slate-600'}`}>
                      <span className="material-symbols-outlined text-sm text-emerald-600">
                        {passwordChecks.mixedCase ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                      <span>At least one uppercase and one lowercase letter (A-Z, a-z)</span>
                    </div>
                    <div className={`flex items-center gap-2 ${passwordChecks.number ? 'text-emerald-700 font-medium' : 'text-slate-600'}`}>
                      <span className="material-symbols-outlined text-sm text-emerald-600">
                        {passwordChecks.number ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                      <span>At least one numerical digit (0-9)</span>
                    </div>
                    <div className={`flex items-center gap-2 ${passwordChecks.special ? 'text-emerald-700 font-medium' : 'text-slate-600'}`}>
                      <span className="material-symbols-outlined text-sm text-emerald-600">
                        {passwordChecks.special ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                      <span>At least one special symbol (!@#$%^&amp;*()_+)</span>
                    </div>
                    <div className={`flex items-center gap-2 ${passwordChecks.noMatch ? 'text-emerald-700 font-medium' : 'text-slate-600'}`}>
                      <span className="material-symbols-outlined text-sm text-slate-400">
                        {passwordChecks.noMatch ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                      <span>Cannot match User ID, Institute Email, or common dictionary sequences</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Agree Terms Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-sky-500 focus:ring-offset-0"
                    type="checkbox"
                  />
                  <span className="text-xs text-slate-600 leading-relaxed">
                    I agree to the{' '}
                    <a className="text-sky-700 font-semibold hover:underline" href="#">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a className="text-sky-700 font-semibold hover:underline" href="#">
                      Privacy Policy
                    </a>
                    , and accept platform telemetry and research updates.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 active:scale-[0.99] transition-all duration-150 disabled:opacity-60"
                type="submit"
                disabled={loading}
              >
                <span className="material-symbols-outlined text-lg">person_add</span>
                <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
              </button>

              {/* Bottom Sign In link */}
              <div className="text-center pt-2">
                <p className="text-xs text-slate-600">
                  Already have an account?{' '}
                  <Link className="font-semibold text-sky-700 hover:text-sky-800 transition-colors" to="/login">
                    Sign In
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </section>
      </main>

      {/* Bottom Scientific Web Footer */}
      <footer className="w-full px-6 md:px-12 py-5 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-slate-200 bg-[#faf8ff] text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <img
            alt="DeepSync Logo"
            className="w-5 h-5 object-contain"
            src="/images/deepsync-logo.png"
          />
          <span className="font-bold text-slate-800">DeepSync by Bluegen</span>
          <span className="text-slate-400">•</span>
          <span>© 2026 DeepSync by Bluegen for INCOIS • OGC WMS &amp; NetCDF Standards.</span>
        </div>
        <nav className="flex flex-wrap items-center gap-5 font-medium">
          <a className="text-slate-600 hover:text-sky-700 transition-colors" href="#">
            Bathymetry Registry
          </a>
          <a className="text-slate-600 hover:text-sky-700 transition-colors" href="#">
            Security Architecture
          </a>
          <a className="text-slate-600 hover:text-sky-700 transition-colors" href="#">
            API Telemetry Terms
          </a>
          <a className="text-sky-700 font-semibold hover:text-sky-800 flex items-center gap-1.5" href="#">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Live Model Feeds</span>
          </a>
        </nav>
      </footer>
    </div>
  )
}
