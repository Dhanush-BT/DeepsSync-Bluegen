import { useEffect, useState } from 'react'
import apiClient from '../../api/client'
import { useAppStore } from '../../store/useAppStore'

export default function DepthSlider() {
  const [depths, setDepths] = useState({ min: 0, max: 5000 })
  const [loading, setLoading] = useState(false)
  const { filter, setFilter } = useAppStore()

  useEffect(() => {
    setLoading(true)
    apiClient
      .get('/ocean-data/axes')
      .then((res) => {
        if (res.data?.depths) {
          const depthValues = res.data.depths.sort((a, b) => a - b)
          setDepths({
            min: Math.min(...depthValues),
            max: Math.max(...depthValues),
          })
        }
      })
      .catch((err) => console.error('Failed to fetch depths:', err))
      .finally(() => setLoading(false))
  }, [])

  const handleMinChange = (e) => {
    const val = parseFloat(e.target.value)
    setFilter({ minDepth: val })
  }

  const handleMaxChange = (e) => {
    const val = parseFloat(e.target.value)
    setFilter({ maxDepth: val })
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold text-slate-700">Depth Range (meters)</label>

      {!loading && (
        <>
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-600">Min: {filter.minDepth !== null ? filter.minDepth : depths.min}m</span>
              <span className="text-xs text-slate-600">Max: {filter.maxDepth !== null ? filter.maxDepth : depths.max}m</span>
            </div>
            <input
              type="range"
              min={depths.min}
              max={depths.max}
              step="100"
              value={filter.minDepth !== null ? filter.minDepth : depths.min}
              onChange={handleMinChange}
              className="w-full h-2 bg-sky-200 rounded-lg appearance-none cursor-pointer"
            />
            <input
              type="range"
              min={depths.min}
              max={depths.max}
              step="100"
              value={filter.maxDepth !== null ? filter.maxDepth : depths.max}
              onChange={handleMaxChange}
              className="w-full h-2 bg-sky-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {(filter.minDepth !== null || filter.maxDepth !== null) && (
            <button
              onClick={() => setFilter({ minDepth: null, maxDepth: null })}
              className="px-2 py-1 text-xs rounded bg-sky-100 text-sky-900 hover:bg-sky-200 transition-all"
            >
              Reset Depth
            </button>
          )}
        </>
      )}

      {loading && <div className="text-xs text-slate-500">Loading depth range...</div>}
    </div>
  )
}
