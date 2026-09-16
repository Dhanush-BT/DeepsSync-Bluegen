import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import apiClient from '../api/client'

export default function Home() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    apiClient
      .get('/stats/summary')
      .then((res) => {
        setStats(res.data)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to fetch stats:', err)
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-600">Loading...</div>
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">Error: {error}</div>
  if (!stats) return <div className="min-h-screen flex items-center justify-center text-slate-600">No data</div>

  return (
    <main className="relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-sky-100/50 via-sky-50/30 to-transparent pointer-events-none -z-10" />
      <div className="absolute -top-32 right-1/4 w-96 h-96 bg-sky-200/30 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Hero */}
      <section className="pt-12 pb-8 sm:pt-16 sm:pb-12 text-center max-w-4xl mx-auto px-4 sm:px-6">
        <div className="inline-flex items-center space-x-2 px-3 py-1 mb-5 rounded-full bg-sky-100/80 border border-sky-200 text-sky-900 text-xs font-semibold tracking-wide">
          <span>PS 26067 · INCOIS | Ministry of Earth Sciences</span>
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
          3D Ocean Data <span className="bg-clip-text text-transparent bg-gradient-to-r from-ocean-700 via-ocean-600 to-cyan-500">Visualization</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto mb-8">
          DEEPSYNC integrates ocean model outputs with in-situ instrument observations — built for Smart India Hackathon 2025 by Team BLUEGEN_606.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
          <Link to="/dashboard" className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all">
            <span>Open Dashboard</span>
          </Link>
          <Link to="/geomap" className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3 text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:border-sky-400 rounded-xl transition-all">
            <span>Open Geo Map</span>
          </Link>
          {isAuthenticated && (
            <Link to="/datamanager" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 text-sm font-semibold text-sky-950 bg-sky-100 hover:bg-sky-200 border border-sky-300 rounded-xl shadow-sm transition-all">
              <span className="material-symbols-outlined text-base text-sky-700">admin_panel_settings</span>
              <span>Open Data Manager</span>
            </Link>
          )}
        </div>
        <p className="text-xs text-slate-400">Public access · Real-time data without login</p>
      </section>

      {/* Stats Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-16">
        <div className="text-center mb-6">
          <h2 className="text-xs uppercase tracking-widest font-bold text-slate-500">Live System Status</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          <div className="bg-white p-5 rounded-2xl border border-sky-100 shadow-sm">
            <div className="text-3xl font-extrabold text-slate-900">{stats.gridPointCount}</div>
            <div className="text-xs font-semibold text-slate-700 mt-1">Grid Points</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-sky-100 shadow-sm">
            <div className="text-3xl font-extrabold text-slate-900">{stats.floatCountByInstrumentType?.ARGO_FLOAT || 0}</div>
            <div className="text-xs font-semibold text-slate-700 mt-1">Argo Floats</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-sky-100 shadow-sm">
            <div className="text-3xl font-extrabold text-slate-900">{stats.floatCountByInstrumentType?.GLIDER || 0}</div>
            <div className="text-xs font-semibold text-slate-700 mt-1">Gliders</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-sky-100 shadow-sm">
            <div className="text-3xl font-extrabold text-slate-900">{stats.activeHazardCount}</div>
            <div className="text-xs font-semibold text-slate-700 mt-1">Hazard Alerts</div>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-16">
        <div className="text-center mb-8">
          <h2 className="text-xs uppercase tracking-widest font-bold text-slate-500">Platform Capabilities</h2>
          <p className="text-2xl font-bold text-slate-900 mt-1">Scalable Ocean Intelligence</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-sky-100">
            <h3 className="text-sm font-bold text-slate-900 mb-1.5">3D Volumetric Rendering</h3>
            <p className="text-xs text-slate-500">Depth-slice views and isosurfaces of live ocean model fields.</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-sky-100">
            <h3 className="text-sm font-bold text-slate-900 mb-1.5">Multi-instrument Overlay</h3>
            <p className="text-xs text-slate-500">Argo floats and gliders plotted with hydrodynamic data.</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-sky-100">
            <h3 className="text-sm font-bold text-slate-900 mb-1.5">Extensible Ingestion</h3>
            <p className="text-xs text-slate-500">Plugin parser architecture for any data format.</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-sky-100">
            <h3 className="text-sm font-bold text-slate-900 mb-1.5">OGC & CF Compliant</h3>
            <p className="text-xs text-slate-500">WMS/WCS services and CF-convention validation.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <section className="border-t border-sky-100 py-8 px-4 text-center text-xs text-slate-500">
        <p>Team BLUEGEN_606 · Smart India Hackathon 2025 · INCOIS PS 26067</p>
      </section>
    </main>
  )
}
