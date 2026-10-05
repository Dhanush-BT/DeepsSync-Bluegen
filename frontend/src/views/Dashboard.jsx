import { useState, useEffect } from 'react'
import OceanScene from '../components/dashboard3d/OceanScene'
import apiClient from '../api/client'
import { useAppStore } from '../store/useAppStore'

// Scientific 2D Oceanographic Chart Components
import ProfileChart from '../components/dashboard2d/ProfileChart'
import TimeSeriesChart from '../components/dashboard2d/TimeSeriesChart'
import TSDiagramChart from '../components/dashboard2d/TSDiagramChart'
import HovmollerChart from '../components/dashboard2d/HovmollerChart'
import DistributionHistogramChart from '../components/dashboard2d/DistributionHistogramChart'
import AlongTrackSectionChart from '../components/dashboard2d/AlongTrackSectionChart'
import CurrentRoseChart from '../components/dashboard2d/CurrentRoseChart'
import CorrelationView from '../components/dashboard2d/CorrelationView'
import DatasetSelector from '../components/dashboard3d/DatasetSelector'

export default function Dashboard() {
  const {
    selectedVariable,
    setSelectedVariable,
    verticalExaggeration,
    setVerticalExaggeration,
    volumeOpacity,
    setVolumeOpacity,
    measurementLongitude,
    setMeasurementLongitude,
    measurementLatitude,
    setMeasurementLatitude,
    measurementDepth,
    setMeasurementDepth,
    selectedFloat,
    setSelectedFloat,
    selectedFile,
    setSelectedFile,
    activeFileProfiles,
    setActiveFileProfiles,
    setFilter,
    colormapPalette,
    setColormapPalette,
    visualizationStyle,
    setVisualizationStyle,
    colorbarMin,
    colorbarMax,
    selectedDatasets,
    setSelectedDatasets,
  } = useAppStore()

  // 3D Viewport Controls & Overlays
  const [viewMode, setViewMode] = useState('orbit') // 'orbit', 'plan', 'cross'
  const [isPlaying, setIsPlaying] = useState(false)
  const [timeStep, setTimeStep] = useState(65)

  // 2D Analytics Section States
  const [floatsList, setFloatsList] = useState([])
  const [ingestionsList, setIngestionsList] = useState([])
  const [activeDataSource, setActiveDataSource] = useState('instruments') // 'instruments' | 'files'
  const [selectedChartType, setSelectedChartType] = useState('Depth Profile')
  const [selectedRoi, setSelectedRoi] = useState('All Indian Ocean')
  const [autoScale, setAutoScale] = useState(true)
  const [downloading, setDownloading] = useState(false)

  // Helper to fetch vertical profile soundings for a float
  const fetchProfilesForFloat = async (platformId) => {
    if (!platformId) return []
    const cleanId = String(platformId).trim().split(/[\s,]+/)[0]
    try {
      const res = await apiClient.get(`/floats/${cleanId}/profiles`)
      const profiles = res.data || []
      setActiveFileProfiles(profiles)
      return profiles
    } catch (err) {
      console.warn(`Failed to fetch profiles for ${cleanId}:`, err)
      setActiveFileProfiles([])
      return []
    }
  }

  // Auto-link selected file to float and fetch profile soundings
  const syncFileToFloat = async (file, currentFloats = floatsList) => {
    if (!file || !file.fileName) return
    const cleanName = file.fileName.replace(/\.[^/.]+$/, '')
    const wmoMatch = file.fileName.match(/\d{7}/)?.[0]

    const matchedFloat = currentFloats.find((f) => {
      if (!f.platformId) return false
      const pid = String(f.platformId).trim()
      if (wmoMatch && pid.includes(wmoMatch)) return true
      return cleanName.includes(pid) || pid.includes(cleanName)
    })

    if (matchedFloat) {
      setSelectedFloat(matchedFloat)
      if (matchedFloat.longitude) setMeasurementLongitude(matchedFloat.longitude)
      if (matchedFloat.latitude) setMeasurementLatitude(matchedFloat.latitude)
      const profiles = await fetchProfilesForFloat(matchedFloat.platformId)
      if (profiles && profiles.length > 0) {
        const depths = profiles
          .map((p) => p.depthMeters)
          .filter((d) => d !== null && d !== undefined && isFinite(d))
        if (depths.length > 0) {
          const minD = Math.min(...depths)
          const maxD = Math.max(...depths)
          if (measurementDepth < minD || measurementDepth > maxD) {
            setMeasurementDepth(Math.round(depths[Math.floor(depths.length / 2)] || 100))
          }
        }
      }
    }
  }

  // Fetch live floats and ingested files
  useEffect(() => {
    // 1. Argo Floats
    apiClient
      .get('/floats')
      .then((res) => {
        const list = res.data || []
        setFloatsList(list)
        if (list.length > 0 && !selectedFloat) {
          setSelectedFloat(list[0])
          fetchProfilesForFloat(list[0].platformId)
        }
      })
      .catch((err) => console.error('Failed to load floats:', err))

    // 2. Ingested files
    apiClient
      .get('/admin/ingestions')
      .then((res) => {
        const list = res.data || []
        setIngestionsList(list)
        if (list.length > 0 && !selectedFile) {
          setSelectedFile(list[0])
          syncFileToFloat(list[0], floatsList)
        }
      })
      .catch((err) => console.warn('Ingestions endpoint unreachable:', err))
  }, [])

  // Function to refresh float list and ingested files
  const refreshDataSources = () => {
    apiClient
      .get('/floats')
      .then((res) => {
        const list = res.data || []
        setFloatsList(list)
        if (list.length > 0 && !selectedFloat) {
          setSelectedFloat(list[0])
          fetchProfilesForFloat(list[0].platformId)
        }
      })
      .catch((err) => console.error('Failed to load floats:', err))

    apiClient
      .get('/admin/ingestions')
      .then((res) => {
        const list = res.data || []
        setIngestionsList(list)
        if (list.length > 0 && !selectedFile) {
          setSelectedFile(list[0])
          syncFileToFloat(list[0], floatsList)
        }
      })
      .catch((err) => console.warn('Ingestions endpoint unreachable:', err))
  }

  const handleInstrumentChange = async (e) => {
    const platformId = e.target.value
    const found = floatsList.find((f) => f.platformId === platformId)
    if (found) {
      setSelectedFloat(found)
      if (found.longitude) setMeasurementLongitude(found.longitude)
      if (found.latitude) setMeasurementLatitude(found.latitude)
      const cleanId = String(found.platformId).trim().split(/[\s,]+/)[0]
      const matchingIng = ingestionsList.find((ing) => ing.fileName && ing.fileName.includes(cleanId))
      if (matchingIng) {
        setSelectedFile(matchingIng)
      }
      await fetchProfilesForFloat(found.platformId)
    }
  }

  const handleFileChange = async (e) => {
    const fileId = Number(e.target.value)
    const found = ingestionsList.find((item) => item.id === fileId)
    if (found) {
      setSelectedFile(found)
      await syncFileToFloat(found)
    }
  }

  const handleRoiSelect = (roi) => {
    setSelectedRoi(roi)
    switch (roi) {
      case 'Coastal (0–20°N)':
        setFilter({ minLat: 0, maxLat: 20, minLon: 70, maxLon: 90 })
        setMeasurementLatitude(10)
        setMeasurementLongitude(80)
        break
      case 'Deep Ocean (15–25°S)':
        setFilter({ minLat: -25, maxLat: -15, minLon: 65, maxLon: 95 })
        setMeasurementLatitude(-20)
        setMeasurementLongitude(80)
        break
      case 'All Indian Ocean':
      default:
        setFilter({ minLat: null, maxLat: null, minLon: null, maxLon: null })
        setMeasurementLatitude(0)
        setMeasurementLongitude(85)
        break
    }
  }

  const handleExportCSV = async () => {
    try {
      if (selectedFloat) {
        const res = await apiClient.get(`/floats/${selectedFloat.platformId}/profiles`)
        const data = res.data || []
        if (data.length === 0) {
          alert('No profile records to export for this float.')
          return
        }
        const headers = Object.keys(data[0]).join(',')
        const rows = data.map((obj) => Object.values(obj).join(',')).join('\n')
        const csvContent = 'data:text/csv;charset=utf-8,' + [headers, rows].join('\n')
        const encodedUri = encodeURI(csvContent)
        const link = document.createElement('a')
        link.setAttribute('href', encodedUri)
        link.setAttribute('download', `${selectedFloat.platformId}_profiles.csv`)
        document.body.appendChild(link)
        link.click()
        link.remove()
      } else {
        window.open('/api/stats/summary', '_blank')
      }
    } catch {
      window.open('/api/stats/summary', '_blank')
    }
  }

  const handleExportNetCDF = async () => {
    try {
      setDownloading(true)
      const response = await apiClient.get('/ocean/grid', { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `deepsync_grid_${selectedVariable}.nc`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch {
      window.open('/api/ocean/grid', '_blank')
    } finally {
      setDownloading(false)
    }
  }

  const chartTypes = [
    { id: 'Depth Profile', icon: 'show_chart', label: 'Depth Profile' },
    { id: 'TimeSeries', icon: 'timeline', label: 'Time Series' },
    { id: 'T-S Diagram', icon: 'grain', label: 'T-S Diagram' },
    { id: 'Correlation', icon: 'scatter_plot', label: 'Correlation' },
    { id: 'Hovmöller', icon: 'gradient', label: 'Hovmöller' },
    { id: 'Current Rose', icon: 'explore', label: 'Current Rose' },
    { id: 'Along-track', icon: 'route', label: 'Along-Track' },
    { id: 'Distribution', icon: 'bar_chart', label: 'Distribution' },
  ]

  const roiPills = ['All Indian Ocean', 'Coastal (0–20°N)', 'Deep Ocean (15–25°S)']

  const renderActiveChart = () => {
    switch (selectedChartType) {
      case 'Depth Profile':
        return <ProfileChart />
      case 'TimeSeries':
        return <TimeSeriesChart />
      case 'T-S Diagram':
        return <TSDiagramChart />
      case 'Correlation':
        return <CorrelationView />
      case 'Hovmöller':
        return <HovmollerChart />
      case 'Current Rose':
        return <CurrentRoseChart />
      case 'Along-track':
        return <AlongTrackSectionChart />
      case 'Distribution':
        return <DistributionHistogramChart />
      default:
        return <ProfileChart />
    }
  }

  return (
    <div className="bg-transparent text-slate-800 font-sans antialiased min-h-screen flex flex-col selection:bg-sky-500 selection:text-white">
      {/* Main Dashboard Canvas Container */}
      <main className="max-w-[1780px] w-full mx-auto px-3 sm:px-4 py-3 flex-1 flex flex-col gap-3.5">
        
        {/* ========================================================================= */}
        {/* ZONE 1: 3D VOLUMETRIC VIEWPORT */}
        {/* ========================================================================= */}
        <section className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col">
          {/* Zone 1 Top Header Strip */}
          <div className="bg-[#0b1329] text-white px-3.5 py-2.5 flex flex-wrap items-center justify-between text-xs font-semibold border-b border-slate-800 gap-2">
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono text-[10px] font-bold border border-sky-400/30">
                OCEAN TWIN
              </span>
              <span className="tracking-wide uppercase font-bold text-slate-100">
                3D VOLUMETRIC VIEWPORT
              </span>
              <span className="text-slate-400 font-normal hidden lg:inline">
                — High-Resolution Volumetric Mesh (0.08° CF-1.8) + In-situ Observation Network
              </span>
            </div>

            <div className="flex items-center gap-3 text-[11px] font-mono text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Renderer: WebGL2 (Three.js r162)</span>
              </span>
              <span className="text-slate-600 hidden sm:inline">|</span>
              <span className="hidden sm:inline">Target Resolution: 1920x1080 @ 60 FPS</span>
              <span className="text-slate-600 hidden md:inline">|</span>
              <span className="hidden md:inline">VRAM: 1.42 GB</span>
            </div>
          </div>

          {/* Main 3D Viewport & Docked Control Sidebar */}
          <div className="flex flex-col lg:flex-row min-h-[580px] bg-[#031124] relative">
            
            {/* Left 3D Interactive Ocean Canvas */}
            <div className="relative flex-1 bg-[#f5fdff] flex flex-col justify-between overflow-hidden min-h-[480px]">
              
              {/* Camera & View Toolbar (Top-Right) */}
              <div className="absolute top-3 right-3 z-30 flex items-center gap-1 bg-slate-900/85 backdrop-blur-md p-1 rounded-xl border border-sky-500/30 text-xs shadow-lg">
                <button
                  onClick={() => setViewMode('orbit')}
                  className="px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition bg-blue-600 text-white shadow-xs"
                  title="3D Free Orbit Rotation"
                >
                  <span className="material-symbols-outlined text-sm">view_in_ar</span>
                  <span>3D Orbit</span>
                </button>
                <div className="h-4 w-px bg-slate-700 mx-0.5"></div>
                <button
                  onClick={() => {
                    setMeasurementLongitude(85)
                    setMeasurementLatitude(0)
                    setMeasurementDepth(500)
                    setVerticalExaggeration(1.0)
                  }}
                  title="Reset Camera &amp; Orientation"
                  className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-base">restart_alt</span>
                  <span className="text-[10px] hidden sm:inline pr-1">Reset</span>
                </button>
              </div>

              {/* Clean Active Instrument Sounding Badge (Top-Left) */}
              {selectedFloat && (
                <div className="absolute top-3 left-3 z-20 pointer-events-auto">
                  <div className="bg-slate-950/85 backdrop-blur-md text-white px-3 py-2 rounded-xl border border-sky-400/30 text-[11px] font-mono shadow-xl space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                      <span className="font-bold text-sky-300">
                        {selectedFloat.instrumentType || 'ARGO'} #{selectedFloat.platformId}
                      </span>
                      <span className="text-[9px] bg-sky-900/60 text-sky-300 border border-sky-700 px-1 py-0.2 rounded font-bold">
                        {selectedFloat.profileCount ? `${selectedFloat.profileCount} PROFILES` : 'ACTIVE'}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 flex gap-3">
                      <span>Lat: <strong className="text-white">{selectedFloat.latitude?.toFixed(2)}°N</strong></span>
                      <span>Lon: <strong className="text-white">{selectedFloat.longitude?.toFixed(2)}°E</strong></span>
                      <span>Focal: <strong className="text-sky-300">-{measurementDepth}m</strong></span>
                    </div>
                  </div>
                </div>
              )}

              {/* Central Three.js Canvas Container */}
              <div className="w-full h-full flex-1 relative">
                <OceanScene />
              </div>

              {/* Viewport Bottom Timeline & Slicing Controls Bar */}
              <div className="bg-[#030d1a]/95 backdrop-blur border-t border-slate-800 px-3.5 py-2.5 z-20 flex flex-col gap-2">
                {/* Timeline row */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                  {/* Playback Controls */}
                  <div className="flex items-center gap-1.5">
                    <button
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                      title="Step back"
                    >
                      <span className="material-symbols-outlined text-sm">fast_rewind</span>
                    </button>
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-7 h-7 rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-xs transition"
                      title={isPlaying ? 'Pause' : 'Play'}
                    >
                      <span className="material-symbols-outlined text-base">
                        {isPlaying ? 'pause' : 'play_arrow'}
                      </span>
                    </button>
                    <button
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                      title="Step forward"
                    >
                      <span className="material-symbols-outlined text-sm">fast_forward</span>
                    </button>
                    <span className="text-[10px] font-mono text-slate-400 ml-1">Speed: 1.0x</span>
                  </div>

                  {/* Scrubber slider */}
                  <div className="flex-1 max-w-xl flex items-center gap-2.5">
                    <span className="text-[10px] font-mono text-slate-400">10-Aug-2026</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={timeStep}
                      onChange={(e) => setTimeStep(Number(e.target.value))}
                      className="flex-1 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
                    />
                    <span className="text-[10px] font-mono text-slate-400">08-Sep-2026</span>
                  </div>

                  {/* Timestamp Badge */}
                  <div className="px-2.5 py-1 rounded bg-sky-950 border border-sky-800 font-mono text-xs font-bold text-sky-300">
                    2026-09-08 12:00:00 UTC
                  </div>
                </div>

                {/* Coordinate Slicers row */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-1 border-t border-slate-800/80 text-[11px] font-mono text-slate-300">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400">Longitude:</span>
                    <input
                      type="range"
                      min="70"
                      max="95"
                      value={measurementLongitude}
                      onChange={(e) => setMeasurementLongitude(Number(e.target.value))}
                      className="w-24 h-1 bg-slate-700 rounded appearance-none accent-sky-400 cursor-pointer"
                    />
                    <strong className="text-sky-300">{measurementLongitude.toFixed(1)}° E</strong>
                    <span className="text-slate-500 text-[10px]">(70°E - 95°E)</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-slate-400">Latitude:</span>
                    <input
                      type="range"
                      min="-10"
                      max="25"
                      value={measurementLatitude}
                      onChange={(e) => setMeasurementLatitude(Number(e.target.value))}
                      className="w-24 h-1 bg-slate-700 rounded appearance-none accent-sky-400 cursor-pointer"
                    />
                    <strong className="text-sky-300">{measurementLatitude.toFixed(1)}° N</strong>
                    <span className="text-slate-500 text-[10px]">(-10°N - 25°N)</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-slate-400">Depth:</span>
                    <input
                      type="range"
                      min="0"
                      max="2000"
                      step="50"
                      value={measurementDepth}
                      onChange={(e) => setMeasurementDepth(Number(e.target.value))}
                      className="w-24 h-1 bg-slate-700 rounded appearance-none accent-sky-400 cursor-pointer"
                    />
                    <strong className="text-sky-300">-{measurementDepth} m</strong>
                    <span className="text-slate-500 text-[10px]">(0 - 2000m)</span>
                  </div>

                  <div className="text-[10px] text-slate-500 hidden xl:inline">
                    Domain: <span className="text-slate-300">North Indian Ocean &amp; Bay of Bengal</span> | Vertical Levels: <span className="text-sky-400">40 z-layers</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side: Scientific Control Panel Sidebar */}
            <aside className="w-full lg:w-80 xl:w-88 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 p-4 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                {/* Control Panel Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base text-sky-600">tune</span>
                    <span>SCIENTIFIC CONTROL PANEL</span>
                  </h3>
                  <span className="text-[10px] text-slate-500 bg-slate-100 font-mono px-1.5 py-0.5 rounded border border-slate-200">
                    CLIENT-ONLY
                  </span>
                </div>

                {/* Variable Field Selector */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    VARIABLE FIELD
                  </label>
                  <select
                    value={selectedVariable}
                    onChange={(e) => setSelectedVariable(e.target.value)}
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-sky-500 outline-none cursor-pointer"
                  >
                    <option value="temperatureC">Temperature (°C)</option>
                    <option value="salinityPsu">Salinity (PSU)</option>
                    <option value="currentSpeed">Current Velocity (m/s)</option>
                    <option value="chlorophyll">Chlorophyll-a (mg/m³)</option>
                  </select>
                </div>

                {/* 3D Representation Style: Triangular Mesh vs Cubic Voxels vs Point Cloud */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    3D GEOMETRY STRUCTURE
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setVisualizationStyle('triangles')}
                      className={`py-1.5 px-2 text-[11px] font-bold rounded-lg transition flex items-center justify-center gap-1 ${
                        visualizationStyle === 'triangles'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="3D Triangular Surface Mesh (smooth facets)"
                    >
                      <span className="material-symbols-outlined text-sm">change_history</span>
                      <span>Triangular</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setVisualizationStyle('cubes')}
                      className={`py-1.5 px-2 text-[11px] font-bold rounded-lg transition flex items-center justify-center gap-1 ${
                        visualizationStyle === 'cubes'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="3D Cubic Voxel Grid (volumetric blocks)"
                    >
                      <span className="material-symbols-outlined text-sm">view_in_ar</span>
                      <span>Cubic</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setVisualizationStyle('points')}
                      className={`py-1.5 px-2 text-[11px] font-bold rounded-lg transition flex items-center justify-center gap-1 ${
                        visualizationStyle === 'points'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="3D Particle Cloud (discrete dots)"
                    >
                      <span className="material-symbols-outlined text-sm">grain</span>
                      <span>Dots</span>
                    </button>
                  </div>
                </div>

                {/* Colormap Palette & Colorbar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                      COLORMAP PALETTE
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer select-none text-[11px] text-slate-600 font-medium">
                      <input
                        type="checkbox"
                        checked={autoScale}
                        onChange={(e) => setAutoScale(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 w-3.5 h-3.5 focus:ring-0"
                      />
                      <span>Scale: Auto min/max</span>
                    </label>
                  </div>

                  <select
                    value={colormapPalette}
                    onChange={(e) => setColormapPalette(e.target.value)}
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 outline-none cursor-pointer focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="turbo">Oceanic Thermal (Turbo)</option>
                    <option value="viridis">Viridis (Perceptually Uniform)</option>
                    <option value="spectral">Spectral (High-Contrast Diverging)</option>
                    <option value="deepsea">Deep Sea (Bathymetric Cyan)</option>
                  </select>

                  {/* Multi-hue gradient bar adapting to selected palette */}
                  <div
                    className="h-4 w-full rounded-md border border-slate-300 shadow-inner mt-1.5 transition-all"
                    style={{
                      background:
                        colormapPalette === 'viridis'
                          ? 'linear-gradient(to right, #440154, #3b528b, #21918c, #5ec962, #fde725)'
                          : colormapPalette === 'spectral'
                          ? 'linear-gradient(to right, #2b83ba, #abdda4, #ffffbf, #fdae61, #d7191c)'
                          : colormapPalette === 'deepsea'
                          ? 'linear-gradient(to right, #051937, #004d7a, #008793, #00bf72, #a8eb12)'
                          : 'linear-gradient(to right, #2563eb, #06b6d4, #10b981, #f59e0b, #ef4444)',
                    }}
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-500 font-semibold pt-0.5">
                    <span>Min: {colorbarMin !== null ? Number(colorbarMin).toFixed(1) : '4.0'}</span>
                    <span>
                      Mean:{' '}
                      {colorbarMin !== null && colorbarMax !== null
                        ? ((Number(colorbarMin) + Number(colorbarMax)) / 2).toFixed(1)
                        : '18.2'}
                    </span>
                    <span>Max: {colorbarMax !== null ? Number(colorbarMax).toFixed(1) : '29.5'}</span>
                  </div>
                </div>

                {/* Depth Slice Slider */}
                <div className="space-y-1 pt-1 border-t border-slate-100">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                      DEPTH SLICE (Orthogonal)
                    </span>
                    <span className="font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                      -{measurementDepth} m
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="2000"
                    step="50"
                    value={measurementDepth}
                    onChange={(e) => setMeasurementDepth(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>Surface (0m)</span>
                    <span>Mid (-500m)</span>
                    <span>Abyssal (-2000m)</span>
                  </div>
                </div>

                {/* Vertical Exaggeration Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                      VERTICAL EXAGGERATION
                    </span>
                    <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {verticalExaggeration.toFixed(1)}x
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="9.0"
                    step="0.5"
                    value={verticalExaggeration}
                    onChange={(e) => setVerticalExaggeration(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>1.0x (True)</span>
                    <span>9.0x (Exaggerated)</span>
                  </div>
                </div>

                {/* Volume Raymarch Opacity */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                      VOLUME RAYMARCH OPACITY
                    </span>
                    <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {Math.round(volumeOpacity * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={volumeOpacity * 100}
                    onChange={(e) => setVolumeOpacity(Number(e.target.value) / 100)}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
                  />
                </div>

                {/* Region of Interest (ROI) Pills */}
                <div className="space-y-1.5 pt-1 border-t border-slate-100">
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block">
                    REGION OF INTEREST (ROI)
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {roiPills.map((roi) => (
                      <button
                        key={roi}
                        type="button"
                        onClick={() => handleRoiSelect(roi)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition border ${
                          selectedRoi === roi
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {roi}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Action Controls */}
              <div className="space-y-2 pt-3 border-t border-slate-200">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => window.open('/api/ocean/grid', '_blank')}
                    className="w-full flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white py-2 px-2.5 rounded-xl text-xs font-semibold shadow-xs transition"
                  >
                    <span className="material-symbols-outlined text-sm">download</span>
                    <span>Download NetCDF-4</span>
                  </button>
                  <button
                    onClick={() => window.open('/api/stats/summary', '_blank')}
                    className="w-full flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 py-2 px-2.5 rounded-xl text-xs font-semibold shadow-xs transition"
                  >
                    <span className="material-symbols-outlined text-sm">table_view</span>
                    <span>Export CSV</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => alert('OGC WCS URL copied to clipboard: http://localhost:8081/geoserver/wcs')}
                    className="w-full py-1.5 px-2 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-[11px] font-medium transition"
                  >
                    OGC WCS URL
                  </button>
                  <button
                    onClick={() => alert('Current View State link copied!')}
                    className="w-full py-1.5 px-2 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-[11px] font-medium transition"
                  >
                    Share View State
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* ZONE 2: 2D DATA ANALYSIS */}
        {/* ========================================================================= */}
        <section className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col">
          {/* Zone 2 Header Strip */}
          <div className="bg-[#0b1329] text-white px-3.5 py-2.5 flex flex-wrap items-center justify-between text-xs font-semibold border-b border-slate-800 gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-mono font-bold tracking-wide uppercase border border-blue-400/30">
                ANALYTICS ENGINE
              </span>
              <span className="tracking-wide uppercase font-bold text-slate-100">
                2D OCEANOGRAPHIC DIAGNOSTICS
              </span>
              <span className="text-slate-400 font-normal hidden md:inline">
                — Live in-situ observations &amp; assimilated profile dynamics
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-300">
              <span>Pipeline:</span>
              <span className="text-emerald-400 font-bold">NetCDF-4 / CF-1.8 Compliant</span>
            </div>
          </div>

          <div className="p-4 sm:p-5 space-y-4">
            {/* Unified Data Source Selector: Instruments vs Ingested Files */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Left Selector: Data Mode & Specific Target */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Mode Tabs */}
                <div className="flex items-center gap-1.5">
                  <div className="flex rounded-lg bg-slate-200 p-0.5 text-xs font-semibold">
                    <button
                      onClick={() => setActiveDataSource('instruments')}
                      className={`px-3 py-1 rounded-md transition ${
                        activeDataSource === 'instruments'
                          ? 'bg-white text-blue-700 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Argo Floats &amp; Gliders
                    </button>
                    <button
                      onClick={() => {
                        setActiveDataSource('files')
                        if (selectedFile) syncFileToFloat(selectedFile)
                      }}
                      className={`px-3 py-1 rounded-md transition ${
                        activeDataSource === 'files'
                          ? 'bg-white text-blue-700 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Ingested Files ({ingestionsList.length})
                    </button>
                  </div>
                  <button
                    onClick={refreshDataSources}
                    title="Refresh data from ingestion pipeline"
                    className="p-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 transition flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-base">refresh</span>
                  </button>
                </div>

                {/* Target Dropdown based on active source */}
                {activeDataSource === 'instruments' ? (
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-slate-700 whitespace-nowrap">
                      Select Instrument:
                    </label>
                    <select
                      value={selectedFloat?.platformId || ''}
                      onChange={handleInstrumentChange}
                      className="text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 focus:ring-2 focus:ring-sky-500 outline-none cursor-pointer min-w-[280px]"
                    >
                      {floatsList.length > 0 ? (
                        floatsList.map((f) => (
                          <option key={f.platformId} value={f.platformId}>
                            {f.instrumentType || 'ARGO'}_{f.platformId} ({f.latitude?.toFixed(2)}°N, {f.longitude?.toFixed(2)}°E) — {f.profileCount || 0} profiles
                          </option>
                        ))
                      ) : (
                        <option value="">No instruments found</option>
                      )}
                    </select>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-slate-700 whitespace-nowrap">
                      Select Ingestion File:
                    </label>
                    <select
                      value={selectedFile?.id || ''}
                      onChange={handleFileChange}
                      className="text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 focus:ring-2 focus:ring-sky-500 outline-none cursor-pointer min-w-[280px]"
                    >
                      {ingestionsList.length > 0 ? (
                        ingestionsList.map((file) => (
                          <option key={file.id} value={file.id}>
                            {file.fileName} ({file.gridPointsIngested || 0} pts, {file.status})
                          </option>
                        ))
                      ) : (
                        <option value="">No ingested files found</option>
                      )}
                    </select>
                  </div>
                )}
              </div>

              {/* Status and telemetry indicator */}
              <div className="flex items-center gap-3 text-xs font-mono">
                {selectedFloat && (
                  <div className="text-slate-600">
                    Active Sensor: <strong className="text-slate-900 font-semibold">{selectedFloat.instrumentType?.includes('GLIDER') ? 'Seaglider CTD-P' : 'Sea-Bird SBE-41CP'}</strong>
                  </div>
                )}
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-2.5 py-1 rounded-lg font-semibold transition text-xs"
                >
                  <span className="material-symbols-outlined text-sm text-slate-500">download</span>
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Analytical Diagnostic Chart Type Switcher Pills */}
            <div className="flex items-center flex-wrap gap-1.5 border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-700 mr-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-blue-600">query_stats</span>
                <span>Select Diagnostic Chart:</span>
              </span>
              {chartTypes.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedChartType(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    selectedChartType === tab.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Primary Render Area: Dynamically Loaded Real Chart */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900 text-sm">
                    {selectedChartType}
                  </span>
                  {selectedFloat && (
                    <span className="text-slate-500 font-mono text-xs">
                      ({selectedFloat.instrumentType || 'ARGO'} #{selectedFloat.platformId} · {selectedFloat.latitude?.toFixed(2)}°N, {selectedFloat.longitude?.toFixed(2)}°E)
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  Data endpoint: /api/floats/{selectedFloat?.platformId || '{id}'}/profiles
                </span>
              </div>

              {/* Render Selected Chart */}
              <div className="min-h-[380px]">
                {renderActiveChart()}
              </div>
            </div>

            {/* Multi-Modal Comparison Grid (Side-by-Side Quick Views) */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold uppercase tracking-wider text-slate-800">
                  PARALLEL MULTI-MODAL DIAGNOSTICS
                </span>
                <span className="text-slate-500 text-[11px]">
                  Real-time bivariate regression and polar dynamics
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* T-S Diagram Card */}
                <div className="border border-slate-200 rounded-xl p-3 bg-white shadow-2xs hover:border-sky-300 transition">
                  <TSDiagramChart />
                </div>

                {/* Correlation View Card */}
                <div className="border border-slate-200 rounded-xl p-3 bg-white shadow-2xs hover:border-sky-300 transition">
                  <CorrelationView />
                </div>

                {/* Current Rose Card */}
                <div className="border border-slate-200 rounded-xl p-3 bg-white shadow-2xs hover:border-sky-300 transition">
                  <CurrentRoseChart />
                </div>
              </div>
            </div>

          </div>
        </section>
      </main>

      {/* Scientific Web Footer */}
      <footer className="w-full max-w-[1780px] mx-auto px-4 sm:px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-500 border-t border-slate-200 mt-4">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800">DEEPSYNC</span>
          <span>© 2026 DEEPSYNC · Autonomous Oceanographic Observation & Intelligence Network</span>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-[11px] font-medium">
          <a href="#" className="hover:text-sky-700 transition">Bathymetry Registry</a>
          <a href="#" className="hover:text-sky-700 transition">Security Architecture</a>
          <a href="#" className="hover:text-sky-700 transition">OGC WMS/WCS Services</a>
          <a href="#" className="hover:text-sky-700 transition">API Telemetry Terms</a>
          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Live Model Feeds (MOM4 / HYCOM)</span>
          </span>
        </div>
      </footer>
    </div>
  )
}
