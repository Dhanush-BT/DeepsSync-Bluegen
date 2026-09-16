import { useEffect, useState } from 'react'
import apiClient from '../../api/client'

export default function DatasetSelector({ selectedDatasets, onDatasetChange }) {
  const [datasets, setDatasets] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        setLoading(true)
        const [datasetsRes, statsRes] = await Promise.all([
          apiClient.get('/datasets'),
          apiClient.get('/datasets/stats'),
        ])
        setDatasets(datasetsRes.data || [])
        setStats(statsRes.data || {})
      } catch (err) {
        console.error('Failed to fetch datasets:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchDatasets()
  }, [])

  const handleDatasetToggle = (dataset) => {
    const newSelected = selectedDatasets.includes(dataset)
      ? selectedDatasets.filter(d => d !== dataset)
      : [...selectedDatasets, dataset]
    onDatasetChange(newSelected)
  }

  const datasetDescriptions = {
    argo: 'Argo float profiles - temperature & salinity profiles',
    bgc: 'Bio-Geo-Chemical floats - biogeochemical profiles',
    ctd: 'CTD casts - conductivity-temperature-depth data',
    glider: 'Glider trajectories - autonomous glider survey data',
    igora: 'IGORA HYCOM model - gridded ocean model output',
    hycom: 'HYCOM model - hydrodynamic model data',
    hazards: 'Hazard forecasts - wave and weather alerts',
  }

  if (loading) {
    return <div className="text-slate-500 text-sm">Loading datasets...</div>
  }

  return (
    <div className="bg-white rounded-lg border border-sky-100 p-4 shadow-sm">
      <h3 className="font-semibold text-slate-900 mb-3 text-sm">Available Datasets</h3>
      <div className="space-y-2">
        {datasets.map(dataset => {
          const datasetStats = stats[dataset] || { files: 0, profiles: 0 }
          const isSelected = selectedDatasets.includes(dataset)

          return (
            <label key={dataset} className="flex items-center p-2 hover:bg-sky-50 rounded cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleDatasetToggle(dataset)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <div className="ml-3 flex-1">
                <div className="font-medium text-slate-900 text-sm capitalize">{dataset}</div>
                <div className="text-xs text-slate-500">
                  {datasetStats.profiles} profiles · {datasetStats.files} files
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {datasetDescriptions[dataset] || ''}
                </div>
              </div>
              <div className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                {datasetStats.profiles > 0 ? `${datasetStats.profiles}` : 'No data'}
              </div>
            </label>
          )
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-sky-100">
        <button
          onClick={() => onDatasetChange(datasets)}
          className="w-full px-3 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors"
        >
          Select All
        </button>
        <button
          onClick={() => onDatasetChange([])}
          className="w-full px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 rounded transition-colors mt-2"
        >
          Clear Selection
        </button>
      </div>
    </div>
  )
}
