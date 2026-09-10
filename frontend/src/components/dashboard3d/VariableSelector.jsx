import { useAppStore } from '../../store/useAppStore'

const VARIABLES = [
  { id: 'temperatureC', label: 'Temperature (°C)', unit: '°C' },
  { id: 'salinityPsu', label: 'Salinity (PSU)', unit: 'PSU' },
  { id: 'currentSpeed', label: 'Current Speed (m/s)', unit: 'm/s' },
  { id: 'chlorophyll', label: 'Chlorophyll (mg/m³)', unit: 'mg/m³' },
]

export default function VariableSelector() {
  const { selectedVariable, setSelectedVariable } = useAppStore()

  return (
    <div className="flex flex-col gap-3">
      <label className="text-xs font-semibold text-slate-700">Variable Field</label>
      <select
        value={selectedVariable}
        onChange={(e) => setSelectedVariable(e.target.value)}
        className="w-full px-3 py-2 text-sm border border-slate-300 rounded bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
      >
        {VARIABLES.map((v) => (
          <option key={v.id} value={v.id}>
            {v.label}
          </option>
        ))}
      </select>
    </div>
  )
}
