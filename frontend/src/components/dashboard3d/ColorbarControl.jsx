import { useAppStore } from '../../store/useAppStore'

const VARIABLE_UNITS = {
  temperatureC: '°C',
  salinityPsu: 'PSU',
  currentSpeed: 'm/s',
  chlorophyll: 'mg/m³',
}

export default function ColorbarControl() {
  const { selectedVariable, colorbarAuto, colorbarMin, colorbarMax, setColorbarAuto } = useAppStore()

  const unit = VARIABLE_UNITS[selectedVariable] || ''
  const displayMin = colorbarMin ?? 0
  const displayMax = colorbarMax ?? 100

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-700">Colorbar</label>
          <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
            <input type="checkbox" checked={colorbarAuto} onChange={(e) => setColorbarAuto(e.target.checked)} className="w-3 h-3" />
            <span>Scale: Auto min/max</span>
          </label>
        </div>

        <div className="h-6 bg-gradient-to-r from-blue-600 via-cyan-500 to-red-600 rounded border border-slate-300" />

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-slate-600">Min</label>
            <div className="text-slate-900 font-semibold">{displayMin.toFixed(1)}</div>
          </div>
          <div>
            <label className="text-slate-600">Max</label>
            <div className="text-slate-900 font-semibold">{displayMax.toFixed(1)}</div>
          </div>
        </div>

        <div className="text-xs text-center text-slate-600">
          {displayMin.toFixed(1)} {unit} — {displayMax.toFixed(1)} {unit}
        </div>
      </div>
    </div>
  )
}
