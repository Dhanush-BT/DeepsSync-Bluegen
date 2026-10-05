import { useState, useEffect } from 'react'
import MapFilterPanel from '../components/geomap/MapFilterPanel'
import GlobeCanvas from '../components/geomap/GlobeCanvas'
import MapCanvas from '../components/geomap/MapCanvas'
import InstrumentDetailPanel from '../components/geomap/InstrumentDetailPanel'
import apiClient from '../api/client'

export default function GeoMap() {
  const [floats, setFloats] = useState([])
  const [selectedFloat, setSelectedFloat] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [viewMode, setViewMode] = useState('3d') // '3d' (default 3D Earth globe) or '2d' (flat Leaflet)
  const [autoRotate, setAutoRotate] = useState(true)
  const [zoomAction, setZoomAction] = useState(0)
  const [filters, setFilters] = useState({
    selectedInstruments: { ARGO: true, GLIDER: true, CTD: true, MOORED_BUOY: true, DRIFTER: true, OTHER: true },
    searchId: '',
    focusedFloats: [],
  })

  useEffect(() => {
    fetchFloats()
  }, [])

  const normalizeInstrumentType = (type) => {
    if (!type) return 'OTHER'
    const u = String(type).toUpperCase()
    if (u.includes('ARGO')) return 'ARGO'
    if (u.includes('GLIDER')) return 'GLIDER'
    if (u.includes('CTD')) return 'CTD'
    if (u.includes('BUOY') || u.includes('MOOR')) return 'MOORED_BUOY'
    if (u.includes('DRIFT')) return 'DRIFTER'
    return u
  }

  const fetchFloats = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('Fetching floats from /api/floats...')

      const response = await apiClient.get('/floats')
      console.log('Floats response:', response.data)

      const floatData = response.data || []
      if (!Array.isArray(floatData)) {
        throw new Error(`Expected array of floats, got ${typeof floatData}`)
      }

      console.log(`Fetched ${floatData.length} floats, fetching position history...`)

      // Fetch position history for each float
      const floatsWithPositions = await Promise.all(
        floatData.map(async (f) => {
          const encodedId = encodeURIComponent(f.platformId)
          try {
            const trackResponse = await apiClient.get(`/floats/${encodedId}/track`)
            return {
              ...f,
              normalizedType: normalizeInstrumentType(f.instrumentType),
              positions: Array.isArray(trackResponse.data) ? trackResponse.data : [],
            }
          } catch (err) {
            console.warn(`Failed to fetch track for ${f.platformId}:`, err.message)
            return {
              ...f,
              normalizedType: normalizeInstrumentType(f.instrumentType),
              positions: [],
            }
          }
        })
      )

      console.log('Floats with positions loaded:', floatsWithPositions.length)
      setFloats(floatsWithPositions)
    } catch (err) {
      console.error('Failed to fetch floats:', err)
      setError(err?.response?.data?.message || err.message || 'Failed to load floats. Is backend running?')
    } finally {
      setLoading(false)
    }
  }

  // Filter positions by observation window (24h, 7d, 30days, all)
  const filterPositionsByWindow = (positions, windowSetting) => {
    if (!positions || positions.length === 0) return []
    if (windowSetting === 'all') return positions

    // Compute relative cutoff based on the latest position timestamp in the dataset
    // (since historical/simulation timestamps may differ from Date.now())
    let maxTime = 0
    for (const p of positions) {
      if (p.timestamp) {
        const t = new Date(p.timestamp).getTime()
        if (!isNaN(t) && t > maxTime) maxTime = t
      }
    }
    if (maxTime === 0) return positions

    let cutoffMs = 30 * 86400000 // default 30 days
    if (windowSetting === '24h') cutoffMs = 1 * 86400000
    if (windowSetting === '7d') cutoffMs = 7 * 86400000
    if (windowSetting === '30days') cutoffMs = 30 * 86400000

    const cutoffTime = maxTime - cutoffMs
    return positions.filter((p) => {
      if (!p.timestamp) return true
      const t = new Date(p.timestamp).getTime()
      return isNaN(t) || t >= cutoffTime
    })
  }

  const filteredFloats = floats
    .filter((f) => {
      if (filters.searchId && !f.platformId.toLowerCase().includes(filters.searchId.toLowerCase())) {
        return false
      }
      const category = f.normalizedType || normalizeInstrumentType(f.instrumentType)
      if (filters.selectedInstruments && filters.selectedInstruments[category] === false) {
        return false
      }
      return true
    })
    .map((f) => {
      return {
        ...f,
        positions: filterPositionsByWindow(f.positions, filters.observationWindow || '30days'),
      }
    })

  const handleFloatClick = (float) => {
    // If clicking already selected float, don't lock; allows clicking other or toggling
    setSelectedFloat(float)
  }

  const handleResetView = () => {
    setSelectedFloat(null)
    setFilters((prev) => ({
      ...prev,
      searchId: '',
      focusedFloats: [],
    }))
  }

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }

  // Debug info
  useEffect(() => {
    console.log('GeoMap mounted, loading:', loading, 'error:', error, 'floats:', floats.length)
  }, [loading, error, floats])

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-transparent overflow-hidden">
      {/* Sub-header */}
      <div className="w-full bg-white border-b border-slate-200/80 px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0 z-30">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs tracking-wider text-slate-400 font-bold">DEEPSYNC</span>
            <span className="text-slate-300">/</span>
            <h1 className="text-sm font-bold text-slate-900">3D Global Ocean Map</h1>
          </div>
          <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>
          <span className="text-xs text-slate-500 hidden sm:inline-flex items-center gap-1">
            <span className="material-symbols-outlined text-sky-600">public</span>
            Interactive 3D Photorealistic Earth &amp; In-Situ Telemetry
          </span>
        </div>

        {/* Telemetry Badges */}
        <div className="hidden lg:flex items-center gap-2 ml-2">
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200 font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-600"></span>
            {floats.filter((f) => (f.normalizedType || f.instrumentType)?.includes('ARGO')).length} Argo Floats
          </span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
            {floats.filter((f) => (f.normalizedType || f.instrumentType)?.includes('GLIDER')).length} Gliders
          </span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            {floats.length} Total Instruments
          </span>
        </div>

        {/* Map Controls & 3D/2D Viewport Switcher */}
        <div className="flex items-center gap-2 flex-wrap ml-auto">
          {/* Sync Button */}
          <button
            onClick={fetchFloats}
            disabled={loading}
            className="text-xs px-3 py-1.5 rounded-lg border border-sky-200 bg-sky-50 hover:bg-sky-100 text-sky-800 font-semibold transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
            title="Fetch latest ingested datasets and float positions"
          >
            <span className={`material-symbols-outlined text-[16px] text-sky-600 ${loading ? 'animate-spin' : ''}`}>
              sync
            </span>
            <span>Sync Data</span>
          </button>

          {/* 3D Globe / 2D Map Toggle */}
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
            <button
              onClick={() => setViewMode('3d')}
              className={`text-xs px-3 py-1 rounded-md font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === '3d'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Interactive 3D World Globe"
            >
              <span className="material-symbols-outlined text-[15px]">globe_asia</span>
              <span>3D Globe</span>
            </button>
            <button
              onClick={() => setViewMode('2d')}
              className={`text-xs px-3 py-1 rounded-md font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === '2d'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="2D Flat Mercator Map"
            >
              <span className="material-symbols-outlined text-[15px]">map</span>
              <span>2D Flat</span>
            </button>
          </div>

          {/* Auto-Rotation Toggle for 3D Globe */}
          {viewMode === '3d' && (
            <button
              onClick={() => setAutoRotate((prev) => !prev)}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors flex items-center gap-1 ${
                autoRotate
                  ? 'bg-sky-50 border-sky-300 text-sky-800'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
              title="Toggle Slow Orbital Rotation"
            >
              <span className={`material-symbols-outlined text-[15px] ${autoRotate ? 'text-sky-600' : 'text-slate-400'}`}>
                autorenew
              </span>
              <span>Rotate</span>
            </button>
          )}

          <button
            onClick={handleResetView}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium transition-colors flex items-center gap-1 cursor-pointer"
            title="Reset selection and view"
          >
            <span className="material-symbols-outlined text-slate-500 text-[15px]">center_focus_strong</span>
            <span>Reset View</span>
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <MapFilterPanel
          floats={floats}
          selectedFloat={selectedFloat}
          onSelectFloat={handleFloatClick}
          filters={filters}
          onFilterChange={handleFilterChange}
        />

        {/* Center: 3D Globe or 2D Map */}
        <div className="flex-1 relative bg-[#010409] overflow-hidden select-none flex flex-col">
          {loading ? (
            <div className="flex items-center justify-center h-full text-white">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-sky-400 mx-auto mb-4"></div>
                <p>Loading 3D globe and ocean telemetry...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full text-white">
              <div className="text-center">
                <p className="text-red-400 mb-2">Error: {error}</p>
                <button
                  onClick={fetchFloats}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 rounded-lg text-sm font-semibold"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Render 3D Globe or 2D Leaflet Canvas */}
              {viewMode === '3d' ? (
                <GlobeCanvas
                  floats={filteredFloats}
                  focusedFloat={selectedFloat?.platformId}
                  onFloatClick={handleFloatClick}
                  autoRotate={autoRotate}
                  zoomAction={zoomAction}
                />
              ) : (
                <MapCanvas
                  floats={filteredFloats}
                  focusedFloat={selectedFloat?.platformId}
                  onFloatClick={handleFloatClick}
                />
              )}

              {/* Minimal Clean HUD Controls - Top Left: Only + and - Zoom In / Out */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
                <div className="bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-700/80 shadow-lg p-1 flex flex-col">
                  <button
                    onClick={() => setZoomAction((prev) => prev + 1)}
                    className="w-8 h-8 flex items-center justify-center text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    title="Zoom In"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                  </button>
                  <div className="h-px w-full bg-slate-700/80 my-0.5"></div>
                  <button
                    onClick={() => setZoomAction((prev) => prev - 1)}
                    className="w-8 h-8 flex items-center justify-center text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    title="Zoom Out"
                  >
                    <span className="material-symbols-outlined text-[18px]">remove</span>
                  </button>
                </div>
              </div>

              {/* HUD Legend - Top Right */}
              <div className="absolute top-4 right-4 z-10 bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-700/80 shadow-lg flex items-center gap-3 text-white">
                <div className="flex items-center gap-1.5 text-xs font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00b4d8] ring-1 ring-white/40"></span>
                  Argo
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#fbbf24] ring-1 ring-white/40"></span>
                  Glider
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] ring-1 ring-white/40"></span>
                  CTD
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#a855f7] ring-1 ring-white/40"></span>
                  Buoy
                </div>
                <div className="h-3 w-px bg-slate-700"></div>
                <span className="text-[11px] text-sky-400 font-mono font-bold tracking-wider">
                  {viewMode === '3d' ? '3D EARTH' : '2D MERCATOR'}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Right Sidebar */}
        <InstrumentDetailPanel
          float={selectedFloat}
          onClose={handleResetView}
        />
      </div>

      {/* Footer */}
      <footer className="w-full px-6 lg:px-8 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-200/80 bg-white text-slate-600 shrink-0 z-30 text-xs">
        <div className="flex items-center gap-2">
          <img
            alt="DeepSync Logo"
            className="w-4 h-4 object-contain rounded-full"
            src="/images/deepsync-logo.png"
          />
          <span className="font-bold text-slate-800">DeepSync Bluegen</span>
          <span className="text-slate-300">•</span>
          <span>© 2026 DeepSync</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-500">Ocean Intelligence System</span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-mono font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Syncing
          </div>
          <nav className="flex items-center gap-3 text-slate-500">
            <a href="#" className="hover:text-sky-700 transition-colors">
              API Docs
            </a>
            <a href="#" className="hover:text-sky-700 transition-colors">
              OGC WMS/WCS
            </a>
          </nav>
        </div>
      </footer>
    </div>
  )
}
