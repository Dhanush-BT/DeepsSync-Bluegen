import { useState } from 'react'

export default function InstrumentDetailPanel({ float = null, onClose = () => {} }) {
  const [showProfile, setShowProfile] = useState(true)

  if (!float) {
    return (
      <aside className="w-80 bg-slate-50/70 border-l border-slate-200/80 flex flex-col h-full shrink-0 z-20 shadow-xs overflow-y-auto p-6">
        <div className="text-center text-slate-400 py-12">
          <span className="material-symbols-outlined text-4xl block mb-3">info</span>
          <p>Click on a float or search to view details</p>
        </div>
      </aside>
    )
  }

  // Get latest profile sample for depth profile visualization
  const latestProfile = float.profileSamples?.[0] || {}
  const profiles = float.profileSamples || []

  return (
    <aside className="w-80 bg-slate-50/70 border-l border-slate-200/80 flex flex-col h-full shrink-0 z-20 shadow-xs overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-slate-200/80 sticky top-0 bg-white/95 backdrop-blur-sm z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-100">
              <span className="material-symbols-outlined text-[17px]">sensors</span>
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 leading-tight">
                Instrument Detail
              </h2>
              <span className="text-[11px] text-slate-500">Real-Time In-Situ Telemetry</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
            title="Deselect instrument"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
        <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 flex items-center gap-1.5 w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          LIVE
        </span>
      </div>

      <div className="p-4 space-y-4">
        {/* Platform ID Card */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
              WMO Platform ID
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-sky-50 font-mono text-sky-700 font-bold border border-sky-100">
              CYCLE #{float.cycleNumber || 'N/A'}
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-lg font-black text-sky-900 font-mono tracking-tight">
              {float.platformId}
            </h3>
            <span className="text-xs font-semibold text-slate-500 font-mono">
              WMO #{float.platformId.split('_')[1] || 'N/A'}
            </span>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-2.5 mt-3 pt-3 border-t border-slate-100 font-mono text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-sans font-medium">
                Instrument Type
              </span>
              <span className="font-semibold text-slate-800">
                {float.instrumentType === 'ARGO' ? 'Apex Mk-IV' : 'Slocum G3'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-sans font-medium">
                Country Agency
              </span>
              <span className="font-semibold text-slate-800">Ocean Observation Network</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-sans font-medium">
                Coordinates
              </span>
              <span className="font-semibold text-slate-800">
                {(float.latitude || float.lastLatitude)?.toFixed(2)}°N, {(float.longitude || float.lastLongitude)?.toFixed(2)}°E
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-sans font-medium">
                Transmission
              </span>
              <span className="font-semibold text-emerald-600">2h ago</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-sans font-medium">
                Parking Depth
              </span>
              <span className="font-semibold text-slate-800">1,000 dbar</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-sans font-medium">
                Battery State
              </span>
              <span className="font-semibold text-emerald-600 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">
                  battery_charging_full
                </span>
                (94%)
              </span>
            </div>
          </div>
        </div>

        {/* Telemetry Tiles */}
        <div className="space-y-2">
          <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">
            Real-Time Telemetry
          </span>
          <div className="grid grid-cols-2 gap-2.5">
            {/* SST */}
            <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-[11px]">
                <span>Sea Temp</span>
                <span className="material-symbols-outlined text-rose-500 text-[16px]">
                  thermostat
                </span>
              </div>
              <div className="text-lg font-bold font-mono text-slate-900 mt-1">
                {latestProfile.temperature?.toFixed(1) || '28.4'}
                <span className="text-xs font-normal text-slate-400">°C</span>
              </div>
              <div className="text-emerald-600 font-mono mt-0.5 font-semibold text-xs">
                ▲ +0.3° anomaly
              </div>
            </div>

            {/* Salinity */}
            <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-[11px]">
                <span>Salinity</span>
                <span className="material-symbols-outlined text-sky-500 text-[16px]">
                  water
                </span>
              </div>
              <div className="text-lg font-bold font-mono text-slate-900 mt-1">
                {latestProfile.salinity?.toFixed(2) || '34.82'}
                <span className="text-xs font-normal text-slate-400">PSU</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">Halocline: -48m</div>
            </div>

            {/* Max Depth */}
            <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-[11px]">
                <span>Max Dive Depth</span>
                <span className="material-symbols-outlined text-teal-600 text-[16px]">
                  vertical_align_bottom
                </span>
              </div>
              <div className="text-lg font-bold font-mono text-slate-900 mt-1">
                -2,040<span className="text-xs font-normal text-slate-400">m</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">2,000 dbar pressure</div>
            </div>

            {/* Drift Velocity */}
            <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-[11px]">
                <span>Drift Velocity</span>
                <span className="material-symbols-outlined text-amber-500 text-[16px]">air</span>
              </div>
              <div className="text-lg font-bold font-mono text-slate-900 mt-1">
                0.18<span className="text-xs font-normal text-slate-400">m/s</span>
              </div>
              <div className="text-slate-500 font-mono mt-0.5 text-xs">Heading: 114° SE</div>
            </div>
          </div>
        </div>

        {/* Vertical Profile */}
        {profiles.length > 0 && (
          <div className="p-3.5 bg-white border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sky-600 text-[17px]">
                  waterfall_chart
                </span>
                <span className="text-[11px] uppercase tracking-wider text-slate-700 font-bold">
                  Vertical Profile
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-100">
                  Temp
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-sky-50 text-sky-700 border border-sky-100">
                  Sal
                </span>
              </div>
            </div>
            <div className="w-full h-40 bg-slate-50 rounded-xl p-2 border border-slate-200/70">
              <svg className="w-full h-full" viewBox="0 0 200 130">
                <line
                  x1="0"
                  y1="12"
                  x2="200"
                  y2="12"
                  stroke="#f43f5e"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
                <text x="125" y="10" fill="#f43f5e" fontSize="7" fontFamily="monospace">
                  MLD: -64.2m
                </text>
                {/* Temperature profile curve */}
                <path
                  d="M 175 0 C 172 15 140 30 75 55 C 50 75 35 100 28 130"
                  fill="none"
                  stroke="#e11d48"
                  strokeLinecap="round"
                  strokeWidth="2"
                />
                {/* Salinity profile curve */}
                <path
                  d="M 80 0 C 90 20 120 40 135 65 C 145 90 148 110 150 130"
                  fill="none"
                  stroke="#0284c7"
                  strokeLinecap="round"
                  strokeWidth="2"
                />
              </svg>
              <div className="text-right font-mono text-slate-400 text-[10px] mt-1">
                0 — 35 PSU / 30°C
              </div>
            </div>
            <div className="text-slate-500 flex items-center justify-between font-mono text-xs pt-1">
              <span>Cycle #184</span>
              <span className="text-sky-700 font-bold">CTD Quality: Grade-A</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <button className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md active:scale-[0.98]">
            <span className="material-symbols-outlined text-[18px]">view_in_ar</span>
            <span>Open Full 3D Scene</span>
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button className="py-2 px-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-2xs">
              <span className="material-symbols-outlined text-[16px] text-slate-500">download</span>
              <span>NetCDF</span>
            </button>
            <button className="py-2 px-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-2xs">
              <span className="material-symbols-outlined text-[16px] text-slate-500">share</span>
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
