import { useEffect, useState } from 'react'
import { Chart as ChartJS, LinearScale, PointElement, Tooltip, Legend } from 'chart.js'
import { Scatter } from 'react-chartjs-2'
import apiClient from '../../api/client'
import { useAppStore } from '../../store/useAppStore'

ChartJS.register(LinearScale, PointElement, Tooltip, Legend)

export default function CorrelationView() {
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [correlationType, setCorrelationType] = useState('temp-sal')
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
        <h3 className="text-sm font-semibold text-slate-700">Correlation View</h3>
        <div className="p-4 bg-sky-50 rounded border border-sky-200 text-center">
          <p className="text-xs text-slate-600">Select a float to view variable correlations</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-slate-700">Correlation View</h3>
        <div className="text-xs text-slate-500">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-slate-700">Correlation View</h3>
        <div className="text-xs text-red-600">Error: {error}</div>
      </div>
    )
  }

  const getChartData = () => {
    switch (correlationType) {
      case 'temp-sal': {
        const data = profiles
          .filter((p) => p.temperatureC !== null && p.salinityPsu !== null)
          .map((p) => ({ x: p.temperatureC, y: p.salinityPsu }))
        return {
          datasets: [{ label: 'Temperature vs Salinity', data, backgroundColor: 'rgba(59, 130, 246, 0.6)', borderColor: '#3b82f6' }],
          xLabel: 'Temperature (°C)',
          yLabel: 'Salinity (PSU)',
        }
      }
      case 'temp-chl': {
        const data = profiles
          .filter((p) => p.temperatureC !== null && p.chlorophyll !== null)
          .map((p) => ({ x: p.temperatureC, y: p.chlorophyll }))
        return {
          datasets: [{ label: 'Temperature vs Chlorophyll', data, backgroundColor: 'rgba(34, 197, 94, 0.6)', borderColor: '#22c55e' }],
          xLabel: 'Temperature (°C)',
          yLabel: 'Chlorophyll (mg/m³)',
        }
      }
      case 'sal-chl': {
        const data = profiles
          .filter((p) => p.salinityPsu !== null && p.chlorophyll !== null)
          .map((p) => ({ x: p.salinityPsu, y: p.chlorophyll }))
        return {
          datasets: [{ label: 'Salinity vs Chlorophyll', data, backgroundColor: 'rgba(251, 146, 60, 0.6)', borderColor: '#fb923c' }],
          xLabel: 'Salinity (PSU)',
          yLabel: 'Chlorophyll (mg/m³)',
        }
      }
      default:
        return { datasets: [], xLabel: '', yLabel: '' }
    }
  }

  const chartInfo = getChartData()

  if (chartInfo.datasets[0]?.data?.length === 0) {
    return (
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-slate-700">Correlation View</h3>
        <select
          value={correlationType}
          onChange={(e) => setCorrelationType(e.target.value)}
          className="px-2 py-1 text-xs border border-slate-300 rounded bg-white"
        >
          <option value="temp-sal">Temperature vs Salinity</option>
          <option value="temp-chl">Temperature vs Chlorophyll</option>
          <option value="sal-chl">Salinity vs Chlorophyll</option>
        </select>
        <div className="text-xs text-slate-500">No data available for selected correlation</div>
      </div>
    )
  }

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top', labels: { font: { size: 10 } } },
      tooltip: { callbacks: { label: (ctx) => `x: ${ctx.raw.x.toFixed(2)}, y: ${ctx.raw.y.toFixed(2)}` } },
    },
    scales: {
      x: { title: { display: true, text: chartInfo.xLabel, font: { size: 10 } } },
      y: { title: { display: true, text: chartInfo.yLabel, font: { size: 10 } } },
    },
  }

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-slate-700">Correlation View</h3>
      <select
        value={correlationType}
        onChange={(e) => setCorrelationType(e.target.value)}
        className="px-2 py-1 text-xs border border-slate-300 rounded bg-white hover:border-slate-400"
      >
        <option value="temp-sal">Temperature vs Salinity</option>
        <option value="temp-chl">Temperature vs Chlorophyll</option>
        <option value="sal-chl">Salinity vs Chlorophyll</option>
      </select>
      <div className="bg-white p-3 rounded border border-slate-200" style={{ height: '300px' }}>
        <Scatter data={chartInfo} options={options} />
      </div>
    </div>
  )
}
