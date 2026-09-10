import { useEffect, useState } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'
import { Line } from 'react-chartjs-2'
import apiClient from '../../api/client'
import { useAppStore } from '../../store/useAppStore'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

export default function TimeSeriesChart() {
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { selectedFloat } = useAppStore()

  useEffect(() => {
    if (!selectedFloat) {
      setProfiles([])
      return
    }

    setLoading(true)
    apiClient
      .get(`/floats/${selectedFloat.platformId}/profiles`)
      .then((res) => {
        const sorted = (res.data || []).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
        setProfiles(sorted)
        setError(null)
      })
      .catch((err) => {
        console.error('Failed to fetch profiles:', err)
        setError(err.message)
      })
      .finally(() => setLoading(false))
  }, [selectedFloat])

  if (!selectedFloat) {
    return (
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-slate-700">Time Series Chart</h3>
        <div className="p-4 bg-sky-50 rounded border border-sky-200 text-center">
          <p className="text-xs text-slate-600">Select a float to view time series data</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-slate-700">Time Series Chart</h3>
        <div className="text-xs text-slate-500">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-slate-700">Time Series Chart</h3>
        <div className="text-xs text-red-600">Error: {error}</div>
      </div>
    )
  }

  if (profiles.length === 0) {
    return (
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-slate-700">Time Series Chart</h3>
        <div className="text-xs text-slate-500">No data available</div>
      </div>
    )
  }

  const timestamps = profiles.map((p) => new Date(p.timestamp).toLocaleDateString())
  const temperatures = profiles.map((p) => p.temperatureC || null)
  const salinities = profiles.map((p) => p.salinityPsu || null)

  const chartData = {
    labels: timestamps,
    datasets: [
      {
        label: 'Temperature (°C)',
        data: temperatures,
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.3,
      },
      {
        label: 'Salinity (PSU)',
        data: salinities,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.3,
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top', labels: { font: { size: 10 }, usePointStyle: true } },
      title: { display: false },
    },
    scales: {
      x: {
        title: { display: true, text: 'Time', font: { size: 10 } },
      },
      y: {
        title: { display: true, text: 'Value', font: { size: 10 } },
      },
    },
  }

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-slate-700">Time Series Chart</h3>
      <div className="bg-white p-3 rounded border border-slate-200" style={{ height: '300px' }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  )
}
