import { useState } from 'react'
import apiClient from '../../api/client'

export default function MapFilterPanel({
  onFilterChange,
  floats = [],
  selectedFloat = null,
  onSelectFloat = () => {},
  filters = {},
}) {
  const [searchId, setSearchId] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedInstruments, setSelectedInstruments] = useState({
    ARGO: true,
    GLIDER: true,
    CTD: true,
    MOORED_BUOY: true,
    DRIFTER: true,
    OTHER: true,
  })
  const [observationWindow, setObservationWindow] = useState('30days')
  const [focusedFloats, setFocusedFloats] = useState([])

  const normalizeType = (type) => {
    if (!type) return 'OTHER'
    const u = String(type).toUpperCase()
    if (u.includes('ARGO')) return 'ARGO'
    if (u.includes('GLIDER')) return 'GLIDER'
    if (u.includes('CTD')) return 'CTD'
    if (u.includes('BUOY') || u.includes('MOOR')) return 'MOORED_BUOY'
    if (u.includes('DRIFT')) return 'DRIFTER'
    return u
  }

  const handleInstrumentToggle = (type) => {
    const updated = { ...selectedInstruments, [type]: !selectedInstruments[type] }
    setSelectedInstruments(updated)
    onFilterChange({ selectedInstruments: updated })
  }

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchId(value)
    setShowSuggestions(true)
    onFilterChange({ searchId: value })
  }

  const handleSelectSuggestion = (float) => {
    const cleanId = String(float.platformId).split(',')[0].trim()
    setSearchId(cleanId)
    setShowSuggestions(false)
    onSelectFloat(float)
    onFilterChange({ searchId: cleanId })
  }

  const handleClearSearch = () => {
    setSearchId('')
    setShowSuggestions(false)
    onFilterChange({ searchId: '' })
  }

  const handleResetAll = () => {
    const allActive = {
      ARGO: true,
      GLIDER: true,
      CTD: true,
      MOORED_BUOY: true,
      DRIFTER: true,
      OTHER: true,
    }
    setSearchId('')
    setShowSuggestions(false)
    setSelectedInstruments(allActive)
    setObservationWindow('30days')
    setFocusedFloats([])
    onSelectFloat(null)
    onFilterChange({
      searchId: '',
      selectedInstruments: allActive,
      observationWindow: '30days',
      focusedFloats: [],
    })
  }

  const handleFocusFloat = (float) => {
    const pid = float.platformId
    const updated = focusedFloats.includes(pid)
      ? focusedFloats.filter((id) => id !== pid)
      : [...focusedFloats, pid]
    setFocusedFloats(updated)
    onSelectFloat(float)
    onFilterChange({ focusedFloats: updated })
  }

  // Filter suggestions while typing
  const searchSuggestions = searchId.trim()
    ? floats
        .filter((f) =>
          String(f.platformId).toLowerCase().includes(searchId.trim().toLowerCase())
        )
        .slice(0, 6)
    : []

  // Dynamic counts based on instrument category
  const instrumentCounts = {
    ARGO: floats.filter((f) => (f.normalizedType || normalizeType(f.instrumentType)) === 'ARGO').length,
    GLIDER: floats.filter((f) => (f.normalizedType || normalizeType(f.instrumentType)) === 'GLIDER').length,
    CTD: floats.filter((f) => (f.normalizedType || normalizeType(f.instrumentType)) === 'CTD').length,
    MOORED_BUOY: floats.filter((f) => (f.normalizedType || normalizeType(f.instrumentType)) === 'MOORED_BUOY').length,
    DRIFTER: floats.filter((f) => (f.normalizedType || normalizeType(f.instrumentType)) === 'DRIFTER').length,
    OTHER: floats.filter((f) => {
      const t = f.normalizedType || normalizeType(f.instrumentType)
      return !['ARGO', 'GLIDER', 'CTD', 'MOORED_BUOY', 'DRIFTER'].includes(t)
    }).length,
  }

  const visibleFloats = floats.filter((f) => {
    const search = (searchId || '').trim().toLowerCase()
    if (search && !f.platformId.toLowerCase().includes(search)) return false

    const cat = f.normalizedType || normalizeType(f.instrumentType)
    if (selectedInstruments[cat] === false) return false

    return true
  })

  return (
    <aside className="w-72 bg-slate-50/70 border-r border-slate-200/80 flex flex-col h-full shrink-0 z-20 shadow-xs overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-slate-200/80 sticky top-0 bg-white/95 backdrop-blur-sm z-10">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-100">
            <span className="material-symbols-outlined text-[17px]">tune</span>
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 leading-tight">Filters & Instruments</h2>
            <span className="text-xs text-slate-500">Dataset Control</span>
          </div>
        </div>
        <button
          onClick={handleResetAll}
          className="text-xs text-sky-700 hover:text-sky-800 font-semibold hover:underline cursor-pointer"
        >
          Reset all
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Search with Live Autocomplete Suggestions */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 relative">
          <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
            Search Platform ID / WMO
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-2.5 top-2 text-slate-400 text-[17px]">
              search
            </span>
            <input
              type="text"
              value={searchId}
              onChange={handleSearchChange}
              onFocus={() => {
                if (searchId.trim()) setShowSuggestions(true)
              }}
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 text-slate-900 font-mono font-medium placeholder:text-slate-400 transition-all"
              placeholder="e.g. 2900227, ARGO..."
            />
            {searchId && (
              <button
                onClick={handleClearSearch}
                className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                title="Clear search"
              >
                <span className="material-symbols-outlined text-[14px]">cancel</span>
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown List */}
          {showSuggestions && searchSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400">
                Matching Instruments ({searchSuggestions.length})
              </div>
              <div className="max-h-48 overflow-y-auto divide-y divide-slate-100">
                {searchSuggestions.map((f) => {
                  const cleanId = String(f.platformId).split(',')[0].trim()
                  const type = f.normalizedType || normalizeType(f.instrumentType)
                  const isArgo = type === 'ARGO'
                  return (
                    <div
                      key={f.platformId}
                      onClick={() => handleSelectSuggestion(f)}
                      className="p-2.5 hover:bg-sky-50/70 cursor-pointer transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isArgo ? 'bg-sky-500' : 'bg-amber-500'
                          }`}
                        ></span>
                        <div>
                          <div className="text-xs font-mono font-bold text-slate-900">
                            {cleanId}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {(f.latitude ?? f.lastLatitude)?.toFixed(2)}°N,{' '}
                            {(f.longitude ?? f.lastLongitude)?.toFixed(2)}°E
                          </div>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          isArgo
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {type}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Instrument Categories */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">
              Instrument Categories
            </span>
            <span className="text-xs text-sky-700 font-bold bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100">
              {Object.values(selectedInstruments).filter(Boolean).length} Active
            </span>
          </div>

          {/* Argo */}
          <label className="flex items-center justify-between p-2.5 rounded-xl border border-sky-200 bg-sky-50/50 hover:bg-sky-50 cursor-pointer transition-colors">
            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                checked={selectedInstruments.ARGO}
                onChange={() => handleInstrumentToggle('ARGO')}
                className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300 cursor-pointer"
              />
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-600 ring-2 ring-sky-200"></span>
                <span className="text-xs font-bold text-slate-800">Argo Floats</span>
              </div>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-100 text-sky-900">
              {instrumentCounts.ARGO} active
            </span>
          </label>

          {/* Gliders */}
          <label className="flex items-center justify-between p-2.5 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-50 cursor-pointer transition-colors">
            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                checked={selectedInstruments.GLIDER}
                onChange={() => handleInstrumentToggle('GLIDER')}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300 cursor-pointer"
              />
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-200"></span>
                <span className="text-xs font-bold text-slate-800">Gliders</span>
              </div>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
              {instrumentCounts.GLIDER} active
            </span>
          </label>

          {/* CTD Profiles / Soundings */}
          <label className="flex items-center justify-between p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 cursor-pointer transition-colors">
            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                checked={selectedInstruments.CTD}
                onChange={() => handleInstrumentToggle('CTD')}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
              />
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 ring-2 ring-emerald-200"></span>
                <span className="text-xs font-bold text-slate-800">CTD Profilers</span>
              </div>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900">
              {instrumentCounts.CTD} active
            </span>
          </label>

          {/* Moored Buoys */}
          <label className="flex items-center justify-between p-2.5 rounded-xl border border-purple-200 bg-purple-50/50 hover:bg-purple-50 cursor-pointer transition-colors">
            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                checked={selectedInstruments.MOORED_BUOY}
                onChange={() => handleInstrumentToggle('MOORED_BUOY')}
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300 cursor-pointer"
              />
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600 ring-2 ring-purple-200"></span>
                <span className="text-xs font-bold text-slate-800">Moored Buoys</span>
              </div>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-900">
              {instrumentCounts.MOORED_BUOY} active
            </span>
          </label>
        </div>

        {/* Observation Window - Controls Trajectory Path Time Window */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[11px] uppercase tracking-wider text-slate-500 font-bold block">
              Observation Window
            </label>
            <span className="text-[10px] text-sky-600 font-semibold font-mono">Trajectory Range</span>
          </div>
          <select
            value={observationWindow}
            onChange={(e) => {
              setObservationWindow(e.target.value)
              onFilterChange({ observationWindow: e.target.value })
            }}
            className="w-full pl-3 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 appearance-none cursor-pointer focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          >
            <option value="24h">Last 24 hours (Latest Path)</option>
            <option value="7d">Last 7 days (Synoptic Track)</option>
            <option value="30days">Last 30 days (Default Path)</option>
            <option value="all">Full History / All Tracks</option>
          </select>
          <div className="text-[11px] text-slate-400 font-mono">
            {observationWindow === '24h' && 'Showing last 24 hours drift points'}
            {observationWindow === '7d' && 'Showing past 7 days trajectory'}
            {observationWindow === '30days' && 'Showing past 30 days trajectory'}
            {observationWindow === 'all' && 'Showing complete recorded history'}
          </div>
        </div>

        {/* Visible Instruments */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">
              Visible Instruments
            </span>
            <span className="text-[11px] text-slate-500 font-medium">{focusedFloats.length} Focus</span>
          </div>
          <div className="space-y-1.5 max-h-56 overflow-y-auto">
            {visibleFloats.map((f) => {
              const displayId = String(f.platformId || '').split(',')[0].trim()
              const cat = f.normalizedType || normalizeType(f.instrumentType)
              const color =
                cat === 'ARGO'
                  ? '#0284c7'
                  : cat === 'GLIDER'
                  ? '#f59e0b'
                  : cat === 'CTD'
                  ? '#10b981'
                  : cat === 'MOORED_BUOY'
                  ? '#8b5cf6'
                  : '#06b6d4'

              return (
                <div
                  key={f.platformId}
                  onClick={() => handleFocusFloat(f)}
                  className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                    focusedFloats.includes(f.platformId) || selectedFloat?.platformId === f.platformId
                      ? 'border-sky-300 bg-sky-50/70'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: color }}
                        ></span>
                        <span className="text-xs font-bold text-sky-900 font-mono truncate max-w-[130px]" title={displayId}>
                          {displayId}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {(f.latitude || f.lastLatitude)?.toFixed(2)}°N, {(f.longitude || f.lastLongitude)?.toFixed(2)}°E
                      </span>
                    </div>
                    <span className="material-symbols-outlined text-slate-400 text-[16px]">
                      gps_fixed
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </aside>
  )
}
