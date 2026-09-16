import { useState, useEffect } from 'react'
import MapFilterPanel from '../components/geomap/MapFilterPanel'
import MapCanvas from '../components/geomap/MapCanvas'
import InstrumentDetailPanel from '../components/geomap/InstrumentDetailPanel'
import apiClient from '../api/client'

export default function GeoMap() {
  const [floats, setFloats] = useState([])
  const [selectedFloat, setSelectedFloat] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
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

  const filteredFloats = floats.filter((f) => {
    if (filters.searchId && !f.platformId.toLowerCase().includes(filters.searchId.toLowerCase())) {
      return false
    }
    const category = f.normalizedType || normalizeInstrumentType(f.instrumentType)
    if (filters.selectedInstruments && filters.selectedInstruments[category] === false) {
      return false
    }
    return true
  })

  const handleFloatClick = (float) => {
    setSelectedFloat(float)
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
            <h1 className="text-sm font-bold text-slate-900">Geo Map</h1>
          </div>
          <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>
          <span className="text-xs text-slate-500 hidden sm:inline-flex items-center gap-1">
            <span className="material-symbols-outlined text-sky-600">explore</span>
            Indian Ocean &amp; EEZ In-Situ Tracking
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

        {/* Map Controls */}
        <div className="flex items-center gap-2 flex-wrap ml-auto">
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
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
            <button className="text-xs px-3 py-1 rounded-md bg-white text-sky-700 font-semibold shadow-xs flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-sky-600">layers</span>
              Layer: Hybrid Bathymetry
              <span className="material-symbols-outlined text-[13px] text-slate-400">
                expand_more
              </span>
            </button>
            <button className="text-xs px-3 py-1 rounded-md text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-slate-500">public</span>
              EPSG:3857
            </button>
          </div>
          <button className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-slate-500">center_focus_strong</span>
            Fit Extents
          </button>
          <button className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors">
            <span className="material-symbols-outlined text-[18px]">fullscreen</span>
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <MapFilterPanel floats={floats} onFilterChange={handleFilterChange} />

        {/* Center: Map */}
        <div className="flex-1 relative bg-[#091b2c] overflow-hidden select-none flex flex-col">
          {loading ? (
            <div className="flex items-center justify-center h-full text-white">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-sky-400 mx-auto mb-4"></div>
                <p>Loading float trajectories...</p>
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
              {/* Map Container */}
              <MapCanvas
                floats={filteredFloats}
                focusedFloat={selectedFloat?.platformId}
                onFloatClick={handleFloatClick}
              />

              {/* HUD Controls - Top Left */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
                <div className="bg-white/95 backdrop-blur-md rounded-xl border border-slate-200/90 shadow-md p-1 flex flex-col">
                  <button className="w-8 h-8 flex items-center justify-center text-slate-700 hover:text-sky-700 hover:bg-slate-100 rounded-lg transition-colors">
                    <span className="material-symbols-outlined text-[18px]">add</span>
                  </button>
                  <div className="h-px w-full bg-slate-200 my-0.5"></div>
                  <button className="w-8 h-8 flex items-center justify-center text-slate-700 hover:text-sky-700 hover:bg-slate-100 rounded-lg transition-colors">
                    <span className="material-symbols-outlined text-[18px]">remove</span>
                  </button>
                </div>
                <div className="bg-white/95 backdrop-blur-md rounded-xl border border-slate-200/90 shadow-md p-1 flex flex-col items-center gap-1">
                  <button className="w-7 h-7 flex items-center justify-center text-sky-600 hover:bg-slate-100 rounded-lg transition-colors">
                    <span className="material-symbols-outlined text-[20px]">navigation</span>
                  </button>
                  <div className="h-px w-full bg-slate-200"></div>
                  <button className="w-7 h-7 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                    <span className="material-symbols-outlined text-[16px]">straighten</span>
                  </button>
                </div>
              </div>

              {/* HUD Legend - Top Right */}
              <div className="absolute top-4 right-4 z-10 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-200/90 shadow-md flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-600"></span>
                  Argo Float
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  Glider
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                  <span className="w-4 h-0.5 bg-sky-500"></span>
                  Drift Vector
                </div>
                <div className="h-3 w-px bg-slate-200"></div>
                <span className="text-[11px] text-slate-500 font-mono">GEBCO 2024</span>
              </div>

              {/* Coordinates HUD - Bottom Left */}
              <div className="absolute bottom-24 left-4 z-10 flex flex-col gap-1 bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-200/90 shadow-md font-mono text-xs text-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-sky-700 font-bold">CURSOR:</span>
                  <span>12.421°N, 79.145°E</span>
                  <span className="text-slate-300">|</span>
                  <span>
                    Depth: <span className="font-bold text-sky-700">-2,450 m</span>
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-500 text-[10px] mt-0.5">
                  <span>ZOOM: 6.5 (Mercator)</span>
                  <div className="flex items-center gap-1">
                    <div className="w-12 h-1 bg-slate-800 relative">
                      <span className="absolute -top-3.5 left-0 text-[9px] font-sans">0</span>
                      <span className="absolute -top-3.5 right-0 text-[9px] font-sans">200km</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline Scrubber - Bottom Center */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 w-[90%] max-w-xl bg-white/95 backdrop-blur-md px-4 py-2.5 border border-slate-200/90 shadow-lg flex items-center gap-3">
                <button className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center hover:bg-sky-700 transition-all shrink-0 shadow-xs">
                  <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                </button>
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-800 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sky-600">history</span>
                      Temporal Window
                    </span>
                    <span className="font-mono text-sky-700 font-bold text-xs">T=30d (Present)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden cursor-pointer">
                    <div className="left-0 top-0 h-full w-4/5 bg-gradient-to-r from-sky-400 to-sky-600 rounded-full"></div>
                    <div
                      className="left-[80%] -top-1 w-3.5 h-3.5 bg-white border-2 border-sky-600 rounded-full shadow-sm cursor-pointer"
                      style={{ position: 'relative' }}
                    ></div>
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-lg text-xs font-mono font-semibold text-slate-700">
                  <span>1x</span>
                  <span className="material-symbols-outlined text-slate-400">speed</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Sidebar */}
        <InstrumentDetailPanel float={selectedFloat} />
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
          <span className="text-slate-500">BLUEGEN_606 PS 26067 INCOIS</span>
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
