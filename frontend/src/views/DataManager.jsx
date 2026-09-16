import { useState, useEffect } from 'react'
import UploadPanel from '../components/datamanager/UploadPanel'
import ParserRegistryList from '../components/datamanager/ParserRegistryList'
import IngestionStatusLog from '../components/datamanager/IngestionStatusLog'
import apiClient from '../api/client'

export default function DataManager() {
  const [refreshLog, setRefreshLog] = useState(0)
  const [successMessage, setSuccessMessage] = useState(null)
  const [statusMetrics, setStatusMetrics] = useState({
    gridPoints: 0,
    floats: 0,
    ingestions: 0,
  })

  const fetchMetrics = async () => {
    try {
      const res = await apiClient.get('/stats/summary')
      const ingRes = await apiClient.get('/admin/ingestions')
      setStatusMetrics({
        gridPoints: res.data?.gridPointCount || 0,
        floats: (res.data?.floatCountByInstrumentType?.ARGO_FLOAT || 0) + (res.data?.floatCountByInstrumentType?.GLIDER || 0),
        ingestions: ingRes.data?.length || 0,
      })
    } catch {
      // Keep defaults
    }
  }

  useEffect(() => {
    fetchMetrics()
  }, [refreshLog])

  const handleUploadSuccess = (data) => {
    setSuccessMessage(
      `✓ Successfully ingested ${data.gridPointsIngested || 0} grid points and ${data.floatsIngested || 0} float trajectories!`
    )
    setRefreshLog((prev) => prev + 1)
    setTimeout(() => setSuccessMessage(null), 6000)
  }

  return (
    <div className="min-h-screen bg-transparent text-slate-800 pb-16 font-sans">
      {/* Top Breadcrumb & Status Bar */}
      <div className="bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-semibold">
                <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
                <span>INCOIS Manager</span>
              </span>
              <span className="text-xs font-medium text-slate-400">·</span>
              <span className="text-xs font-medium text-slate-500">Restricted Access</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Data Ingestion
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              NetCDF-4/CF | ASCII | CSV
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>PostgreSQL 16: Active</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium">
              <span className="w-2 h-2 rounded-full bg-sky-500"></span>
              <span>CF-1.8 Validator: Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <div className="bg-gradient-to-br from-white to-sky-50/50 p-4 rounded-xl border border-sky-100 shadow-xs flex items-center gap-3.5">
          <div className="p-2.5 rounded-lg bg-sky-100 text-sky-700">
            <span className="material-symbols-outlined text-xl">dataset</span>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Grid Points Ingested</div>
            <div className="text-xl font-bold text-slate-900">{statusMetrics.gridPoints.toLocaleString()}</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-cyan-50/50 p-4 rounded-xl border border-cyan-100 shadow-xs flex items-center gap-3.5">
          <div className="p-2.5 rounded-lg bg-cyan-100 text-cyan-700">
            <span className="material-symbols-outlined text-xl">sensors</span>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Instruments Tracked</div>
            <div className="text-xl font-bold text-slate-900">{statusMetrics.floats} Platforms</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-blue-50/50 p-4 rounded-xl border border-blue-100 shadow-xs flex items-center gap-3.5">
          <div className="p-2.5 rounded-lg bg-blue-100 text-blue-700">
            <span className="material-symbols-outlined text-xl">history</span>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Ingestion Operations</div>
            <div className="text-xl font-bold text-slate-900">{statusMetrics.ingestions} Logged</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {/* Success Banner */}
        {successMessage && (
          <div className="flex p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl shadow-xs items-center gap-3 animate-fade-in">
            <span className="material-symbols-outlined text-xl text-emerald-600">check_circle</span>
            <span className="text-sm font-semibold">{successMessage}</span>
          </div>
        )}

        {/* Upload and Registry Side-by-Side */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <UploadPanel onUploadSuccess={handleUploadSuccess} />
          </div>

          <div className="lg:col-span-4">
            <ParserRegistryList />
          </div>
        </div>

        {/* Ingestion Log */}
        <IngestionStatusLog refreshTrigger={refreshLog} />
      </div>
    </div>
  )
}
