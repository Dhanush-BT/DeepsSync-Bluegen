import { useEffect, useState } from 'react'
import apiClient from '../../api/client'
import { useAppStore } from '../../store/useAppStore'

export default function TimeSlider() {
  const [timestamps, setTimestamps] = useState([])
  const [loading, setLoading] = useState(false)
  const { filter, setFilter } = useAppStore()

  useEffect(() => {
    setLoading(true)
    apiClient
      .get('/ocean-data/axes')
      .then((res) => {
        if (res.data?.timestamps) {
          setTimestamps(res.data.timestamps.sort())
        }
      })
      .catch((err) => console.error('Failed to fetch timestamps:', err))
      .finally(() => setLoading(false))
  }, [])

  if (loading || timestamps.length === 0) {
    return <div className="text-xs text-slate-500">Loading timestamps...</div>
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold text-slate-700">Timestamp</label>
      <select
        value={filter.timestamp || ''}
        onChange={(e) => setFilter({ timestamp: e.target.value || null })}
        className="px-3 py-2 text-sm border border-sky-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-ocean-500"
      >
        <option value="">All timestamps</option>
        {timestamps.map((ts) => (
          <option key={ts} value={ts}>
            {new Date(ts).toLocaleString()}
          </option>
        ))}
      </select>
      {filter.timestamp && (
        <div className="text-xs text-ocean-600 font-semibold">
          Selected: {new Date(filter.timestamp).toLocaleString()}
        </div>
      )}
    </div>
  )
}
