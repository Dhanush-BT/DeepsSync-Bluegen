import { useEffect, useState } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'
import { Bubble } from 'react-chartjs-2'
import apiClient from '../../api/client'
import { useAppStore } from '../../store/useAppStore'

ChartJS.register(CategoryScale, LinearScale, Tooltip, Legend)

export default function AlongTrackSectionChart() {
  const [profiles, setProfiles] = useState([])
  const [track, setTrack] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { selectedFloat } = useAppStore()

  useEffect(() => {
    if (!selectedFloat) {
      setProfiles([])
      setTrack([])
      return
    }

    setLoading(true)
    Promise.all([
      apiClient.get(`/floats/${selectedFloat.platformId}/profiles`),
      apiClient.get(`/floats/${selectedFloat.platformId}/track`),
    ])
      .then(([profileRes, trackRes]) => {
        const sortedProfiles = (profileRes.data || []).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
        const sortedTrack = (trackRes.data || []).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
        setProfiles(sortedProfiles)
        setTrack(sortedTrack)
        setError(null)
      })
      .catch((err) => {
        console.error('Failed to fetch data:', err)
        setError(err.message)
      })
      .finally(() => setLoading(false))
  }, [selectedFloat])

  if (!selectedFloat) {
    return (
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-slate-700">Along-Track Section</h3>
        <div className="p-4 bg-sky-50 rounded border border-sky-200 text-center">
          <p className="text-xs text-slate-600">Select a float to view along-track data</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-slate-700">Along-Track Section</h3>
        <div className="text-xs text-slate-500">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-slate-700">Along-Track Section</h3>
        <div className="text-xs text-red-600">Error: {error}</div>
      </div>
    )
  }

  if (profiles.length === 0 || track.length === 0) {
    return (
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-slate-700">Along-Track Section</h3>
        <div className="text-xs text-slate-500">No data available</div>
      </div>
    )
  }

  const points = profiles
    .filter((p) => p.temperatureC !== null && p.depthMeters !== null)
    .map((p, idx) => ({
      x: idx,
      y: p.depthMeters,
      r: Math.max(4, Math.min(12, (p.temperatureC + 5) * 1.5)),
      temp: p.temperatureC,
    }))

  const chartData = {
    datasets: [
      {
        label: 'Temperature (°C)',
        data: points,
        backgroundColor: points.map((p) => {
          const t = p.temp
          if (t < 5) return 'rgba(6, 78, 189, 0.6)'
          if (t < 10) return 'rgba(59, 130, 246, 0.6)'
          if (t < 15) return 'rgba(34, 197, 94, 0.6)'
          if (t < 20) return 'rgba(251, 146, 60, 0.6)'
          return 'rgba(239, 68, 68, 0.6)'
        }),
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
            const point = context.raw
            return `Profile ${point.x + 1}, T: ${point.temp.toFixed(2)}°C, Depth: ${point.y.toFixed(0)}m`
          },
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: 'Profile Index (Along Track)', font: { size: 10 } },
      },
      y: {
        title: { display: true, text: 'Depth (m)', font: { size: 10 } },
        reverse: true,
      },
    },
  }

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-slate-700">Along-Track Section</h3>
      <div className="bg-white p-3 rounded border border-slate-200" style={{ height: '300px' }}>
        <Bubble data={chartData} options={options} />
      </div>
    </div>
  )
}
