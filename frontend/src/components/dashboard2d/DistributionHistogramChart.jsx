import { useEffect, useState } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { Bar } from 'react-chartjs-2'
import apiClient from '../../api/client'
import { useAppStore } from '../../store/useAppStore'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export default function DistributionHistogramChart() {
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
        <h3 className="text-sm font-semibold text-slate-700">Distribution Histogram</h3>
        <div className="p-4 bg-sky-50 rounded border border-sky-200 text-center">
          <p className="text-xs text-slate-600">Select a float to view distribution</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-slate-700">Distribution Histogram</h3>
        <div className="text-xs text-slate-500">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-slate-700">Distribution Histogram</h3>
        <div className="text-xs text-red-600">Error: {error}</div>
      </div>
    )
  }

  const temps = profiles.filter((p) => p.temperatureC !== null).map((p) => p.temperatureC)
  if (temps.length === 0) {
    return (
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-slate-700">Distribution Histogram</h3>
        <div className="text-xs text-slate-500">No temperature data available</div>
      </div>
    )
  }

  const min = Math.floor(Math.min(...temps))
  const max = Math.ceil(Math.max(...temps))
  const binCount = Math.min(15, Math.ceil(temps.length / 2))
  const binSize = (max - min) / binCount

  const bins = Array(binCount).fill(0)
  temps.forEach((t) => {
    const binIndex = Math.min(binCount - 1, Math.floor((t - min) / binSize))
    if (binIndex >= 0) bins[binIndex]++
  })

  const labels = Array.from({ length: binCount }, (_, i) => {
    const binMin = (min + i * binSize).toFixed(1)
    const binMax = (min + (i + 1) * binSize).toFixed(1)
    return `${binMin}-${binMax}°C`
  })

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Frequency',
        data: bins,
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: '#3b82f6',
        borderWidth: 1,
      },
    ],
  }

  const options = {
    responsive: true,
    indexAxis: 'x',
    plugins: {
      legend: { position: 'top', labels: { font: { size: 10 } } },
      title: { display: false },
    },
    scales: {
      x: {
        title: { display: true, text: 'Temperature Range (°C)', font: { size: 10 } },
        ticks: { font: { size: 8 } },
      },
      y: {
        title: { display: true, text: 'Count', font: { size: 10 } },
      },
    },
  }

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-slate-700">Distribution Histogram</h3>
      <div className="bg-white p-3 rounded border border-slate-200" style={{ height: '300px' }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  )
}
