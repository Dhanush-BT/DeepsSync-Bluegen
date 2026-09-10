import { useState } from 'react'
import { useAppStore } from '../../store/useAppStore'

export default function RegionSelector() {
  const { filter, setFilter } = useAppStore()
  const [showForm, setShowForm] = useState(false)

  const presets = [
    { name: 'All', values: {} },
    { name: 'Coastal (0-20°N, 70-80°E)', values: { minLat: 0, maxLat: 20, minLon: 70, maxLon: 80 } },
    { name: 'Deep Ocean (15-25°N, 75-85°E)', values: { minLat: 15, maxLat: 25, minLon: 75, maxLon: 85 } },
  ]

  const handlePreset = (values) => {
    setFilter(values)
  }

  const handleInputChange = (key, value) => {
    const numVal = value === '' ? null : parseFloat(value)
    setFilter({ [key]: numVal })
  }

  const clearFilter = () => {
    setFilter({ minLat: null, maxLat: null, minLon: null, maxLon: null })
    setShowForm(false)
  }

  const hasFilter = filter.minLat !== null || filter.maxLat !== null || filter.minLon !== null || filter.maxLon !== null

  return (
    <div className="flex flex-col gap-3">
      <label className="text-xs font-semibold text-slate-700">Region Filter</label>

      <div className="flex flex-wrap gap-1.5">
        {presets.map((preset) => (
          <button
            key={preset.name}
            onClick={() => handlePreset(preset.values)}
            className="px-2.5 py-1.5 text-xs rounded-lg border transition-all"
            style={{
              backgroundColor:
                !hasFilter && preset.values === {} || (hasFilter && preset.values.minLat === filter.minLat)
                  ? '#0ea5e9'
                  : '#f8fafc',
              borderColor: '#e0f2fe',
              color: !hasFilter && preset.values === {} || (hasFilter && preset.values.minLat === filter.minLat) ? 'white' : '#475569',
            }}
          >
            {preset.name}
          </button>
        ))}
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-2.5 py-1.5 text-xs rounded-lg border border-sky-200 text-slate-700 hover:bg-sky-50 transition-all"
        >
          Custom
        </button>
      </div>

      {showForm && (
        <div className="grid grid-cols-2 gap-2 p-3 bg-sky-50 rounded-lg border border-sky-200">
          <div>
            <label className="text-xs text-slate-600">Min Latitude</label>
            <input
              type="number"
              value={filter.minLat === null ? '' : filter.minLat}
              onChange={(e) => handleInputChange('minLat', e.target.value)}
              step="0.1"
              className="w-full px-2 py-1 text-xs border border-sky-200 rounded bg-white"
              placeholder="-90"
            />
          </div>
          <div>
            <label className="text-xs text-slate-600">Max Latitude</label>
            <input
              type="number"
              value={filter.maxLat === null ? '' : filter.maxLat}
              onChange={(e) => handleInputChange('maxLat', e.target.value)}
              step="0.1"
              className="w-full px-2 py-1 text-xs border border-sky-200 rounded bg-white"
              placeholder="90"
            />
          </div>
          <div>
            <label className="text-xs text-slate-600">Min Longitude</label>
            <input
              type="number"
              value={filter.minLon === null ? '' : filter.minLon}
              onChange={(e) => handleInputChange('minLon', e.target.value)}
              step="0.1"
              className="w-full px-2 py-1 text-xs border border-sky-200 rounded bg-white"
              placeholder="-180"
            />
          </div>
          <div>
            <label className="text-xs text-slate-600">Max Longitude</label>
            <input
              type="number"
              value={filter.maxLon === null ? '' : filter.maxLon}
              onChange={(e) => handleInputChange('maxLon', e.target.value)}
              step="0.1"
              className="w-full px-2 py-1 text-xs border border-sky-200 rounded bg-white"
              placeholder="180"
            />
          </div>
          <button
            onClick={clearFilter}
            className="col-span-2 px-2 py-1 text-xs rounded bg-sky-200 text-sky-900 hover:bg-sky-300 transition-all font-semibold"
          >
            Clear Filter
          </button>
        </div>
      )}

      {hasFilter && (
        <div className="text-xs text-ocean-600 font-semibold p-2 bg-sky-50 rounded border border-sky-200">
          Filtered: [{filter.minLat?.toFixed(1)}, {filter.maxLat?.toFixed(1)}] × [{filter.minLon?.toFixed(1)}, {filter.maxLon?.toFixed(1)}]
        </div>
      )}
    </div>
  )
}
