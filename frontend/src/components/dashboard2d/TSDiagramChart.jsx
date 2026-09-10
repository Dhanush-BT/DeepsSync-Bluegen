import { useEffect, useState } from 'react'
import { Chart as ChartJS, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'
import { Scatter } from 'react-chartjs-2'
import apiClient from '../../api/client'
import { useAppStore } from '../../store/useAppStore'

ChartJS.register(LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

export default function TSDiagramChart() {
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
        setProfiles(res.data || [])
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
        <h3 className="text-sm font-semibold text-slate-700">T-S Diagram</h3>
        <div className="p-4 bg-sky-50 rounded border border-sky-200 text-center">
          <p className="text-xs text-slate-600">Select a float to view T-S relationship</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-slate-700">T-S Diagram</h3>
        <div className="text-xs text-slate-500">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-slate-700">T-S Diagram</h3>
        <div className="text-xs text-red-600">Error: {error}</div>
      </div>
    )
  }

  if (profiles.length === 0) {
    return (
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-slate-700">T-S Diagram</h3>
        <div className="text-xs text-slate-500">No data available</div>
      </div>
    )
  }

  const points = profiles
    .filter((p) => p.temperatureC !== null && p.salinityPsu !== null)
    .map((p) => ({
      x: p.salinityPsu,
      y: p.temperatureC,
      depth: p.depthMeters || 0,
    }))

  const chartData = {
    datasets: [
      {
        label: 'Temperature-Salinity Relationship',
        data: points,
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: '#3b82f6',
        borderWidth: 1,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top', labels: { font: { size: 10 }, usePointStyle: true } },
      tooltip: {
        callbacks: {
          label: function (context) {
            const point = context.raw
            return `T: ${point.y.toFixed(2)}°C, S: ${point.x.toFixed(2)} PSU, Depth: ${point.depth?.toFixed(0)}m`
          },
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: 'Salinity (PSU)', font: { size: 10 } },
        min: 30,
        max: 40,
      },
      y: {
        title: { display: true, text: 'Temperature (°C)', font: { size: 10 } },
      },
    },
  }

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-slate-700">T-S Diagram</h3>
      <div className="bg-white p-3 rounded border border-slate-200" style={{ height: '300px' }}>
        <Scatter data={chartData} options={options} />
      </div>
    </div>
  )
}
