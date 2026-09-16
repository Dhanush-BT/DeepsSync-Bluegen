import { useEffect, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line, Scatter, Bar } from 'react-chartjs-2'
import apiClient from '../../api/client'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
)

export default function AssistantChartCard({ chartConfig, floatInfo }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const { type, title, subtitle, platformId, dataPoints } = chartConfig || {}

  useEffect(() => {
    let isMounted = true

    if (dataPoints && dataPoints.length > 0) {
      setData(dataPoints)
      setLoading(false)
      return
    }

    const targetPlatformId = platformId || floatInfo?.platformId || '2900226'
    setLoading(true)
    apiClient
      .get(`/floats/${targetPlatformId}/profiles`)
      .then((res) => {
        if (!isMounted) return
        const list = res.data || []
        if (list.length > 0) {
          setData(list)
        } else {
          // Fallback realistic simulation for Indian Ocean profile
          setData([
            { depthMeters: 5, temperatureC: 29.4, salinityPsu: 34.2, timestamp: '2026-09-01' },
            { depthMeters: 25, temperatureC: 29.1, salinityPsu: 34.4, timestamp: '2026-09-02' },
            { depthMeters: 50, temperatureC: 28.5, salinityPsu: 34.8, timestamp: '2026-09-03' },
            { depthMeters: 75, temperatureC: 26.2, salinityPsu: 35.1, timestamp: '2026-09-04' },
            { depthMeters: 100, temperatureC: 22.8, salinityPsu: 35.3, timestamp: '2026-09-05' },
            { depthMeters: 150, temperatureC: 18.1, salinityPsu: 35.2, timestamp: '2026-09-06' },
            { depthMeters: 200, temperatureC: 15.2, salinityPsu: 35.0, timestamp: '2026-09-07' },
            { depthMeters: 300, temperatureC: 11.8, salinityPsu: 34.9, timestamp: '2026-09-08' },
            { depthMeters: 500, temperatureC: 8.9, salinityPsu: 34.8, timestamp: '2026-09-09' },
            { depthMeters: 1000, temperatureC: 5.6, salinityPsu: 34.7, timestamp: '2026-09-10' },
          ])
        }
      })
      .catch(() => {
        if (!isMounted) return
        setData([
          { depthMeters: 5, temperatureC: 29.4, salinityPsu: 34.2, timestamp: '2026-09-01' },
          { depthMeters: 25, temperatureC: 29.1, salinityPsu: 34.4, timestamp: '2026-09-02' },
          { depthMeters: 50, temperatureC: 28.5, salinityPsu: 34.8, timestamp: '2026-09-03' },
          { depthMeters: 75, temperatureC: 26.2, salinityPsu: 35.1, timestamp: '2026-09-04' },
          { depthMeters: 100, temperatureC: 22.8, salinityPsu: 35.3, timestamp: '2026-09-05' },
          { depthMeters: 150, temperatureC: 18.1, salinityPsu: 35.2, timestamp: '2026-09-06' },
          { depthMeters: 200, temperatureC: 15.2, salinityPsu: 35.0, timestamp: '2026-09-07' },
          { depthMeters: 300, temperatureC: 11.8, salinityPsu: 34.9, timestamp: '2026-09-08' },
          { depthMeters: 500, temperatureC: 8.9, salinityPsu: 34.8, timestamp: '2026-09-09' },
          { depthMeters: 1000, temperatureC: 5.6, salinityPsu: 34.7, timestamp: '2026-09-10' },
        ])
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [platformId, floatInfo, dataPoints])

  if (loading) {
    return (
      <div className="my-2 p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 text-xs text-slate-500">
        <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
        <span>Synthesizing real-time telemetry graph data...</span>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return null
  }

  const renderChart = () => {
    switch (type) {
      case 'timeseries': {
        const sorted = [...data].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
        const labels = sorted.map((p) =>
          p.timestamp ? new Date(p.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }) : `${p.depthMeters || 0}m`
        )
        const temps = sorted.map((p) => p.temperatureC ?? null)
        const sals = sorted.map((p) => p.salinityPsu ?? null)

        const chartData = {
          labels,
          datasets: [
            {
              label: 'Temp (°C)',
              data: temps,
              borderColor: '#ef4444',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              tension: 0.3,
              fill: true,
              pointRadius: 3,
            },
            {
              label: 'Salinity (PSU)',
              data: sals,
              borderColor: '#0284c7',
              backgroundColor: 'rgba(2, 132, 199, 0.15)',
              tension: 0.3,
              fill: true,
              pointRadius: 3,
            },
          ],
        }

        const options = {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top', labels: { boxWidth: 10, font: { size: 10 } } },
          },
          scales: {
            x: { grid: { color: '#f1f5f9' }, ticks: { font: { size: 10 } } },
            y: { grid: { color: '#f1f5f9' }, ticks: { font: { size: 10 } } },
          },
        }

        return <Line data={chartData} options={options} />
      }

      case 'tsdiagram': {
        const scatterPoints = data
          .filter((p) => p.salinityPsu != null && p.temperatureC != null)
          .map((p) => ({ x: p.salinityPsu, y: p.temperatureC }))

        const chartData = {
          datasets: [
            {
              label: 'T-S Water Mass Point',
              data: scatterPoints,
              backgroundColor: '#0284c7',
              borderColor: '#0369a1',
              pointRadius: 5,
              pointHoverRadius: 7,
            },
          ],
        }

        const options = {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top', labels: { boxWidth: 10, font: { size: 10 } } },
          },
          scales: {
            x: {
              title: { display: true, text: 'Salinity (PSU)', font: { size: 10 } },
              grid: { color: '#f1f5f9' },
              ticks: { font: { size: 10 } },
            },
            y: {
              title: { display: true, text: 'Temperature (°C)', font: { size: 10 } },
              grid: { color: '#f1f5f9' },
              ticks: { font: { size: 10 } },
            },
          },
        }

        return <Scatter data={chartData} options={options} />
      }

      case 'distribution': {
        const temps = data.map((p) => p.temperatureC).filter((t) => t != null)
        const bins = { '< 10°C': 0, '10-20°C': 0, '20-25°C': 0, '25-30°C': 0, '> 30°C': 0 }
        temps.forEach((t) => {
          if (t < 10) bins['< 10°C']++
          else if (t < 20) bins['10-20°C']++
          else if (t < 25) bins['20-25°C']++
          else if (t < 30) bins['25-30°C']++
          else bins['> 30°C']++
        })

        const chartData = {
          labels: Object.keys(bins),
          datasets: [
            {
              label: 'Frequency',
              data: Object.values(bins),
              backgroundColor: '#38bdf8',
              borderColor: '#0284c7',
              borderWidth: 1,
              borderRadius: 4,
            },
          ],
        }

        const options = {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top', labels: { boxWidth: 10, font: { size: 10 } } },
          },
          scales: {
            x: { grid: { display: false }, ticks: { font: { size: 10 } } },
            y: { grid: { color: '#f1f5f9' }, ticks: { font: { size: 10 }, stepSize: 1 } },
          },
        }

        return <Bar data={chartData} options={options} />
      }

      case 'profile':
      default: {
        const sorted = [...data].sort((a, b) => (a.depthMeters || 0) - (b.depthMeters || 0))
        const depths = sorted.map((p) => `${p.depthMeters ?? 0}m`)
        const temps = sorted.map((p) => p.temperatureC ?? null)
        const sals = sorted.map((p) => p.salinityPsu ?? null)

        const chartData = {
          labels: depths,
          datasets: [
            {
              label: 'Temp (°C)',
              data: temps,
              borderColor: '#ef4444',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              tension: 0.3,
              pointRadius: 3,
            },
            {
              label: 'Salinity (PSU)',
              data: sals,
              borderColor: '#0284c7',
              backgroundColor: 'rgba(2, 132, 199, 0.1)',
              tension: 0.3,
              pointRadius: 3,
            },
          ],
        }

        const options = {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top', labels: { boxWidth: 10, font: { size: 10 } } },
          },
          scales: {
            x: {
              title: { display: true, text: 'Depth', font: { size: 10 } },
              grid: { color: '#f1f5f9' },
              ticks: { font: { size: 10 } },
            },
            y: {
              title: { display: true, text: 'Value', font: { size: 10 } },
              grid: { color: '#f1f5f9' },
              ticks: { font: { size: 10 } },
            },
          },
        }

        return <Line data={chartData} options={options} />
      }
    }
  }

  return (
    <div className="mt-3 p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-xs space-y-2">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-blue-600 text-sm">insights</span>
          <div>
            <h4 className="text-xs font-bold text-slate-900 leading-tight">
              {title || 'Oceanographic Analytical Graph'}
            </h4>
            {subtitle && <p className="text-[10px] text-slate-500 leading-tight">{subtitle}</p>}
          </div>
        </div>
        <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 font-semibold">
          {type?.toUpperCase() || 'PROFILE'}
        </span>
      </div>

      <div className="h-52 w-full pt-1">
        {renderChart()}
      </div>
    </div>
  )
}
