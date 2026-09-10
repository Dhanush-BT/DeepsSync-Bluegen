import { useEffect, useState } from 'react'
import apiClient from '../../api/client'
import { useAppStore } from '../../store/useAppStore'

export default function FloatSelector() {
  const [floats, setFloats] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedInstrument, setSelectedInstrument] = useState('')
  const { selectedFloat, setSelectedFloat } = useAppStore()

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (selectedInstrument) params.append('instrumentType', selectedInstrument)

    apiClient
      .get(`/floats?${params.toString()}`)
      .then((res) => {
        setFloats(res.data || [])
        setError(null)
      })
      .catch((err) => {
        console.error('Failed to fetch floats:', err)
        setError(err.message)
      })
      .finally(() => setLoading(false))
  }, [selectedInstrument])

  return (
    <div className="flex flex-col gap-3">
      <label className="text-xs font-semibold text-slate-700">Select Instrument</label>

      <div className="space-y-2">
        <div>
          <label className="text-xs text-slate-600">Instrument Type</label>
          <select
            value={selectedInstrument}
            onChange={(e) => setSelectedInstrument(e.target.value)}
            className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded bg-white hover:border-slate-400 transition-all"
          >
            <option value="">All Types</option>
            <option value="ARGO_FLOAT">ARGO Float</option>
            <option value="GLIDER">Glider</option>
          </select>
        </div>

        {!loading && floats.length > 0 && (
          <div>
            <label className="text-xs text-slate-600">Float / Instrument</label>
            <select
              value={selectedFloat?.platformId || ''}
              onChange={(e) => {
                const float = floats.find((f) => f.platformId === e.target.value)
                setSelectedFloat(float || null)
              }}
              className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded bg-white hover:border-slate-400 transition-all"
            >
              <option value="">-- Select an instrument --</option>
              {floats.map((float) => (
                <option key={float.platformId} value={float.platformId}>
                  {float.platformId} ({float.instrumentType}) - {float.profileCount} profiles
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loading && <div className="text-xs text-slate-500">Loading floats...</div>}
      {error && <div className="text-xs text-red-600">Error: {error}</div>}
      {!loading && floats.length === 0 && (
        <div className="text-xs text-slate-500">No floats found for selected filter</div>
      )}

      {selectedFloat && (
        <div className="mt-2 p-2 bg-sky-50 rounded border border-sky-200">
          <p className="text-xs font-semibold text-slate-700">Selected: {selectedFloat.platformId}</p>
          <div className="text-xs text-slate-600 grid grid-cols-2 gap-1 mt-1">
            <span>Type: {selectedFloat.instrumentType}</span>
            <span>Profiles: {selectedFloat.profileCount}</span>
            <span>Lat: {selectedFloat.latitude?.toFixed(2)}</span>
            <span>Lon: {selectedFloat.longitude?.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  )
}
