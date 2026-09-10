import { useEffect, useState } from 'react'
import { useAppStore } from '../../store/useAppStore'

const VARIABLE_UNITS = {
  temperatureC: '°C',
  salinityPsu: 'PSU',
  currentSpeed: 'm/s',
  chlorophyll: 'mg/m³',
}

export default function ColorbarControl({ minValue, maxValue }) {
  const { selectedVariable, colorbarAuto, colorbarMin, colorbarMax, setColorbarAuto, setColorbarRange } = useAppStore()
  const [localMin, setLocalMin] = useState(colorbarMin ?? minValue ?? 0)
  const [localMax, setLocalMax] = useState(colorbarMax ?? maxValue ?? 100)

  useEffect(() => {
    if (colorbarAuto && minValue !== null && maxValue !== null) {
      setLocalMin(minValue)
      setLocalMax(maxValue)
    }
  }, [colorbarAuto, minValue, maxValue])

  const handleAutoToggle = () => {
    setColorbarAuto(!colorbarAuto)
    if (!colorbarAuto && minValue !== null && maxValue !== null) {
      setColorbarRange(minValue, maxValue)
    }
  }

  const handleMinChange = (e) => {
    const val = parseFloat(e.target.value)
    setLocalMin(val)
    setColorbarRange(val, localMax)
  }

  const handleMaxChange = (e) => {
    const val = parseFloat(e.target.value)
    setLocalMax(val)
    setColorbarRange(localMin, val)
  }

  const unit = VARIABLE_UNITS[selectedVariable] || ''

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-700">Colorbar</label>
          <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
            <input type="checkbox" checked={colorbarAuto} onChange={handleAutoToggle} className="w-3 h-3" />
            <span>Scale: Auto min/max</span>
          </label>
        </div>

        <div className="h-6 bg-gradient-to-r from-blue-600 via-cyan-500 to-red-600 rounded border border-slate-300" />

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-slate-600">Min</label>
            {!colorbarAuto ? (
              <input
                type="number"
                value={localMin}
                onChange={handleMinChange}
                className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
              />
            ) : (
              <div className="text-slate-900 font-semibold">{localMin.toFixed(1)}</div>
            )}
          </div>
          <div>
            <label className="text-slate-600">Max</label>
            {!colorbarAuto ? (
              <input
                type="number"
                value={localMax}
                onChange={handleMaxChange}
                className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
              />
            ) : (
              <div className="text-slate-900 font-semibold">{localMax.toFixed(1)}</div>
            )}
          </div>
        </div>

        <div className="text-xs text-center text-slate-600">
          {localMin.toFixed(1)} {unit} — {localMax.toFixed(1)} {unit}
        </div>
      </div>
    </div>
  )
}
