import { useEffect, useState } from 'react'
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js'
import { PolarArea } from 'react-chartjs-2'
import apiClient from '../../api/client'
import { useAppStore } from '../../store/useAppStore'

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

export default function CurrentRoseChart() {
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
        <h3 className="text-sm font-semibold text-slate-700">Current Rose</h3>
        <div className="p-4 bg-sky-50 rounded border border-sky-200 text-center">
          <p className="text-xs text-slate-600">Select a float to view current distribution</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-slate-700">Current Rose</h3>
        <div className="text-xs text-slate-500">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-slate-700">Current Rose</h3>
        <div className="text-xs text-red-600">Error: {error}</div>
      </div>
    )
  }

  const currents = profiles.filter((p) => p.currentU !== null && p.currentV !== null).map((p) => ({
    u: p.currentU,
    v: p.currentV,
    speed: Math.sqrt(p.currentU * p.currentU + p.currentV * p.currentV),
    direction: (Math.atan2(p.currentU, p.currentV) * 180) / Math.PI + 180,
  }))

  if (currents.length === 0) {
    return (
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-slate-700">Current Rose</h3>
        <div className="text-xs text-slate-500">No current data available</div>
      </div>
    )
  }

  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  const bins = Array(16).fill(0)

  currents.forEach((c) => {
    const binIndex = Math.round((c.direction / 360) * 16) % 16
    bins[binIndex] += c.speed
  })

  const chartData = {
    labels: directions,
    datasets: [
      {
        label: 'Current Speed (m/s)',
        data: bins,
        backgroundColor: [
          'rgba(59, 130, 246, 0.5)',
          'rgba(99, 102, 241, 0.5)',
          'rgba(139, 92, 246, 0.5)',
          'rgba(168, 85, 247, 0.5)',
          'rgba(236, 72, 153, 0.5)',
          'rgba(244, 63, 94, 0.5)',
          'rgba(251, 146, 60, 0.5)',
          'rgba(251, 191, 36, 0.5)',
          'rgba(34, 197, 94, 0.5)',
          'rgba(34, 197, 94, 0.5)',
          'rgba(34, 197, 94, 0.5)',
          'rgba(34, 197, 94, 0.5)',
          'rgba(59, 130, 246, 0.5)',
          'rgba(99, 102, 241, 0.5)',
          'rgba(139, 92, 246, 0.5)',
          'rgba(168, 85, 247, 0.5)',
        ],
        borderColor: '#475569',
        borderWidth: 1,
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top', labels: { font: { size: 10 } } },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.label}: ${context.parsed.r.toFixed(2)} m/s`
          },
        },
      },
    },
    scales: {
      r: {
        title: { display: true, text: 'Current Speed (m/s)', font: { size: 10 } },
      },
    },
  }

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-slate-700">Current Rose</h3>
      <div className="bg-white p-3 rounded border border-slate-200" style={{ height: '300px' }}>
        <PolarArea data={chartData} options={options} />
      </div>
    </div>
  )
}
