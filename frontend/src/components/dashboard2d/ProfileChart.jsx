import { useEffect, useState } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'
import { Line } from 'react-chartjs-2'
import apiClient from '../../api/client'
import { useAppStore } from '../../store/useAppStore'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

export default function ProfileChart() {
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
        const valid = (res.data || [])
          .filter((p) => p && p.depthMeters !== null && p.depthMeters < 9000 && p.depthMeters >= 0)
          .filter((p) => (p.temperatureC !== null && p.temperatureC < 100 && p.temperatureC > -10) || (p.salinityPsu !== null && p.salinityPsu < 100 && p.salinityPsu >= 0))
        const sorted = valid.sort((a, b) => (a.depthMeters || 0) - (b.depthMeters || 0))
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
        <h3 className="text-sm font-semibold text-slate-700">Profile Chart (Depth vs Temperature/Salinity)</h3>
        <div className="p-4 bg-sky-50 rounded border border-sky-200 text-center">
          <p className="text-xs text-slate-600">Select a float to view depth profiles</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-slate-700">Profile Chart</h3>
        <div className="text-xs text-slate-500">Loading profiles...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-slate-700">Profile Chart</h3>
        <div className="text-xs text-red-600">Error: {error}</div>
      </div>
    )
  }

  if (profiles.length === 0) {
    return (
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-slate-700">Profile Chart</h3>
        <div className="text-xs text-slate-500">No profile data available</div>
      </div>
    )
  }

  const depths = profiles.map((p) => p.depthMeters?.toFixed(0) || '0')
  const temperatures = profiles.map((p) => p.temperatureC || null)
  const salinities = profiles.map((p) => p.salinityPsu || null)

  const chartData = {
    labels: depths,
    datasets: [
      {
        label: 'Temperature (°C)',
        data: temperatures,
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.3,
        yAxisID: 'y',
      },
      {
        label: 'Salinity (PSU)',
        data: salinities,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.3,
        yAxisID: 'y1',
      },
    ],
  }

  const options = {
    responsive: true,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { position: 'top', labels: { font: { size: 10 }, usePointStyle: true } },
      title: { display: false },
    },
    scales: {
      x: {
        title: { display: true, text: 'Depth (m)', font: { size: 10 } },
        reverse: true,
      },
      y: {
        type: 'linear',
        position: 'left',
        title: { display: true, text: 'Temperature (°C)', font: { size: 10 }, color: '#ef4444' },
        ticks: { color: '#ef4444', font: { size: 9 } },
      },
      y1: {
        type: 'linear',
        position: 'right',
        title: { display: true, text: 'Salinity (PSU)', font: { size: 10 }, color: '#3b82f6' },
        ticks: { color: '#3b82f6', font: { size: 9 } },
        grid: { drawOnChartArea: false },
      },
    },
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="bg-white p-2 rounded-xl border border-slate-200" style={{ height: '360px' }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  )
}
