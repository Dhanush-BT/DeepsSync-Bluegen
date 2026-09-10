import { useState } from 'react'
import apiClient from '../../api/client'

export default function MapFilterPanel({ onFilterChange, floats = [] }) {
  const [searchId, setSearchId] = useState('')
  const [selectedInstruments, setSelectedInstruments] = useState({ ARGO: true, GLIDER: true })
  const [observationWindow, setObservationWindow] = useState('30days')
  const [depthRange, setDepthRange] = useState([0, 2500])
  const [focusedFloats, setFocusedFloats] = useState([])

  const handleInstrumentToggle = (type) => {
    const updated = { ...selectedInstruments, [type]: !selectedInstruments[type] }
    setSelectedInstruments(updated)
    onFilterChange({ selectedInstruments: updated })
  }

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchId(value)
    onFilterChange({ searchId: value })
  }

  const handleFocusFloat = (platformId) => {
    const updated = focusedFloats.includes(platformId)
      ? focusedFloats.filter(id => id !== platformId)
      : [...focusedFloats, platformId]
    setFocusedFloats(updated)
    onFilterChange({ focusedFloats: updated })
  }

  const instrumentCounts = {
    ARGO: floats.filter(f => f.instrumentType?.includes('ARGO')).length,
    GLIDER: floats.filter(f => f.instrumentType?.includes('GLIDER')).length,
  }

  const visibleFloats = floats.filter(f => {
    const search = (searchId || '').trim().toLowerCase()
    if (search && !f.platformId.toLowerCase().includes(search)) return false

    // Check instrument type
    if (f.instrumentType?.includes('ARGO') && !selectedInstruments.ARGO) return false
    if (f.instrumentType?.includes('GLIDER') && !selectedInstruments.GLIDER) return false

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
        <button className="text-xs text-sky-700 hover:text-sky-800 font-semibold">Reset all</button>
      </div>

      <div className="p-4 space-y-4">
        {/* Search */}
        <div className="bg-white p-3 rounded-xl border border-slate-200">
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
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 text-slate-900 font-mono font-medium placeholder:text-slate-400 transition-all"
              placeholder="e.g. ARGO_2900004..."
            />
            {searchId && (
              <button
                onClick={() => setSearchId('')}
                className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined text-[14px]">cancel</span>
              </button>
            )}
          </div>
        </div>

        {/* Instrument Categories */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">
              Instrument Categories
            </span>
            <span className="text-xs text-sky-700 font-bold bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100">
              {Object.values(selectedInstruments).filter(Boolean).length}/2 Active
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
                <span className="text-xs font-bold text-slate-800">Autonomous Gliders</span>
              </div>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
              {instrumentCounts.GLIDER} active
            </span>
          </label>
        </div>

        {/* Observation Window */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <label className="text-[11px] uppercase tracking-wider text-slate-500 font-bold block">
            Observation Window
          </label>
          <select
            value={observationWindow}
            onChange={(e) => {
              setObservationWindow(e.target.value)
              onFilterChange({ observationWindow: e.target.value })
            }}
            className="w-full pl-3 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 appearance-none cursor-pointer focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          >
            <option value="24h">Last 24 hours (Real-time)</option>
            <option value="7d">Last 7 days (Synoptic)</option>
            <option value="30days">Last 30 days (Default)</option>
            <option value="custom">Custom Temporal Window...</option>
          </select>
        </div>

        {/* Depth Scope */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">
              Profile Scope
            </span>
            <span className="text-xs font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 border border-sky-100">
              0 -{depthRange[1]}m
            </span>
          </div>
          <div className="py-2">
            <div className="h-2 w-full rounded-full bg-gradient-to-r from-sky-400 via-sky-600 to-[#0b192c]"></div>
            <div
              className="left-0 top-1.5 w-4 h-4 rounded-full bg-white border-2 border-sky-500 shadow-xs cursor-pointer"
              style={{ position: 'relative' }}
            ></div>
            <div
              className="right-10 top-1.5 w-4 h-4 rounded-full bg-white border-2 border-sky-800 shadow-xs cursor-pointer"
              style={{ position: 'relative' }}
            ></div>
          </div>
          <div className="flex items-center justify-between text-slate-500 text-xs font-mono">
            <span>Surface</span>
            <span>Mesopelagic</span>
            <span>-2,500m</span>
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
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {visibleFloats.slice(0, 5).map((f) => (
              <div
                key={f.platformId}
                onClick={() => handleFocusFloat(f.platformId)}
                className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                  focusedFloats.includes(f.platformId)
                    ? 'border-sky-300 bg-sky-50/70'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor:
                            f.instrumentType?.includes('ARGO') ? '#0284c7' : '#f59e0b',
                        }}
                      ></span>
                      <span className="text-xs font-bold text-sky-900 font-mono">
                        {f.platformId}
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
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}
