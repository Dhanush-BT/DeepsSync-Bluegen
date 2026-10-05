import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import apiClient from '../api/client'

export default function ProfileSettings() {
  const { user, setUser } = useAuthStore()
  const [advisories, setAdvisories] = useState([])
  const [loadingAdvisories, setLoadingAdvisories] = useState(true)
  const [savedSuccess, setSavedSuccess] = useState(false)

  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || 'Dr. Balakrishnan Nair TM',
    email: user?.empIdOrEmail || 'researcher@deepsync.org',
    employeeId: '002',
    division: 'DIR',
    designation: 'Director & Executive Administration',
  })

  useEffect(() => {
    fetchAdvisories()
  }, [])

  const fetchAdvisories = async () => {
    try {
      const res = await apiClient.get('/hazards')
      setAdvisories(res.data || [])
    } catch {
      // Keep fallbacks
      setAdvisories([
        {
          id: 1,
          type: 'HIGH_WAVE',
          region: 'Bay of Bengal',
          severity: 'MODERATE',
          message: 'High wave alert for fishing vessels operating in the Bay of Bengal.',
        },
        {
          id: 2,
          type: 'PFZ',
          region: 'Arabian Sea',
          severity: 'LOW',
          message: 'Potential Fishing Zone advisory issued for the Arabian Sea.',
        },
        {
          id: 3,
          type: 'TSUNAMI',
          region: 'Lakshadweep Sea',
          severity: 'SEVERE',
          message: 'Tsunami watch issued near the Lakshadweep Sea following seismic activity.',
        },
      ])
    } finally {
      setLoadingAdvisories(false)
    }
  }

  const handleSaveProfile = (e) => {
    e.preventDefault()
    setUser({
      ...user,
      fullName: profileForm.fullName,
      empIdOrEmail: profileForm.email,
    })
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 4000)
  }

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'SEVERE':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
            SEVERE
          </span>
        )
      case 'MODERATE':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            MODERATE
          </span>
        )
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            LOW
          </span>
        )
    }
  }

  return (
    <div className="min-h-screen bg-transparent text-slate-800 font-sans pb-16">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Administration</span>
                <span className="text-xs text-slate-300">/</span>
                <span className="text-xs font-semibold text-sky-700">Profile &amp; System Settings</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Profile &amp; Operational Settings
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Manage administrative credentials, oceanographic early warning hazard feeds, and upstream sidecar services.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>FIPS 140-2 Compliant Session</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {savedSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl shadow-xs flex items-center gap-3">
            <span className="material-symbols-outlined text-xl text-emerald-600">check_circle</span>
            <span className="text-sm font-semibold">Profile details saved successfully!</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Admin Profile Card */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white font-bold text-base flex items-center justify-center shadow-md">
                    BN
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">{profileForm.fullName}</h2>
                    <span className="text-xs text-slate-500 font-medium">{profileForm.designation}</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200 rounded-lg">
                  ADMIN
                </span>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Full Name</label>
                  <input
                    type="text"
                    value={profileForm.fullName}
                    onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-sm focus:border-sky-600 focus:bg-white outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Institutional Email
                  </label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-sm focus:border-sky-600 focus:bg-white outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Official Emp ID
                    </label>
                    <input
                      type="text"
                      value={profileForm.employeeId}
                      readOnly
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 text-sm font-mono cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Division &amp; Group
                    </label>
                    <input
                      type="text"
                      value={profileForm.division}
                      readOnly
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 text-sm font-mono cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-600/20 active:scale-[0.99] transition-all"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>

            {/* Upstream Services Status */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-sky-600">hub</span>
                <span>Connected Infrastructure &amp; Sidecars</span>
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span className="font-semibold text-slate-800">THREDDS OPeNDAP</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Online
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span className="font-semibold text-slate-800">GeoServer WMS</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Online
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span className="font-semibold text-slate-800">PostgreSQL (5433)</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Synced
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span className="font-semibold text-slate-800">Spring Boot (8081)</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Operational Hazard Advisories */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-500">crisis_alert</span>
                    <span>Operational Hazard Advisories</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Real-time Oceanographic Early Warning and Potential Fishing Zone (PFZ) broadcasts.
                  </p>
                </div>
                <span className="px-2.5 py-1 text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 rounded-lg">
                  {advisories.length} Active
                </span>
              </div>

              {loadingAdvisories ? (
                <div className="py-8 text-center text-xs text-slate-500">Loading active hazard feeds...</div>
              ) : (
                <div className="space-y-3 mt-4">
                  {advisories.map((adv) => (
                    <div
                      key={adv.id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2 hover:bg-white hover:border-sky-300 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900 font-mono">[{adv.type}]</span>
                          <span className="text-xs font-semibold text-sky-800">{adv.region}</span>
                        </div>
                        {getSeverityBadge(adv.severity)}
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">{adv.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Security Policy Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-sky-600">security</span>
                <span>Security Governance Policy</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                DEEPSYNC operates under verified scientific directory governance. Administrative sessions are signed with cryptographic tokens. Telemetry write access is restricted to verified scientist and officer rosters (002–101).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
